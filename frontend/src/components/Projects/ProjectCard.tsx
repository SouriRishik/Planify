import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Project } from '../../types';
import { projectAPI } from '../../api/api';

interface Props {
  project: Project;
  onDelete: (id: number) => void;
}

const ProjectCard: React.FC<Props> = ({ project, onDelete }) => {
  const navigate = useNavigate();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${project.name}"? All tasks will be removed.`)) return;
    try {
      await projectAPI.delete(project.id);
      onDelete(project.id);
    } catch {
    }
  };

  return (
    <div className="project-card" onClick={() => navigate(`/projects/${project.id}`)}>
      <div className="project-card-header">
        <h3>{project.name}</h3>
        <button onClick={handleDelete} className="btn-icon btn-danger-icon" title="Delete project">
          ✕
        </button>
      </div>

      {project.description && <p className="project-card-desc">{project.description}</p>}

      <div className="project-card-stats">
        <span>
          {project.completed_tasks}/{project.total_tasks} tasks done
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${project.progress}%` }} />
      </div>
      <span className="progress-text">{project.progress}%</span>
    </div>
  );
};

export default ProjectCard;
