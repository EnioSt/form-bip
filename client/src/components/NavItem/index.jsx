import { Link } from 'react-router-dom';

export const NavItem = ({ to, icon: Icon, label, isActive }) => {
  return (
    <li>
      <Link
        to={to}
        aria-current={isActive ? 'page' : undefined}
        className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover'
        }`}
      >
        <Icon size={16} />
        <span>{label}</span>
      </Link>
    </li>
  );
};
