import { Request, Response, NextFunction } from 'express';
import { taskService } from './task.service.js';

export class TaskController {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { title, description, status } = req.body;
      const task = await taskService.createTask(title, description, status);
      res.status(201).json(task);
    } catch (err) {
      next(err);
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tasks = await taskService.getAllTasks();
      res.status(200).json(tasks);
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const task = await taskService.getTaskById(id);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const updates = req.body;
      const task = await taskService.updateTask(id, updates);
      res.status(200).json(task);
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await taskService.deleteTask(id);
      res.status(200).json({ success: true, message: `Task ${id} has been deleted successfully.` });
    } catch (err) {
      next(err);
    }
  }
}

export const taskController = new TaskController();
