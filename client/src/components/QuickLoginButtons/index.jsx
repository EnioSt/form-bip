const BUTTON_CLASS =
  "flex-1 py-1.5 px-2 text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded border border-slate-200 dark:border-darkSurface-border transition";

/**
 * Atalhos de contas de teste (mock) na tela de login.
 */
export const QuickLoginButtons = ({ onSelect }) => {
  return (
    <aside className="mt-6 pt-6 border-t border-slate-200 dark:border-darkSurface-border">
      <p className="text-xs text-slate-400 text-center mb-2 font-medium">
        Contas Rápidas de Teste (Mock):
      </p>
      <div className="flex gap-2">
        <button type="button" onClick={() => onSelect("admin")} className={BUTTON_CLASS}>
          👑 Suporte (Admin)
        </button>
        <button type="button" onClick={() => onSelect("op")} className={BUTTON_CLASS}>
          🛠️ Enio (Operador)
        </button>
      </div>
    </aside>
  );
};
