import { Send } from "lucide-react";

const MAX_LENGTH = 150;

/**
 * Formulário de nova observação interna com contador de caracteres.
 */
export const NoteForm = ({ value, saving, onChange, onSubmit }) => {
  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <div className="relative">
        <textarea
          rows={2}
          maxLength={MAX_LENGTH}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Nova observação"
          placeholder="Adicione um recado, detalhe de contato ou observação do card (máx 150 caracteres)..."
          className="w-full p-3 pr-20 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 resize-none"
        />
        <div className="absolute right-3 bottom-3 flex items-center space-x-2">
          <output
            className={`text-[10px] font-mono font-medium ${
              value.length >= 140 ? "text-rose-500 font-bold" : "text-slate-400"
            }`}
          >
            {value.length}/{MAX_LENGTH}
          </output>
          <button
            type="submit"
            disabled={saving || !value.trim()}
            className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
          >
            <Send size={12} />
            <span>Salvar</span>
          </button>
        </div>
      </div>
    </form>
  );
};
