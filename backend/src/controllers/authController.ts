import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { UserModel } from '../models/User';
import { JWT_SECRET, AuthRequest } from '../middleware/auth';
import db from '../config/database';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
  },
});

async function sendWelcomeEmail(toEmail: string, name: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"Planify" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: 'Welcome to Planify – Registration Successful!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 2rem; border: 1px solid #e5e7eb; border-radius: 12px;">
          <h1 style="color: #4f46e5; text-align: center; letter-spacing: 2px;">PLANIFY</h1>
          <p>Hi <strong>${name}</strong>,</p>
          <p>Welcome to <strong>Planify</strong>! Your account has been successfully registered.</p>
          <p>You can now log in and start managing your projects and tasks.</p>
          <br/>
          <p style="color: #6b7280; font-size: 0.85rem;">– The Planify Team</p>
        </div>
      `,
    });
    console.log(`Welcome email sent to ${toEmail}`);
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }
}

export const authController = {
  signup(req: Request, res: Response): void {
    (async () => {
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
        if (await UserModel.findByEmail(email)) {
          res.status(409).json({ error: 'Email is already registered.' });
          return;
        }

        const user = await UserModel.create(name, email, password);
        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

        // Send welcome email (non-blocking)
        if (email.endsWith('@gmail.com')) {
          sendWelcomeEmail(email, name);
        }

        res.status(201).json({
          user: { id: user.id, name: user.name, email: user.email },
          token,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during signup.' });
      }
    })();
  },

  login(req: Request, res: Response): void {
    (async () => {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          res.status(400).json({ error: 'Email and password are required.' });
          return;
        }

        const user = await UserModel.findByEmail(email);
        if (!user || !UserModel.verifyPassword(password, user.password)) {
          res.status(401).json({ error: 'Invalid email or password.' });
          return;
        }

        const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
          user: { id: user.id, name: user.name, email: user.email },
          token,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login.' });
      }
    })();
  },

  me(req: AuthRequest, res: Response): void {
    (async () => {
      try {
        const user = await UserModel.findById(req.userId!);
        if (!user) {
          res.status(404).json({ error: 'User not found.' });
          return;
        }
        res.json({ id: user.id, name: user.name, email: user.email });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
      }
    })();
  },

  forgotPassword(req: Request, res: Response): void {
    (async () => {
      try {
        const { email } = req.body;
        if (!email) {
          res.status(400).json({ error: 'Email is required.' });
          return;
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
          res.status(404).json({ error: 'No account found with this email.' });
          return;
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Expire in 10 minutes
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

        // Invalidate any previous OTPs for this email
        await db.query('UPDATE password_resets SET used = TRUE WHERE email = $1 AND used = FALSE', [email]);

        // Store OTP
        await db.query('INSERT INTO password_resets (email, otp, expires_at) VALUES ($1, $2, $3)', [email, otp, expiresAt]);

        // Send OTP email
        transporter.sendMail({
          from: `"Planify" <${process.env.EMAIL_USER}>`,
          to: email,
          subject: 'Planify – Password Reset OTP',
          html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 2rem; border: 1px solid #e5e7eb; border-radius: 12px;">
            <h1 style="color: #4f46e5; text-align: center; letter-spacing: 2px;">PLANIFY</h1>
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>You requested a password reset. Use the OTP below to verify your identity:</p>
            <div style="text-align: center; margin: 1.5rem 0;">
              <span style="display: inline-block; font-size: 2rem; font-weight: 700; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 0.75rem 1.5rem; border-radius: 8px;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 0.85rem;">This code expires in <strong>10 minutes</strong>. If you didn't request this, ignore this email.</p>
            <br/>
            <p style="color: #6b7280; font-size: 0.85rem;">– The Planify Team</p>
          </div>
        `,
        }).catch((err) => console.error('Failed to send OTP email:', err));

        res.json({ message: 'OTP sent to your email.' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error sending OTP.' });
      }
    })();
  },

  verifyOtp(req: Request, res: Response): void {
    (async () => {
      try {
        const { email, otp } = req.body;
        if (!email || !otp) {
          res.status(400).json({ error: 'Email and OTP are required.' });
          return;
        }

        const recRes = await db.query(
          'SELECT * FROM password_resets WHERE email = $1 AND otp = $2 AND used = FALSE ORDER BY created_at DESC LIMIT 1',
          [email, otp],
        );
        const record = recRes.rows[0] as any;

        if (!record) {
          res.status(400).json({ error: 'Invalid OTP.' });
          return;
        }

        if (new Date(record.expires_at) < new Date()) {
          await db.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [record.id]);
          res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
          return;
        }

        // Mark OTP as used
        await db.query('UPDATE password_resets SET used = TRUE WHERE id = $1', [record.id]);

        res.json({ message: 'OTP verified successfully.' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error verifying OTP.' });
      }
    })();
  },

  resetPassword(req: Request, res: Response): void {
    (async () => {
      try {
        const { email, password } = req.body;
        if (!email || !password) {
          res.status(400).json({ error: 'Email and new password are required.' });
          return;
        }
        if (password.length < 6) {
          res.status(400).json({ error: 'Password must be at least 6 characters.' });
          return;
        }

        const user = await UserModel.findByEmail(email);
        if (!user) {
          res.status(404).json({ error: 'No account found with this email.' });
          return;
        }

        await UserModel.updatePassword(email, password);
        res.json({ message: 'Password reset successfully.' });
      } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error resetting password.' });
      }
    })();
  },
};
