import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProjectModel } from '../models/Project';

export const projectController = {
  async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const projects = await ProjectModel.findAllByUser(req.userId!);
      res.json(projects);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch projects.' });
    }
  },

  async getOne(req: AuthRequest, res: Response): Promise<void> {
    try {
      const project = await ProjectModel.findById(Number(req.params.id), req.userId!);
      if (!project) { res.status(404).json({ error: 'Project not found.' }); return; }
      res.json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to fetch project.' });
    }
  },

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name) { res.status(400).json({ error: 'Project name is required.' }); return; }
      const project = await ProjectModel.create(name, description || '', req.userId!);
      res.status(201).json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to create project.' });
    }
  },

  async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      if (!name) { res.status(400).json({ error: 'Project name is required.' }); return; }

      const project = await ProjectModel.update(Number(req.params.id), name, description || '', req.userId!);
      if (!project) { res.status(404).json({ error: 'Project not found.' }); return; }
      res.json(project);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to update project.' });
    }
  },

  async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ok = await ProjectModel.delete(Number(req.params.id), req.userId!);
      if (!ok) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json({ message: 'Project deleted successfully.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Failed to delete project.' });
    }
  },
};
