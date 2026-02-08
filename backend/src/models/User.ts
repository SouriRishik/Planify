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
  create(name: string, email: string, password: string): IUser {
    const hashed = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    const result = stmt.run(name, email, hashed);
    return UserModel.findById(result.lastInsertRowid as number)!;
  },

  findByEmail(email: string): IUser | undefined {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as IUser | undefined;
  },

  findById(id: number): IUser | undefined {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as IUser | undefined;
  },

  verifyPassword(plain: string, hashed: string): boolean {
    return bcrypt.compareSync(plain, hashed);
  },
};
