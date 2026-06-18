import { taskRepository } from './task.repository.js';
import { Task } from './task.types.js';
import { cache } from '../../config/redis.js';
import { broadcastToChannel } from '../../config/sockets.js';
import { NotFoundError } from '../../core/errors/CustomError.js';

export class TaskService {
  private CACHE_KEY_PREFIX = 'showcase:task:';
  private ALL_TASKS_CACHE_KEY = 'showcase:tasks:all';

  async createTask(title: string, description?: string, status?: string): Promise<Task> {
    const task = await taskRepository.create(title, description, status);
    
    // Invalidate list cache
    await cache.del(this.ALL_TASKS_CACHE_KEY);
    
    // Broadcast real-time event to channel "tasks"
    broadcastToChannel('tasks', 'task_created', task);
    
    return task;
  }

  async getAllTasks(): Promise<Task[]> {
    // Attempt cache read
    const cachedTasks = await cache.get(this.ALL_TASKS_CACHE_KEY);
    if (cachedTasks) {
      console.log('⚡ [Cache] Cache HIT for get_all_tasks.');
      return JSON.parse(cachedTasks);
    }

    console.log('⚡ [Cache] Cache MISS for get_all_tasks. Fetching from repository.');
    const tasks = await taskRepository.getAll();
    
    // Write cache
    await cache.set(this.ALL_TASKS_CACHE_KEY, JSON.stringify(tasks), 300); // 5 min TTL
    
    return tasks;
  }

  async getTaskById(id: number): Promise<Task> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}${id}`;
    const cachedTask = await cache.get(cacheKey);
    if (cachedTask) {
      console.log(`⚡ [Cache] Cache HIT for task_${id}.`);
      return JSON.parse(cachedTask);
    }

    const task = await taskRepository.getById(id);
    if (!task) {
      throw new NotFoundError(`Task with ID ${id} not found.`);
    }

    await cache.set(cacheKey, JSON.stringify(task), 600); // 10 min TTL
    return task;
  }

  async updateTask(id: number, updates: Partial<Pick<Task, 'title' | 'description' | 'status'>>): Promise<Task> {
    // Verify existence
    await this.getTaskById(id);

    const updatedTask = await taskRepository.update(id, updates);
    if (!updatedTask) {
      throw new NotFoundError(`Task with ID ${id} could not be updated.`);
    }

    // Update caches
    await cache.set(`${this.CACHE_KEY_PREFIX}${id}`, JSON.stringify(updatedTask), 600);
    await cache.del(this.ALL_TASKS_CACHE_KEY);

    // Broadcast update
    broadcastToChannel('tasks', 'task_updated', updatedTask);

    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    // Verify existence
    await this.getTaskById(id);

    const deleted = await taskRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError(`Task with ID ${id} could not be deleted.`);
    }

    // Invalidate caches
    await cache.del(`${this.CACHE_KEY_PREFIX}${id}`);
    await cache.del(this.ALL_TASKS_CACHE_KEY);

    // Broadcast deletion
    broadcastToChannel('tasks', 'task_deleted', { id });
  }
}

export const taskService = new TaskService();
