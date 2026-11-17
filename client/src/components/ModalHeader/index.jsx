import { X } from "lucide-react";

/**
 * Cabeçalho padrão de modal com ícone, título, subtítulo e botão de fechar.
 */
export const ModalHeader = ({ icon: Icon, title, subtitle, titleId, onClose }) => {
  return (
    <header className="flex items-start justify-between mb-4">
      <div className="flex items-center space-x-2.5">
        <figure className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
          <Icon size={18} />
        </figure>
        <hgroup>
          <h3 id={titleId} className="text-base font-bold font-heading text-slate-900 dark:text-white">
            {title}
          </h3>
          <p className="text-xs text-slate-500 dark:text-darkSurface-muted">{subtitle}</p>
        </hgroup>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition"
      >
        <X size={18} />
      </button>
    </header>
  );
};
