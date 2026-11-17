/**
 * Card compacto de métrica do dashboard.
 * - className: borda e extras do card
 * - labelClassName / valueClassName / descriptionClassName: cores e estilos de cada parte
 * - icon: nó já renderizado (ícone solto ou dentro de caixa)
 * - comparison: valor do período exibido como "/ X no mês" (opcional)
 */
export const MetricCard = ({
  label,
  icon,
  value,
  comparison,
  description,
  className = "border-slate-200 dark:border-darkSurface-border",
  labelClassName,
  valueClassName,
  descriptionClassName = "text-slate-400 dark:text-darkSurface-muted",
}) => {
  return (
    <article className={`p-4 rounded-xl bg-white dark:bg-darkSurface-card border ${className} shadow-sm`}>
      <header className="flex items-center justify-between">
        <h3 className={`text-[11px] uppercase ${labelClassName}`}>{label}</h3>
        {icon}
      </header>
      <p className={`text-2xl font-black font-heading mt-1.5 ${valueClassName}`}>
        {comparison === undefined ? (
          value
        ) : (
          <>
            <span>{value}</span>
            {comparison !== value && (
              <span className="text-xs font-normal text-slate-400 dark:text-darkSurface-muted" title="No período selecionado">
                / {comparison} no mês
              </span>
            )}
          </>
        )}
      </p>
      <small className={`text-[10px] mt-0.5 block ${descriptionClassName}`}>{description}</small>
    </article>
  );
};
