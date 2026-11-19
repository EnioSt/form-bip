/**
 * Interruptor Ativo / Inativo da loja no sistema.
 * - lockedByFranchise: loja inativada pela API de franquias; o interruptor fica bloqueado
 *   (ela só volta quando reaparecer na API)
 */
export const StoreActiveToggle = ({ isActive, lockedByFranchise = false, onToggle }) => {
  const getTitle = () => {
    if (lockedByFranchise) return "Inativada automaticamente: a loja não consta mais na API de franquias ativas";
    return isActive
      ? "Clique para inativar esta loja no sistema"
      : "Clique para reativar esta loja no sistema";
  };

  const getLabel = () => {
    if (lockedByFranchise) return "Inativa na Franqueadora";
    return isActive ? "Loja Ativa no Sistema" : "Loja Inativa no Sistema";
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={lockedByFranchise}
      aria-pressed={isActive}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition disabled:cursor-not-allowed ${
        isActive
          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
          : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
      }`}
      title={getTitle()}
    >
      <span
        aria-hidden="true"
        className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
      />
      <span>{getLabel()}</span>
    </button>
  );
};
