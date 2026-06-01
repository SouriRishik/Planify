import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { api } from '../api/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getToken = (): string | null =>
  localStorage.getItem('planify_token') || sessionStorage.getItem('planify_token');

const removeToken = (): void => {
  localStorage.removeItem('planify_token');
  sessionStorage.removeItem('planify_token');
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      api.get('/auth/me')
        .then((res) => setUser(res.data))
        .catch(() => removeToken())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    const res = await api.post('/auth/login', { email, password });
    if (rememberMe) {
      localStorage.setItem('planify_token', res.data.token);
    } else {
      sessionStorage.setItem('planify_token', res.data.token);
    }
    setUser(res.data.user);
  };

  const signup = async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/signup', { name, email, password });
    localStorage.setItem('planify_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => {
    removeToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
