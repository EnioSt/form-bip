/**
 * Campo de senha controlado com label.
 */
export const PasswordField = ({ id, label, value, onChange, ...inputProps }) => {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {label}
      </label>
      <input
        id={id}
        type="password"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
        className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
      />
    </div>
  );
};
