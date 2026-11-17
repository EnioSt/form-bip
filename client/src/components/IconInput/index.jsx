const SIZES = {
  // Formulários internos (ex: cadastro de usuário)
  sm: {
    label: "block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1",
    iconSize: 16,
    input:
      "w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none",
  },
  // Tela de login
  lg: {
    label: "block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5",
    iconSize: 18,
    input:
      "w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 transition text-sm",
  },
};

/**
 * Campo de texto controlado com label e ícone à esquerda.
 * - size: 'sm' | 'lg'
 * - demais props (type, required, placeholder, autoComplete...) vão para o <input>
 */
export const IconInput = ({ id, label, icon: Icon, value, onChange, size = "sm", ...inputProps }) => {
  const styles = SIZES[size];

  return (
    <div>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <div className="relative">
        <Icon aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={styles.iconSize} />
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          {...inputProps}
          className={styles.input}
        />
      </div>
    </div>
  );
};
