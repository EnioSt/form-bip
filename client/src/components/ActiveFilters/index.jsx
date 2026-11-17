import { UserCheck } from 'lucide-react';

const FilterChip = ({ children }) => (
  <span className="font-semibold bg-white dark:bg-darkSurface-card px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 flex items-center gap-1">
    {children}
  </span>
);

/**
 * Faixa que indica os filtros ativos do Kanban e permite limpá-los.
 */
export const ActiveFilters = ({ searchTerm, operatorLabel, resultCount, onClear }) => {
  if (!searchTerm && !operatorLabel) return null;

  return (
    <aside
      aria-label="Filtros ativos"
      className="flex items-center justify-between px-3 py-1.5 bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 rounded-lg text-xs text-brand-700 dark:text-brand-300 shrink-0"
    >
      <p className="flex items-center gap-2 flex-wrap">
        <span>Filtrando por:</span>
        {searchTerm && <FilterChip>"{searchTerm}"</FilterChip>}
        {operatorLabel && (
          <FilterChip>
            <UserCheck size={12} className="text-brand-500" />
            {operatorLabel}
          </FilterChip>
        )}
        <output className="text-slate-500 dark:text-slate-400">
          ({resultCount} {resultCount === 1 ? 'card' : 'cards'})
        </output>
      </p>
      <button
        type="button"
        onClick={onClear}
        className="text-xs font-semibold hover:underline flex items-center gap-1 text-brand-600 dark:text-brand-400 ml-2"
      >
        Limpar todos os filtros
      </button>
    </aside>
  );
};
