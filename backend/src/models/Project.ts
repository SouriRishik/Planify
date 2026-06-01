import db from '../config/database';

export interface IProject {
  id: number;
  name: string;
  description: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface IProjectWithProgress extends IProject {
  total_tasks: number;
  completed_tasks: number;
  progress: number;
}

const withProgress = (row: any): IProjectWithProgress => ({
  ...row,
  total_tasks: row.total_tasks || 0,
  completed_tasks: row.completed_tasks || 0,
  progress: row.total_tasks > 0
    ? Math.round(((row.completed_tasks || 0) / row.total_tasks) * 100)
    : 0,
});

export const ProjectModel = {
  async findAllByUser(userId: number): Promise<IProjectWithProgress[]> {
    const res = await db.query(`
      SELECT p.*,
             COUNT(t.id) as total_tasks,
             SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.user_id = $1
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `, [userId]);
    return res.rows.map(withProgress);
  },

  async findById(id: number, userId: number): Promise<IProjectWithProgress | undefined> {
    const res = await db.query(`
      SELECT p.*,
             COUNT(t.id) as total_tasks,
             SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.id = $1 AND p.user_id = $2
      GROUP BY p.id
    `, [id, userId]);
    const row = res.rows[0];
    return row ? withProgress(row) : undefined;
  },

  async create(name: string, description: string, userId: number): Promise<IProjectWithProgress> {
    const insert = await db.query(
      'INSERT INTO projects (name, description, user_id) VALUES ($1, $2, $3) RETURNING id',
      [name, description, userId],
    );
    const id = insert.rows[0].id as number;
    return ProjectModel.findById(id, userId) as Promise<IProjectWithProgress>;
  },

  async update(id: number, name: string, description: string, userId: number): Promise<IProjectWithProgress | undefined> {
    const res = await db.query(`
      UPDATE projects SET name = $1, description = $2, updated_at = NOW()
      WHERE id = $3 AND user_id = $4
    `, [name, description, id, userId]);
    return (res.rowCount || 0) > 0 ? ProjectModel.findById(id, userId) : undefined;
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const res = await db.query('DELETE FROM projects WHERE id = $1 AND user_id = $2', [id, userId]);
    return (res.rowCount || 0) > 0;
  },
};
