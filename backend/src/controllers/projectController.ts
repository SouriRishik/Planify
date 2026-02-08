import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProjectModel } from '../models/Project';

export const projectController = {
  getAll(req: AuthRequest, res: Response): void {
    try {
      res.json(ProjectModel.findAllByUser(req.userId!));
    } catch {
      res.status(500).json({ error: 'Failed to fetch projects.' });
    }
  },

  getOne(req: AuthRequest, res: Response): void {
    try {
      const project = ProjectModel.findById(Number(req.params.id), req.userId!);
      if (!project) { res.status(404).json({ error: 'Project not found.' }); return; }
      res.json(project);
    } catch {
      res.status(500).json({ error: 'Failed to fetch project.' });
    }
  },

  create(req: AuthRequest, res: Response): void {
    try {
      const { name, description } = req.body;
      if (!name) { res.status(400).json({ error: 'Project name is required.' }); return; }
      res.status(201).json(ProjectModel.create(name, description || '', req.userId!));
    } catch {
      res.status(500).json({ error: 'Failed to create project.' });
    }
  },

  update(req: AuthRequest, res: Response): void {
    try {
      const { name, description } = req.body;
      if (!name) { res.status(400).json({ error: 'Project name is required.' }); return; }

      const project = ProjectModel.update(Number(req.params.id), name, description || '', req.userId!);
      if (!project) { res.status(404).json({ error: 'Project not found.' }); return; }
      res.json(project);
    } catch {
      res.status(500).json({ error: 'Failed to update project.' });
    }
  },

  delete(req: AuthRequest, res: Response): void {
    try {
      if (!ProjectModel.delete(Number(req.params.id), req.userId!)) {
        res.status(404).json({ error: 'Project not found.' });
        return;
      }
      res.json({ message: 'Project deleted successfully.' });
    } catch {
      res.status(500).json({ error: 'Failed to delete project.' });
    }
  },
};
