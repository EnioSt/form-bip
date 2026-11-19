import { FormField } from '../FormField';

const BORDER_DEFAULT = 'border-slate-200 dark:border-darkSurface-border focus:ring-brand-500';
const BORDER_ERROR = 'border-rose-400 dark:border-rose-700 focus:ring-rose-500';

/**
 * Lista de seleção integrada ao react-hook-form + zod (mesmo visual do FormInput).
 * - options: [{ value, label }]
 * - placeholder: texto da opção vazia inicial
 * - demais props vão direto para o <select>
 */
export const FormSelect = ({
  name,
  label,
  register,
  status,
  hint,
  error,
  options = [],
  placeholder = 'Selecione...',
  className = '',
  ...selectProps
}) => {
  const hintId = hint ? `${name}-hint` : undefined;
  const errorId = error ? `${name}-error` : undefined;

  return (
    <FormField label={label} htmlFor={name} status={status} error={error} errorId={errorId}>
      <select
        id={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined}
        {...register(name)}
        {...selectProps}
        className={`w-full px-3 py-2 bg-white dark:bg-darkSurface-card border ${error ? BORDER_ERROR : BORDER_DEFAULT} rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 ${className}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint && (
        <small id={hintId} className="text-[11px] text-slate-400 block mt-1">{hint}</small>
      )}
    </FormField>
  );
};
