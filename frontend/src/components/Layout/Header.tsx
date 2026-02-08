import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <h1 className="header-logo">PLANIFY</h1>
      <div className="header-right">
        <span className="header-user">{user?.name}</span>
        <button onClick={logout} className="btn btn-ghost">
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
