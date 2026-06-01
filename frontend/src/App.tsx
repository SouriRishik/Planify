import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import ForgotPassword from './components/Auth/ForgotPassword';
import Dashboard from './components/Dashboard/Dashboard';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import ProjectList from './components/Projects/ProjectList';
import TaskList from './components/Tasks/TaskList';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-screen">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="auth-wrapper">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:projectId" element={<TaskList />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default App;
