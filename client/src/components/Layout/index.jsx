import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useFullscreen } from '../../hooks/useFullscreen';
import { ChangePasswordModal } from '../ChangePasswordModal';
import { Header } from '../Header';

const getMainClassName = (isFullscreen, isKanban) => {
  if (isFullscreen) return 'max-w-none p-3 sm:p-5 flex flex-col h-screen overflow-hidden';
  if (isKanban) return 'max-w-[1700px] p-3 sm:p-4 flex flex-col min-h-0 overflow-hidden';
  return 'max-w-7xl p-4 sm:p-6 lg:p-8';
};

export const Layout = ({ children }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const { isFullscreen } = useFullscreen();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isKanban = pathname === '/kanban';

  return (
    <div className={`${isKanban || isFullscreen ? 'h-screen overflow-hidden' : 'min-h-screen'} bg-slate-50 dark:bg-darkSurface-bg text-slate-800 dark:text-darkSurface-text flex flex-col font-sans transition-colors duration-200`}>
      {/* Navbar escondida em modo Fullscreen na TV */}
      {!isFullscreen && (
        <Header
          user={user}
          isAdmin={isAdmin}
          pathname={pathname}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onChangePassword={() => setShowPasswordModal(true)}
          onLogout={handleLogout}
        />
      )}

      <main className={`flex-1 w-full ${getMainClassName(isFullscreen, isKanban)} mx-auto`}>
        {children}
      </main>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        targetUser={user}
        currentUser={user}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  );
};
