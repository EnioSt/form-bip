import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './AuthContext';
import { api } from '../services/api';
import {
  getStoredUser,
  getToken,
  saveSession,
  clearSession,
  SESSION_EXPIRED_EVENT,
} from '../services/session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('bip360_dark');
    return saved ? JSON.parse(saved) : true; // Dark mode por padrão moderno
  });

  useEffect(() => {
    localStorage.setItem('bip360_dark', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const login = (userData, token) => {
    saveSession(userData, token);
    setUser(userData);
  };

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
  }, []);

  // Sessão expirada/inválida em qualquer chamada à API → volta para o login
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, logout);
  }, [logout]);

  // Ao abrir o sistema, confirma a sessão salva e atualiza os dados do usuário (função, nome)
  useEffect(() => {
    if (!getToken()) return;
    api
      .getMe()
      .then(({ user: freshUser }) => {
        saveSession(freshUser);
        setUser(freshUser);
      })
      .catch(() => {}); // 401 já dispara o logout pelo evento
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, darkMode, toggleDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
};
