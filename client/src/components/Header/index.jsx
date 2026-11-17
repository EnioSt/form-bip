import { Link } from 'react-router-dom';
import { Users, Kanban, BarChart3 } from 'lucide-react';
import logoBip360 from '../../assets/images/logo-bip360.png';
import { NavItem } from '../NavItem';
import { ThemeToggle } from '../ThemeToggle';
import { UserMenu } from '../UserMenu';

const NAV_ITEMS = [
  { to: '/dashboard', icon: BarChart3, label: 'Métricas & Dashboard' },
  { to: '/kanban', icon: Kanban, label: 'Quadro Kanban' },
  { to: '/admin/users', icon: Users, label: 'Gestão de Usuários', adminOnly: true }
];

export const Header = ({
  user,
  isAdmin,
  pathname,
  darkMode,
  onToggleDarkMode,
  onChangePassword,
  onLogout
}) => {
  const visibleItems = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-20 shrink-0 bg-white dark:bg-darkSurface-card border-b border-slate-200 dark:border-darkSurface-border px-4 lg:px-8 py-2.5 flex items-center justify-between">
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

        <nav aria-label="Navegação principal" className="hidden md:flex">
          <ul className="flex items-center space-x-1">
            {visibleItems.map(item => (
              <NavItem
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                isActive={pathname === item.to}
              />
            ))}
          </ul>
        </nav>
      </div>

      <div className="flex items-center space-x-3">
        <ThemeToggle darkMode={darkMode} onToggle={onToggleDarkMode} />
        <UserMenu
          user={user}
          isAdmin={isAdmin}
          onChangePassword={onChangePassword}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
};
