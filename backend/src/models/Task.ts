import db from '../config/database';

export interface ITask {
  id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'todo' | 'in_progress' | 'done';
  due_date: string | null;
  project_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskFilters {
  priority?: string;
  status?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

function applyFilters(base: string, params: any[], filters: TaskFilters): string {
  let query = base;

  if (filters.priority) {
    query += ' AND priority = ?';
    params.push(filters.priority);
  }
  if (filters.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  const allowed = ['priority', 'status', 'due_date', 'created_at', 'title'];
  const col = allowed.includes(filters.sort_by || '') ? filters.sort_by! : 'created_at';
  const dir = filters.sort_order === 'asc' ? 'ASC' : 'DESC';

  if (col === 'priority') {
    query += ` ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ${dir}`;
  } else {
    query += ` ORDER BY ${col} ${dir}`;
  }

  return query;
}

export const TaskModel = {
  findByProject(projectId: number, userId: number, filters: TaskFilters = {}): ITask[] {
    const params: any[] = [projectId, userId];
    const query = applyFilters(
      'SELECT * FROM tasks WHERE project_id = ? AND user_id = ?',
      params,
      filters,
    );
    return db.prepare(query).all(...params) as ITask[];
  },

  findAllByUser(userId: number, filters: TaskFilters = {}): ITask[] {
    const params: any[] = [userId];
    const query = applyFilters(
      'SELECT * FROM tasks WHERE user_id = ?',
      params,
      filters,
    );
    return db.prepare(query).all(...params) as ITask[];
  },

  findById(id: number, userId: number): ITask | undefined {
    return db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, userId) as ITask | undefined;
  },

  create(task: Omit<ITask, 'id' | 'created_at' | 'updated_at'>): ITask {
    const result = db.prepare(`
      INSERT INTO tasks (title, description, priority, status, due_date, project_id, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      task.title, task.description, task.priority,
      task.status, task.due_date, task.project_id, task.user_id,
    );
    return TaskModel.findById(result.lastInsertRowid as number, task.user_id)!;
  },

  update(id: number, userId: number, updates: Partial<ITask>): ITask | undefined {
    const existing = TaskModel.findById(id, userId);
    if (!existing) return undefined;

    const merged = { ...existing, ...updates };
    db.prepare(`
      UPDATE tasks
      SET title = ?, description = ?, priority = ?, status = ?, due_date = ?, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `).run(merged.title, merged.description, merged.priority, merged.status, merged.due_date, id, userId);

    return TaskModel.findById(id, userId);
  },

  delete(id: number, userId: number): boolean {
    return db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, userId).changes > 0;
  },

  getStats(userId: number) {
    return db.prepare(`
      SELECT
        COUNT(*)                                                    as total,
        SUM(CASE WHEN status = 'todo'        THEN 1 ELSE 0 END)   as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)   as in_progress,
        SUM(CASE WHEN status = 'done'        THEN 1 ELSE 0 END)   as done
      FROM tasks WHERE user_id = ?
    `).get(userId) as { total: number; todo: number; in_progress: number; done: number };
  },
};
