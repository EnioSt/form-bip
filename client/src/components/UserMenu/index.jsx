import { LogOut, ShieldAlert, UserCheck, KeyRound } from 'lucide-react';

const RoleTag = ({ isAdmin }) =>
  isAdmin ? (
    <span className="text-amber-500 flex items-center gap-0.5 font-medium"><ShieldAlert size={12} /> Admin</span>
  ) : (
    <span className="text-brand-400 flex items-center gap-0.5 font-medium"><UserCheck size={12} /> Operador</span>
  );

export const UserMenu = ({ user, isAdmin, onChangePassword, onLogout }) => {
  return (
    <section aria-label="Usuário logado" className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-darkSurface-border">
      <address className="text-right hidden sm:block not-italic">
        <strong className="block text-sm font-semibold leading-tight">{user?.name}</strong>
        <small className="text-xs text-slate-400 dark:text-darkSurface-muted flex items-center justify-end space-x-1">
          <RoleTag isAdmin={isAdmin} />
        </small>
      </address>

      <button
        type="button"
        onClick={onChangePassword}
        className="p-2 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded-lg transition"
        title="Alterar minha senha"
      >
        <KeyRound size={17} />
      </button>

      <button
        type="button"
        onClick={onLogout}
        className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
        title="Sair do sistema"
      >
        <LogOut size={18} />
      </button>
    </section>
  );
};
