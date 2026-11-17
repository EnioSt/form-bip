const TONES = {
  blue: {
    border: "border-blue-200 dark:border-blue-900/50",
    label: "text-blue-600 dark:text-blue-400",
    icon: "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400",
  },
  indigo: {
    border: "border-indigo-200 dark:border-indigo-900/50",
    label: "text-indigo-600 dark:text-indigo-400",
    icon: "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400",
  },
  emerald: {
    border: "border-emerald-200 dark:border-emerald-900/50",
    label: "text-emerald-600 dark:text-emerald-400",
    icon: "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400",
  },
};

/**
 * Card grande de métrica usado no Modo Apresentação (TV).
 * - valueClassName: cor/layout do número (padrão: texto escuro)
 */
export const TvMetricCard = ({
  tone,
  label,
  icon: Icon,
  description,
  valueClassName = "text-slate-900 dark:text-white",
  children,
}) => {
  const styles = TONES[tone];

  return (
    <article className={`p-3.5 bg-white/80 dark:bg-darkSurface-card/80 backdrop-blur-xs rounded-2xl border ${styles.border} shadow-sm relative overflow-hidden group`}>
      <header className="flex items-center justify-between">
        <h3 className={`text-xs uppercase font-bold tracking-wider ${styles.label}`}>{label}</h3>
        <span className={`w-8 h-8 rounded-xl ${styles.icon} flex items-center justify-center font-bold shadow-xs`}>
          <Icon size={16} />
        </span>
      </header>
      <p className={`text-3xl font-black font-heading mt-2 ${valueClassName}`}>{children}</p>
      <small className="text-xs text-slate-500 dark:text-darkSurface-muted mt-1 block">{description}</small>
    </article>
  );
};
