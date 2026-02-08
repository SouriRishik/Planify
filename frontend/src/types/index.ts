export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Project {
  id: number;
  name: string;
  description: string;
  user_id: number;
  total_tasks: number;
  completed_tasks: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  due_date: string | null;
  project_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface TaskStats {
  total: number;
  todo: number;
  in_progress: number;
  done: number;
}

export interface TaskFilters {
  priority?: Priority | '';
  status?: Status | '';
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}
