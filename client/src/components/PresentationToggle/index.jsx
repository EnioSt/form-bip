import { Minimize2, MonitorActivity } from "lucide-react";

/**
 * Botão que liga/desliga o Modo Apresentação (tela cheia para TV).
 */
export const PresentationToggle = ({ isFullscreen, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={isFullscreen}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-card dark:hover:bg-darkSurface-cardHover border border-slate-200 dark:border-darkSurface-border text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-sm"
      title={
        isFullscreen
          ? "Sair do Modo Apresentação (Esc)"
          : "Ativar Modo Apresentação / Tela Cheia (F11)"
      }
    >
      {isFullscreen ? (
        <>
          <Minimize2 size={14} />
          <span>Sair Modo Apresentação</span>
        </>
      ) : (
        <>
          <MonitorActivity size={14} className="text-purple-500" />
          <span>Modo Apresentação</span>
        </>
      )}
    </button>
  );
};
