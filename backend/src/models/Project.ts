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
  findAllByUser(userId: number): IProjectWithProgress[] {
    const rows = db.prepare(`
      SELECT p.*,
             COUNT(t.id) as total_tasks,
             SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.user_id = ?
      GROUP BY p.id
      ORDER BY p.updated_at DESC
    `).all(userId);
    return rows.map(withProgress);
  },

  findById(id: number, userId: number): IProjectWithProgress | undefined {
    const row = db.prepare(`
      SELECT p.*,
             COUNT(t.id) as total_tasks,
             SUM(CASE WHEN t.status = 'done' THEN 1 ELSE 0 END) as completed_tasks
      FROM projects p
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.id = ? AND p.user_id = ?
      GROUP BY p.id
    `).get(id, userId);
    return row ? withProgress(row) : undefined;
  },

  create(name: string, description: string, userId: number): IProjectWithProgress {
    const result = db.prepare(
      'INSERT INTO projects (name, description, user_id) VALUES (?, ?, ?)'
    ).run(name, description, userId);
    return ProjectModel.findById(result.lastInsertRowid as number, userId)!;
  },

  update(id: number, name: string, description: string, userId: number): IProjectWithProgress | undefined {
    const changes = db.prepare(`
      UPDATE projects SET name = ?, description = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(name, description, id, userId).changes;
    return changes > 0 ? ProjectModel.findById(id, userId) : undefined;
  },

  delete(id: number, userId: number): boolean {
    return db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?').run(id, userId).changes > 0;
  },
};
