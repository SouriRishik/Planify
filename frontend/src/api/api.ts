import axios from 'axios';

const base = (import.meta.env.VITE_API_BASE as string) || '/api';

export const api = axios.create({
  baseURL: base,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('planify_token') || sessionStorage.getItem('planify_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const projectAPI = {
  getAll: () => api.get('/projects'),
  getOne: (id: number) => api.get(`/projects/${id}`),
  create: (data: { name: string; description: string }) => api.post('/projects', data),
  update: (id: number, data: { name: string; description: string }) => api.put(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
};

export const taskAPI = {
  getAll: (filters?: Record<string, string>) => api.get('/tasks', { params: filters }),
  getByProject: (projectId: number, filters?: Record<string, string>) =>
    api.get(`/projects/${projectId}/tasks`, { params: filters }),
  getStats: () => api.get('/tasks/stats'),
  create: (projectId: number, data: Record<string, unknown>) =>
    api.post(`/projects/${projectId}/tasks`, data),
  update: (id: number, data: Record<string, unknown>) => api.put(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
};
