import { CheckCircle2, Clock } from 'lucide-react';

/**
 * Selo de status de preenchimento de um campo: OK, Pendente ou N/A.
 */
export const StatusBadge = ({ isOk, isNA = false }) => {
  if (isNA) {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-darkSurface-cardHover dark:text-slate-400 border border-slate-200 dark:border-darkSurface-border">
        N/A
      </span>
    );
  }

  if (isOk) {
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
        <CheckCircle2 size={12} />
        OK
      </span>
    );
  }

  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
      <Clock size={12} />
      Pendente
    </span>
  );
};
