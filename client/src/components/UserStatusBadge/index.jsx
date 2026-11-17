/**
 * Selo Ativo / Inativo do usuário.
 */
export const UserStatusBadge = ({ isActive }) => {
  return isActive ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900">
      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      <span>Ativo</span>
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
      <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-rose-500" />
      <span>Inativo</span>
    </span>
  );
};
