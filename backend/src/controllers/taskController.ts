import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { TaskModel } from '../models/Task';
import { ProjectModel } from '../models/Project';

export const taskController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const filters = {
        priority: req.query.priority as string,
        status: req.query.status as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc',
      };
      const tasks = await TaskModel.findAllByUser(req.userId!, filters);
      res.json(tasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
  },

  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const stats = await TaskModel.getStats(req.userId!);
      res.json(stats);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch stats.' });
    }
  },

  async getByProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const projectId = Number(req.params.projectId);
      if (!(await ProjectModel.findById(projectId, req.userId!))) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }

      const filters = {
        priority: req.query.priority as string,
        status: req.query.status as string,
        sort_by: req.query.sort_by as string,
        sort_order: req.query.sort_order as 'asc' | 'desc',
      };
      const tasks = await TaskModel.findByProject(projectId, req.userId!, filters);
      res.json(tasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch tasks.' });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const projectId = Number(req.params.projectId);
      if (!(await ProjectModel.findById(projectId, req.userId!))) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }

      const { title, description, priority, status, due_date } = req.body;
      if (!title) { res.status(400).json({ error: 'Task title is required.' }); return; }

      const task = await TaskModel.create({
        title,
        description: description || '',
        priority: priority || 'medium',
        status: status || 'todo',
        due_date: due_date || null,
        project_id: projectId,
        user_id: req.userId!,
      });
      res.status(201).json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create task.' });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const task = await TaskModel.update(Number(req.params.id), req.userId!, req.body);
      if (!task) { res.status(404).json({ error: 'Task not found.' }); return; }
      res.json(task);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update task.' });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ok = await TaskModel.delete(Number(req.params.id), req.userId!);
      if (!ok) {
        res.status(404).json({ error: 'Task not found.' });
        return;
      }
      res.json({ message: 'Task deleted successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete task.' });
    }
  },
};
