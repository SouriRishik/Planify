import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, TaskStats } from '../../types';
import { projectAPI, taskAPI } from '../../api/api';

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<TaskStats>({ total: 0, todo: 0, in_progress: 0, done: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([projectAPI.getAll(), taskAPI.getStats()])
      .then(([projRes, statRes]) => {
        setProjects(projRes.data);
        setStats(statRes.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-number">{stats.total}</span>
          <span className="stat-label">Total Tasks</span>
        </div>
        <div className="stat-card stat-todo">
          <span className="stat-number">{stats.todo}</span>
          <span className="stat-label">To Do</span>
        </div>
        <div className="stat-card stat-progress">
          <span className="stat-number">{stats.in_progress}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card stat-done">
          <span className="stat-number">{stats.done}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      <h3 className="section-title">Your Projects</h3>

      {projects.length === 0 ? (
        <p className="empty-state">No projects yet. Create one from the sidebar!</p>
      ) : (
        <div className="project-grid">
          {projects.map((p) => (
            <div key={p.id} className="project-card" onClick={() => navigate(`/projects/${p.id}`)}>
              <h3>{p.name}</h3>
              {p.description && <p className="project-card-desc">{p.description}</p>}
              <div className="project-card-stats">
                <span>
                  {p.completed_tasks}/{p.total_tasks} tasks
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
              <span className="progress-text">{p.progress}% complete</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
