/**
 * Checkbox com label clicável, integrado ao react-hook-form via register.
 */
export const Checkbox = ({
  name,
  register,
  className,
  inputClassName = 'w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300',
  children
}) => {
  return (
    <label className={className}>
      <input type="checkbox" {...register(name)} className={inputClassName} />
      <span>{children}</span>
    </label>
  );
};
