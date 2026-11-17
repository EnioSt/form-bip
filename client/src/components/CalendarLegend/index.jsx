/**
 * Legenda de cores dos status no calendário.
 */
export const CalendarLegend = () => {
  return (
    <ul aria-label="Legenda" className="flex items-center gap-2 bg-slate-100/80 dark:bg-darkSurface-bg px-2.5 py-1 rounded-lg border border-slate-200 dark:border-darkSurface-border text-xs">
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
        <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Em Implantação</span>
      </li>
      <li aria-hidden="true" className="text-slate-300 dark:text-slate-600">|</li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Concluída</span>
      </li>
    </ul>
  );
};
