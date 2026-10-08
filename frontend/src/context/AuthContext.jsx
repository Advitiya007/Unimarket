import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
let authRestorePromise;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore the authenticated user when the app starts.
  useEffect(() => {
    let isMounted = true;

    if (!authRestorePromise) {
      authRestorePromise = axios
        .get(`${import.meta.env.REACT_APP_BASE_URL}/auth/me`, { withCredentials: true })
        .then(({ data }) => data)
        .catch(() => null);
    }

    authRestorePromise.then((restoredUser) => {
      if (isMounted) {
        setUser(restoredUser);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/auth/login`, {
      email,
      password,
    }, { withCredentials: true });

    setUser(data.user);

    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/auth/register`, payload, { withCredentials: true });

    setUser(data.user);

    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await axios.post(`${import.meta.env.REACT_APP_BASE_URL}/auth/logout`, {}, { withCredentials: true });
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
    }),
    [user, loading, login, register, logout]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
