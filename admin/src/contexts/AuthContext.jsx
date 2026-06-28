import { createContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, loginUser } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('admin_user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetchCurrentUser();
        if (response.data?.role !== 'admin') {
          throw new Error('Not admin');
        }
        setUser(response.data);
        localStorage.setItem('admin_user', JSON.stringify(response.data));
      } catch {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setToken('');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    initializeAuth();
  }, [token]);

  const login = async (credentials) => {
    const response = await loginUser(credentials);
    const nextToken = response.data.token;
    const nextUser = response.data.user;

    if (nextUser.role !== 'admin') {
      const error = new Error('Admin access required');
      error.response = { data: { message: 'This account does not have admin privileges.' } };
      throw error;
    }

    localStorage.setItem('admin_token', nextToken);
    localStorage.setItem('admin_user', JSON.stringify(nextUser));
    setToken(nextToken);
    setUser(nextUser);
    return response;
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken('');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'admin',
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthContext;
