import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { JWT_SECRET, AuthRequest } from '../middleware/auth';

export const authController = {
  signup(req: Request, res: Response): void {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required.' });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ error: 'Password must be at least 6 characters.' });
        return;
      }
      if (UserModel.findByEmail(email)) {
        res.status(409).json({ error: 'Email is already registered.' });
        return;
      }

      const user = UserModel.create(name, email, password);
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

      res.status(201).json({
        user: { id: user.id, name: user.name, email: user.email },
        token,
      });
    } catch {
      res.status(500).json({ error: 'Server error during signup.' });
    }
  },

  login(req: Request, res: Response): void {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required.' });
        return;
      }

      const user = UserModel.findByEmail(email);
      if (!user || !UserModel.verifyPassword(password, user.password)) {
        res.status(401).json({ error: 'Invalid email or password.' });
        return;
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      res.json({
        user: { id: user.id, name: user.name, email: user.email },
        token,
      });
    } catch {
      res.status(500).json({ error: 'Server error during login.' });
    }
  },

  me(req: AuthRequest, res: Response): void {
    try {
      const user = UserModel.findById(req.userId!);
      if (!user) {
        res.status(404).json({ error: 'User not found.' });
        return;
      }
      res.json({ id: user.id, name: user.name, email: user.email });
    } catch {
      res.status(500).json({ error: 'Server error.' });
    }
  },
};
