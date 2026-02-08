import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TaskModel } from '../models/Task';
import { ProjectModel } from '../models/Project';

export const taskController = {
  getAll(req: AuthRequest, res: Response): void {
    try {
      const filters = {
        priority: req.query.priority as string,
        status: req.query.status as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc',
      };
      res.json(TaskModel.findAllByUser(req.userId!, filters));
    } catch {
      res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
  },

  getStats(req: AuthRequest, res: Response): void {
    try {
      res.json(TaskModel.getStats(req.userId!));
    } catch {
      res.status(500).json({ error: 'Failed to fetch stats.' });
    }
  },

  getByProject(req: AuthRequest, res: Response): void {
    try {
      const projectId = Number(req.params.projectId);
      if (!ProjectModel.findById(projectId, req.userId!)) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }

      const filters = {
        priority: req.query.priority as string,
        status: req.query.status as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc',
      };
      res.json(TaskModel.findByProject(projectId, req.userId!, filters));
    } catch {
      res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
  },

  create(req: AuthRequest, res: Response): void {
    try {
      const projectId = Number(req.params.projectId);
      if (!ProjectModel.findById(projectId, req.userId!)) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }

      const { title, description, priority, status, due_date } = req.body;
      if (!title) { res.status(400).json({ error: 'Task title is required.' }); return; }

      const task = TaskModel.create({
        title,
        description: description || '',
        priority: priority || 'medium',
        status: status || 'todo',
        due_date: due_date || null,
        project_id: projectId,
        user_id: req.userId!,
      });
      res.status(201).json(task);
    } catch {
      res.status(500).json({ error: 'Failed to create task.' });
    }
  },

  update(req: AuthRequest, res: Response): void {
    try {
      const task = TaskModel.update(Number(req.params.id), req.userId!, req.body);
      if (!task) { res.status(404).json({ error: 'Task not found.' }); return; }
      res.json(task);
    } catch {
      res.status(500).json({ error: 'Failed to update task.' });
    }
  },

  delete(req: AuthRequest, res: Response): void {
    try {
      if (!TaskModel.delete(Number(req.params.id), req.userId!)) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.json({ message: 'Task deleted successfully.' });
    } catch {
      res.status(500).json({ error: 'Failed to delete task.' });
    }
  },
};
