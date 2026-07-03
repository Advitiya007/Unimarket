import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('unimarket_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('unimarket_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      if (token) {
        try {
          const { data } = await api.get('/auth/me');
          setUser(data);
          localStorage.setItem('unimarket_user', JSON.stringify(data));
        } catch {
          setUser(null);
          setToken(null);
          localStorage.removeItem('unimarket_token');
          localStorage.removeItem('unimarket_user');
        }
      }
      setLoading(false);
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('unimarket_token', data.token);
    localStorage.setItem('unimarket_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('unimarket_token', data.token);
    localStorage.setItem('unimarket_user', JSON.stringify(data.user));
    return data.user;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('unimarket_token');
    localStorage.removeItem('unimarket_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
