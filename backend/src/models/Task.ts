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
  async findByProject(projectId: number, userId: number, filters: TaskFilters = {}): Promise<ITask[]> {
    const params: any[] = [projectId, userId];
    const base = 'SELECT * FROM tasks WHERE project_id = $1 AND user_id = $2';
    const { query, values } = (() => {
      // reuse applyFilters logic but adapt placeholders
      let q = base;
      const vals = [...params];

      if (filters.priority) {
        q += ` AND priority = $${vals.length + 1}`;
        vals.push(filters.priority);
      }
      if (filters.status) {
        q += ` AND status = $${vals.length + 1}`;
        vals.push(filters.status);
      }

      const allowed = ['priority', 'status', 'due_date', 'created_at', 'title'];
      const col = allowed.includes(filters.sort_by || '') ? filters.sort_by! : 'created_at';
      const dir = filters.sort_order === 'asc' ? 'ASC' : 'DESC';

      if (col === 'priority') {
        q += ` ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ${dir}`;
      } else {
        q += ` ORDER BY ${col} ${dir}`;
      }

      return { query: q, values: vals };
    })();

    const res = await db.query(query, values);
    return res.rows as ITask[];
  },

  async findAllByUser(userId: number, filters: TaskFilters = {}): Promise<ITask[]> {
    const params: any[] = [userId];
    const base = 'SELECT * FROM tasks WHERE user_id = $1';
    const { query, values } = (() => {
      let q = base;
      const vals = [...params];

      if (filters.priority) {
        q += ` AND priority = $${vals.length + 1}`;
        vals.push(filters.priority);
      }
      if (filters.status) {
        q += ` AND status = $${vals.length + 1}`;
        vals.push(filters.status);
      }

      const allowed = ['priority', 'status', 'due_date', 'created_at', 'title'];
      const col = allowed.includes(filters.sort_by || '') ? filters.sort_by! : 'created_at';
      const dir = filters.sort_order === 'asc' ? 'ASC' : 'DESC';

      if (col === 'priority') {
        q += ` ORDER BY CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ${dir}`;
      } else {
        q += ` ORDER BY ${col} ${dir}`;
      }

      return { query: q, values: vals };
    })();

    const res = await db.query(query, values);
    return res.rows as ITask[];
  },

  async findById(id: number, userId: number): Promise<ITask | undefined> {
    const res = await db.query('SELECT * FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
    return res.rows[0] as ITask | undefined;
  },

  async create(task: Omit<ITask, 'id' | 'created_at' | 'updated_at'>): Promise<ITask> {
    const res = await db.query(
      `INSERT INTO tasks (title, description, priority, status, due_date, project_id, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [task.title, task.description, task.priority, task.status, task.due_date, task.project_id, task.user_id],
    );
    const id = res.rows[0].id as number;
    return TaskModel.findById(id, task.user_id) as Promise<ITask>;
  },

  async update(id: number, userId: number, updates: Partial<ITask>): Promise<ITask | undefined> {
    const existing = await TaskModel.findById(id, userId);
    if (!existing) return undefined;

    const merged = { ...existing, ...updates } as ITask;
    await db.query(`
      UPDATE tasks
      SET title = $1, description = $2, priority = $3, status = $4, due_date = $5, updated_at = NOW()
      WHERE id = $6 AND user_id = $7
    `, [merged.title, merged.description, merged.priority, merged.status, merged.due_date, id, userId]);

    return TaskModel.findById(id, userId);
  },

  async delete(id: number, userId: number): Promise<boolean> {
    const res = await db.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [id, userId]);
    return (res.rowCount || 0) > 0;
  },

  async getStats(userId: number) {
    const res = await db.query(`
      SELECT
        COUNT(*)::int                                                    as total,
        SUM(CASE WHEN status = 'todo'        THEN 1 ELSE 0 END)::int   as todo,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)::int   as in_progress,
        SUM(CASE WHEN status = 'done'        THEN 1 ELSE 0 END)::int   as done
      FROM tasks WHERE user_id = $1
    `, [userId]);
    return res.rows[0] as { total: number; todo: number; in_progress: number; done: number };
  },
};
