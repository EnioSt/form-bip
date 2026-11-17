import { ChevronLeft, ChevronRight } from "lucide-react";

const NAV_BUTTON =
  "p-1.5 rounded-lg border border-slate-200 dark:border-darkSurface-border hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover text-slate-600 dark:text-slate-300 transition";

/**
 * Navegação entre meses (anterior / rótulo / próximo).
 */
export const MonthNavigator = ({ label, onPrev, onNext }) => {
  return (
    <nav aria-label="Navegação entre meses" className="flex items-center space-x-2">
      <button type="button" onClick={onPrev} className={NAV_BUTTON} title="Mês Anterior">
        <ChevronLeft size={16} />
      </button>
      <output
        aria-live="polite"
        className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white px-3 py-1 bg-slate-50 dark:bg-darkSurface-bg rounded-lg border border-slate-200 dark:border-darkSurface-border capitalize min-w-[140px] text-center"
      >
        {label}
      </output>
      <button type="button" onClick={onNext} className={NAV_BUTTON} title="Próximo Mês">
        <ChevronRight size={16} />
      </button>
    </nav>
  );
};
