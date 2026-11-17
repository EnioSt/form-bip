import { Info } from 'lucide-react';

/**
 * Seção numerada do formulário público (card branco com título, ícone e dica opcional).
 * - action: elemento opcional à direita do título (ex: checkbox "Não se aplica")
 * - note: texto de orientação abaixo do título
 */
export const FormSection = ({ id, icon: Icon, title, note, action, children }) => {
  const titleId = `${id}-title`;
  const titleRow = (
    <div className="flex items-center space-x-2">
      <Icon className="text-brand-500" size={20} />
      <h2 id={titleId} className="font-black text-base uppercase tracking-wide font-heading text-slate-900 dark:text-white">
        {title}
      </h2>
    </div>
  );

  return (
    <section
      aria-labelledby={titleId}
      className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-darkSurface-border"
    >
      <header className="pb-4 mb-5 border-b border-slate-100 dark:border-darkSurface-border">
        {action ? (
          <div className="flex items-center justify-between">
            {titleRow}
            {action}
          </div>
        ) : (
          titleRow
        )}
        {note && (
          <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1 flex items-center gap-1">
            <Info size={14} /> {note}
          </p>
        )}
      </header>

      {children}
    </section>
  );
};
