/**
 * Card de indicador de qualidade técnica (rótulo, valor, descrição e ícone/emoji).
 * - iconClassName: cores da caixa do ícone
 */
export const QualityIndicatorCard = ({ label, value, description, icon, iconClassName }) => {
  return (
    <article className="p-5 rounded-2xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm flex items-center justify-between">
      <div>
        <h3 className="text-xs uppercase font-bold text-slate-400">{label}</h3>
        <p className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">{value}</p>
        <p className="text-xs text-slate-500 dark:text-darkSurface-muted mt-0.5">{description}</p>
      </div>
      <span aria-hidden="true" className={`w-12 h-12 rounded-xl ${iconClassName} flex items-center justify-center font-bold`}>
        {icon}
      </span>
    </article>
  );
};
