import { FormField } from '../FormField';

const BORDER_DEFAULT = 'border-slate-200 dark:border-darkSurface-border focus:ring-brand-500';
const BORDER_ERROR = 'border-rose-400 dark:border-rose-700 focus:ring-rose-500';

/**
 * Campo de texto integrado ao react-hook-form + zod.
 * - register: função register do useForm
 * - error: objeto de erro do campo (formState.errors[name])
 * - hint: texto de orientação/exemplo exibido abaixo do input
 * - demais props (type, placeholder, required, maxLength, min...) vão direto para o <input>
 */
export const FormInput = ({
  name,
  label,
  register,
  status,
  hint,
  error,
  className = '',
  type = 'text',
  ...inputProps
}) => {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <FormField label={label} htmlFor={name} status={status} error={error} errorId={errorId}>
      <input
        id={name}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...register(name)}
        {...inputProps}
        className={`w-full px-3 py-2 bg-white dark:bg-darkSurface-card border ${error ? BORDER_ERROR : BORDER_DEFAULT} rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 ${className}`}
      />
      {hint && (
        <small id={hintId} className="text-[11px] text-slate-400 block mt-1">{hint}</small>
      )}
    </FormField>
  );
};
