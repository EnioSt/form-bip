/**
 * Campo da barra de filtros: label (com ícone opcional) + controle.
 */
export const FilterField = ({ id, label, icon: Icon, children }) => {
  return (
    <div>
      <label
        htmlFor={id}
        className={`block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5${Icon ? " flex items-center gap-1" : ""}`}
      >
        {Icon && <Icon size={13} className="text-brand-500" />}
        {Icon ? <span>{label}</span> : label}
      </label>
      {children}
    </div>
  );
};
