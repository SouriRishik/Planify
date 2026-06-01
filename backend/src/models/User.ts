import db from '../config/database';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  created_at: string;
}

export const UserModel = {
  async create(name: string, email: string, password: string): Promise<IUser> {
    const hashed = bcrypt.hashSync(password, 10);
    const res = await db.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
      [name, email, hashed],
    );
    return res.rows[0] as IUser;
  },

  async findByEmail(email: string): Promise<IUser | undefined> {
    const res = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    return res.rows[0] as IUser | undefined;
  },

  async findById(id: number): Promise<IUser | undefined> {
    const res = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    return res.rows[0] as IUser | undefined;
  },

  verifyPassword(plain: string, hashed: string): boolean {
    return bcrypt.compareSync(plain, hashed);
  },

  async updatePassword(email: string, newPassword: string): Promise<boolean> {
    const hashed = bcrypt.hashSync(newPassword, 10);
    const res = await db.query('UPDATE users SET password = $1 WHERE email = $2', [hashed, email]);
    return (res.rowCount || 0) > 0;
  },
};
