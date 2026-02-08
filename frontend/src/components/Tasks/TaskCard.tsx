import React from 'react';
import { Task } from '../../types';
import { taskAPI } from '../../api/api';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
  onStatusChange: (task: Task) => void;
}

const priorityConfig = {
  low: { label: 'Low', className: 'priority-low' },
  medium: { label: 'Medium', className: 'priority-medium' },
  high: { label: 'High', className: 'priority-high' },
} as const;

const statusConfig = {
  todo: { label: 'To Do', className: 'status-todo' },
  in_progress: { label: 'In Progress', className: 'status-progress' },
  done: { label: 'Done', className: 'status-done' },
} as const;

const TaskCard: React.FC<Props> = ({ task, onEdit, onDelete, onStatusChange }) => {
  const cycleStatus = async () => {
    const next = task.status === 'todo' ? 'in_progress' : task.status === 'in_progress' ? 'done' : 'todo';
    try {
      const res = await taskAPI.update(task.id, { status: next });
      onStatusChange(res.data);
    } catch {
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try {
      await taskAPI.delete(task.id);
      onDelete(task.id);
    } catch {
    }
  };

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null;

  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

  return (
    <div className={`task-card ${task.status === 'done' ? 'task-done' : ''}`}>
      <div className="task-card-left">
        <button
          onClick={cycleStatus}
          className={`status-checkbox ${statusConfig[task.status].className}`}
          title="Change status"
        >
          {task.status === 'done' ? '✓' : task.status === 'in_progress' ? '◐' : '○'}
        </button>

        <div className="task-card-content">
          <h4 className="task-title">{task.title}</h4>
          {task.description && <p className="task-desc">{task.description}</p>}

          <div className="task-meta">
            <span className={`badge ${priorityConfig[task.priority].className}`}>
              {priorityConfig[task.priority].label}
            </span>
            <span className={`badge ${statusConfig[task.status].className}`}>
              {statusConfig[task.status].label}
            </span>
            {task.due_date && (
              <span className={`task-due ${isOverdue ? 'overdue' : ''}`}>📅 {formatDate(task.due_date)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="task-card-actions">
        <button onClick={() => onEdit(task)} className="btn-icon" title="Edit">
          ✎
        </button>
        <button onClick={handleDelete} className="btn-icon btn-danger-icon" title="Delete">
          ✕
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
