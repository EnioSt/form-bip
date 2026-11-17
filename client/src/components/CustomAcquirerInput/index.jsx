import { AlertCircle } from "lucide-react";

/**
 * Campo livre exibido quando a opção "Outro" é escolhida no select de adquirentes.
 */
export const CustomAcquirerInput = ({ value, onChange, required, error }) => {
  return (
    <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <label htmlFor="custom-acquirer" className="block text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
        <AlertCircle size={14} className="text-amber-600 dark:text-amber-400" />
        <span>Nome do Adquirente Não Listado *</span>
      </label>
      <input
        id="custom-acquirer"
        type="text"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? "custom-acquirer-hint custom-acquirer-error" : "custom-acquirer-hint"}
        placeholder="Ex: C6 Bank, SafraPay, Vero Banrisul, Mercado Pago..."
        className={`w-full px-3 py-2 bg-white dark:bg-darkSurface-card border ${
          error ? "border-rose-400 dark:border-rose-700 focus:ring-rose-500" : "border-amber-300 dark:border-amber-800 focus:ring-amber-500"
        } rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 shadow-xs`}
      />
      <small id="custom-acquirer-hint" className="text-[11px] text-amber-800/80 dark:text-amber-300/80 block">
        Informe a razão ou nome comercial da empresa adquirente onde você possui credenciamento ativo.
      </small>
      {error?.message && (
        <small id="custom-acquirer-error" role="alert" className="text-[11px] text-rose-500 font-medium block">
          {error.message}
        </small>
      )}
    </div>
  );
};
