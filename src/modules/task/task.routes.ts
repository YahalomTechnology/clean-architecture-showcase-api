import { Router } from 'express';
import { taskController } from './task.controller.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { createTaskSchema, updateTaskSchema, getTaskSchema } from './task.types.js';

const router = Router();

router.post(
  '/',
  validateRequest(createTaskSchema),
  taskController.create.bind(taskController)
);

router.get(
  '/',
  taskController.getAll.bind(taskController)
);

router.get(
  '/:id',
  validateRequest(getTaskSchema),
  taskController.getById.bind(taskController)
);

router.patch(
  '/:id',
  validateRequest(updateTaskSchema),
  taskController.update.bind(taskController)
);

router.delete(
  '/:id',
  validateRequest(getTaskSchema),
  taskController.delete.bind(taskController)
);

export const taskRouter = router;
