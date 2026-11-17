/**
 * Caixa com a barra de progresso do preenchimento do formulário.
 */
export const FormProgress = ({ percentage, completedCount, totalCount }) => {
  return (
    <aside className="bg-slate-50 dark:bg-darkSurface-bg p-4 rounded-xl border border-slate-200 dark:border-darkSurface-border min-w-[210px]">
      <p className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
        <span id="form-progress-label">Progresso do preenchimento</span>
        <span className="text-brand-600 dark:text-brand-400 font-bold">{percentage}%</span>
      </p>
      <div
        role="progressbar"
        aria-labelledby="form-progress-label"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className="w-full h-2.5 bg-slate-200 dark:bg-darkSurface-border rounded-full overflow-hidden"
      >
        <div
          className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-[10px] text-slate-400 mt-1.5 text-right font-medium">
        {completedCount} de {totalCount} itens preenchidos
      </p>
    </aside>
  );
};
