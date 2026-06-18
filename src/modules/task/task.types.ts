import { z } from 'zod';

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string({
      required_error: 'Title is required',
    }).min(3, 'Title must be at least 3 characters long').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  }),
});

export const updateTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a positive integer'),
  }),
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).optional(),
  }),
});

export const getTaskSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, 'ID must be a positive integer'),
  }),
});
