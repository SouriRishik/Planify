import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { projectAPI } from '../../api/api';
import ProjectForm from '../Projects/ProjectForm';

const Sidebar: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    projectAPI
      .getAll()
      .then((res) => setProjects(res.data))
      .catch(() => {});
  }, []);

  const handleProjectCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    setShowForm(false);
    navigate(`/projects/${project.id}`);
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/projects" end className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <span className="sidebar-icon">📁</span> All Projects
        </NavLink>
      </nav>

      <div className="sidebar-section">
        <div className="sidebar-section-header">
          <h3>Projects</h3>
          <button onClick={() => setShowForm(!showForm)} className="btn-icon" title="New Project">
            +
          </button>
        </div>

        {showForm && <ProjectForm onSubmit={handleProjectCreated} onCancel={() => setShowForm(false)} />}

        <ul className="project-nav-list">
          {projects.map((p) => (
            <li key={p.id}>
              <NavLink
                to={`/projects/${p.id}`}
                className={({ isActive }) => `sidebar-project ${isActive ? 'active' : ''}`}
              >
                <span className="project-dot" />
                <span className="project-name">{p.name}</span>
                <span className="project-count">{p.total_tasks}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
