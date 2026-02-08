import React, { useState } from 'react';
import { Project } from '../../types';
import { projectAPI } from '../../api/api';

interface Props {
  project?: Project;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
}

const ProjectForm: React.FC<Props> = ({ project, onSubmit, onCancel }) => {
  const [name, setName] = useState(project?.name || '');
  const [description, setDescription] = useState(project?.description || '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = project
        ? await projectAPI.update(project.id, { name, description })
        : await projectAPI.create({ name, description });
      onSubmit(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save project.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-form">
      {error && <div className="error-message">{error}</div>}
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Project name"
        required
        autoFocus
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
      />
      <div className="form-actions">
        <button type="submit" className="btn btn-primary btn-sm">
          {project ? 'Update' : 'Create'}
        </button>
        <button type="button" onClick={onCancel} className="btn btn-ghost btn-sm">
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;
