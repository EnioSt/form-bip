import { Sun, Moon } from 'lucide-react';

const DEFAULT_CLASS =
  'p-2 rounded-lg border border-slate-200 dark:border-darkSurface-border text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:white hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition';

/**
 * Botão de alternância entre tema claro e escuro.
 * - className: substitui o estilo padrão (ex: versão flutuante da tela de login)
 */
export const ThemeToggle = ({ darkMode, onToggle, className = DEFAULT_CLASS }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={darkMode}
      className={className}
      title="Alternar Tema Claro/Escuro"
    >
      {darkMode ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
};
