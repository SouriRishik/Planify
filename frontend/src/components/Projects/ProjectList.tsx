import React, { useState, useEffect } from 'react';
import { Project } from '../../types';
import { projectAPI } from '../../api/api';
import ProjectCard from './ProjectCard';
import ProjectForm from './ProjectForm';

const ProjectList: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    projectAPI
      .getAll()
      .then((res) => setProjects(res.data))
      .catch(() => {});
  }, []);

  const handleCreated = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
    setShowForm(false);
  };

  const handleDeleted = (id: number) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>All Projects</h2>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          + New Project
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <ProjectForm onSubmit={handleCreated} onCancel={() => setShowForm(false)} />
        </div>
      )}

      <div className="project-grid">
        {projects.length === 0 ? (
          <p className="empty-state">No projects yet. Create one to get started!</p>
        ) : (
          projects.map((p) => <ProjectCard key={p.id} project={p} onDelete={handleDeleted} />)
        )}
      </div>
    </div>
  );
};

export default ProjectList;
