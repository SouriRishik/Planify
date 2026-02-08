import React from 'react';
import { TaskFilters as ITaskFilters } from '../../types';

interface Props {
  filters: ITaskFilters;
  onChange: (filters: ITaskFilters) => void;
}

const TaskFiltersBar: React.FC<Props> = ({ filters, onChange }) => {
  const update = (key: keyof ITaskFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  return (
    <div className="filters-bar">
      <select value={filters.priority || ''} onChange={(e) => update('priority', e.target.value)}>
        <option value="">All Priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select value={filters.status || ''} onChange={(e) => update('status', e.target.value)}>
        <option value="">All Statuses</option>
        <option value="todo">To Do</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>

      <select value={filters.sort_by || ''} onChange={(e) => update('sort_by', e.target.value)}>
        <option value="">Sort By</option>
        <option value="created_at">Created Date</option>
        <option value="due_date">Due Date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>

      <select value={filters.sort_order || 'desc'} onChange={(e) => update('sort_order', e.target.value)}>
        <option value="desc">Descending</option>
        <option value="asc">Ascending</option>
      </select>
    </div>
  );
};

export default TaskFiltersBar;
