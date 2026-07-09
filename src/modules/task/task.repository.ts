import { pool, dbQuery } from '../../config/database.js';
import { Task } from './task.types.js';

export class TaskRepository {
  private static inMemoryTasks: Map<number, Task> = new Map();
  private static memoryIdCounter = 1;

  private async isDbConnected(): Promise<boolean> {
    try {
      const client = await pool.connect();
      client.release();
      return true;
    } catch {
      return false;
    }
  }

  async create(title: string, description?: string, status?: string): Promise<Task> {
    const dbConnected = await this.isDbConnected();
    if (!dbConnected) {
      const task: Task = {
        id: TaskRepository.memoryIdCounter++,
        title,
        description: description || null,
        status: (status as any) || 'pending',
        created_at: new Date(),
        updated_at: new Date(),
      };
      TaskRepository.inMemoryTasks.set(task.id, task);
      console.warn(`⚠️ [Repository] Database offline. Task saved in-memory (ID: ${task.id}).`);
      return task;
    }

    const query = `
      INSERT INTO showcase_tasks (title, description, status) 
      VALUES ($1, $2, $3) 
      RETURNING id, title, description, status, created_at, updated_at
    `;
    const rows = await dbQuery<Task>(query, [title, description || null, status || 'pending']);
    return rows[0];
  }

  async getAll(): Promise<Task[]> {
    const dbConnected = await this.isDbConnected();
    if (!dbConnected) {
      console.warn('⚠️ [Repository] Database offline. Returning in-memory tasks.');
      return Array.from(TaskRepository.inMemoryTasks.values());
    }

    const query = 'SELECT id, title, description, status, created_at, updated_at FROM showcase_tasks ORDER BY created_at DESC';
    return await dbQuery<Task>(query);
  }

  async getById(id: number): Promise<Task | null> {
    const dbConnected = await this.isDbConnected();
    if (!dbConnected) {
      return TaskRepository.inMemoryTasks.get(id) || null;
    }

    const query = 'SELECT id, title, description, status, created_at, updated_at FROM showcase_tasks WHERE id = $1';
    const rows = await dbQuery<Task>(query, [id]);
    return rows[0] || null;
  }

  async update(id: number, updates: Partial<Pick<Task, 'title' | 'description' | 'status'>>): Promise<Task | null> {
    const dbConnected = await this.isDbConnected();
    if (!dbConnected) {
      const existing = TaskRepository.inMemoryTasks.get(id);
      if (!existing) return null;
      const updated = {
        ...existing,
        ...updates,
        updated_at: new Date(),
      };
      TaskRepository.inMemoryTasks.set(id, updated);
      return updated;
    }

    // Defensa en profundidad: solo se permiten columnas conocidas en el SET,
    // aunque llegara un objeto con claves extra (mass-assignment).
    const ALLOWED_UPDATE_FIELDS = ['title', 'description', 'status'];
    const keys = Object.keys(updates).filter((k) => ALLOWED_UPDATE_FIELDS.includes(k));
    if (keys.length === 0) return this.getById(id);

    const setClause = keys.map((key, index) => `${key} = $${index + 2}`).join(', ');
    const values = keys.map((key) => (updates as Record<string, unknown>)[key]);

    const query = `
      UPDATE showcase_tasks 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $1 
      RETURNING id, title, description, status, created_at, updated_at
    `;
    const rows = await dbQuery<Task>(query, [id, ...values]);
    return rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const dbConnected = await this.isDbConnected();
    if (!dbConnected) {
      return TaskRepository.inMemoryTasks.delete(id);
    }

    const query = 'DELETE FROM showcase_tasks WHERE id = $1';
    const res = await pool.query(query, [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
export const taskRepository = new TaskRepository();
