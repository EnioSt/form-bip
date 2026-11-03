import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import logoBip360 from '../assets/images/logo-bip360.png';
import { LogIn, KeyRound, Mail, AlertCircle, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('suporte@bip360.com.br');
  const [password, setPassword] = useState('123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(email, password);
      login(data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (role) => {
    if (role === 'admin') {
      setEmail('suporte@bip360.com.br');
      setPassword('123');
    } else {
      setEmail('enio.junior@bip360.com.br');
      setPassword('123');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-darkSurface-bg flex items-center justify-center p-4 relative font-sans">
      {/* Botão de Tema no Canto Superior */}
      <button
        onClick={toggleDarkMode}
        className="absolute top-5 right-5 p-2 rounded-lg border border-slate-200 dark:border-darkSurface-border text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-white dark:bg-darkSurface-card shadow-sm transition"
      >
        {darkMode ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md bg-white dark:bg-darkSurface-card rounded-2xl shadow-xl border border-slate-200/80 dark:border-darkSurface-border p-8">
        {/* Logo / Header */}
        <div className="text-center mb-8">
          <img 
            src={logoBip360} 
            alt="BIP360 Sistemas" 
            className="h-12 w-auto mx-auto object-contain mb-3" 
          />
          <h1 className="text-xl font-bold font-heading text-slate-900 dark:text-white">Sistema de Onboarding</h1>
          <p className="text-xs text-slate-500 dark:text-darkSurface-muted mt-1">
            Gerenciamento de cartões SiTEF, TEF e implantações
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                placeholder="seu.email@bip360.com.br"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
              Senha
            </label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium rounded-lg shadow-md shadow-brand-600/25 flex items-center justify-center space-x-2 transition disabled:opacity-50"
          >
            <LogIn size={18} />
            <span>{loading ? 'Entrando...' : 'Entrar no Sistema'}</span>
          </button>
        </form>

        {/* Atalhos de Teste Mock */}
        <div className="mt-6 pt-6 border-t border-slate-200 dark:border-darkSurface-border">
          <div className="text-xs text-slate-400 text-center mb-2 font-medium">Contas Rápidas de Teste (Mock):</div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="flex-1 py-1.5 px-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-darkSurface-border transition"
            >
              👑 Suporte (Admin)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('op')}
              className="flex-1 py-1.5 px-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-darkSurface-border transition"
            >
              🛠️ Enio (Operador)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

