import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logoBip360 from '../assets/images/logo-bip360.png';
import { 
  Users, 
  LogOut, 
  Sun, 
  Moon, 
  Kanban,
  BarChart3,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-darkSurface-bg text-slate-800 dark:text-darkSurface-text flex flex-col font-sans transition-colors duration-200">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-darkSurface-card/80 backdrop-blur border-b border-slate-200 dark:border-darkSurface-border px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link to="/dashboard" className="flex items-center space-x-3">
            <img 
              src={logoBip360} 
              alt="BIP360 Sistemas" 
              className="h-8 w-auto object-contain brightness-100 dark:brightness-110" 
            />
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-slate-100 dark:bg-darkSurface-cardHover text-slate-500 dark:text-darkSurface-muted border border-slate-200 dark:border-darkSurface-border">
              Fase 1 Mock
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              to="/dashboard"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/dashboard' 
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover'
              }`}
            >
              <BarChart3 size={16} />
              <span>Métricas & Dashboard</span>
            </Link>

            <Link 
              to="/kanban"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/kanban' 
                  ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover'
              }`}
            >
              <Kanban size={16} />
              <span>Quadro Kanban</span>
            </Link>

            {isAdmin && (
              <Link 
                to="/admin/users"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/admin/users' 
                    ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover'
                }`}
              >
                <Users size={16} />
                <span>Gestão de Usuários</span>
              </Link>
            )}
          </nav>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-darkSurface-border text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition"
            title="Alternar Tema Claro/Escuro"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Info & Role Tag */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-darkSurface-border">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold leading-tight">{user?.name}</div>
              <div className="text-xs text-slate-400 dark:text-darkSurface-muted flex items-center justify-end space-x-1">
                {isAdmin ? (
                  <span className="text-amber-500 flex items-center gap-0.5 font-medium"><ShieldAlert size={12} /> Admin</span>
                ) : (
                  <span className="text-brand-400 flex items-center gap-0.5 font-medium"><UserCheck size={12} /> Operador</span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
              title="Sair do sistema"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}

