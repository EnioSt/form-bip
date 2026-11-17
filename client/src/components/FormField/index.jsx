import { StatusBadge } from '../StatusBadge';

/**
 * Bloco visual de um item do formulário: label + selo de status + conteúdo livre + erro.
 * Use quando o controle não é um <input> simples (select customizado, upload, checkbox).
 * - error: objeto de erro do react-hook-form/zod ({ message })
 * - errorId: id da mensagem, para ligar ao controle via aria-describedby
 */
export const FormField = ({
  label,
  htmlFor,
  status,
  error,
  errorId,
  className = 'p-3.5',
  headerClassName = 'mb-1',
  children
}) => {
  return (
    <div className={`${className} rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border`}>
      <div className={`flex items-center justify-between gap-2 ${headerClassName}`}>
        <label htmlFor={htmlFor} className="text-xs font-bold text-slate-800 dark:text-white">
          {label}
        </label>
        {status !== undefined && <StatusBadge isOk={status} />}
      </div>
      {children}
      {error?.message && (
        <small id={errorId} role="alert" className="text-[11px] text-rose-500 font-medium block mt-1">
          {error.message}
        </small>
      )}
    </div>
  );
};
