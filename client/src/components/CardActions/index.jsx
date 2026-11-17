import {
  Copy,
  Check,
  ExternalLink,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Users,
  Trash2
} from 'lucide-react';

const CopyLinkButton = ({ isCopied, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="flex-1 py-1 px-2 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center space-x-1 transition"
  >
    {isCopied ? (
      <>
        <Check size={12} className="text-emerald-500" />
        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado!</span>
      </>
    ) : (
      <>
        <Copy size={12} />
        <span>Copiar Link</span>
      </>
    )}
  </button>
);

const StatusActionButton = ({ status, onStartImplantation, onConclude, onReopen }) => {
  if (status === 'preenchido') {
    return (
      <button
        type="button"
        onClick={onStartImplantation}
        className="w-full py-1.5 px-2 rounded text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center space-x-1 shadow-sm transition"
      >
        <span>Agendar & Iniciar Implantação</span>
        <ArrowRight size={13} />
      </button>
    );
  }

  if (status === 'implantacao') {
    return (
      <button
        type="button"
        onClick={onConclude}
        className="w-full py-1.5 px-2 rounded text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center space-x-1 shadow-sm transition"
      >
        <CheckCircle2 size={13} />
        <span>Concluir Implantação</span>
      </button>
    );
  }

  if (status === 'concluido') {
    return (
      <button
        type="button"
        onClick={onReopen}
        className="w-full py-1.5 px-2 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center space-x-1 border border-slate-200 dark:border-darkSurface-border transition"
      >
        <RotateCcw size={12} />
        <span>Reabrir para Implantação</span>
      </button>
    );
  }

  return null;
};

/**
 * Rodapé de ações do ticket: link do formulário, exclusão,
 * atribuição de operador e avanço de etapa.
 */
export const CardActions = ({
  card,
  isAdmin,
  isCopied,
  onCopyLink,
  onDelete,
  onAssume,
  onAssignOther,
  onStartImplantation,
  onConclude,
  onReopen
}) => {
  return (
    <footer className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-darkSurface-border" onClick={e => e.stopPropagation()}>
      {/* Link & Visualização */}
      <div className="flex items-center space-x-1.5">
        <CopyLinkButton isCopied={isCopied} onClick={onCopyLink} />

        <a
          href={`/form/${card.unique_token}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          title="Abrir Formulário no Navegador"
        >
          <ExternalLink size={13} />
        </a>

        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Excluir Card"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      {/* Atribuição: operador assume se o card estiver livre; admin também pode destinar */}
      {!card.operator_id && (
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onAssume}
            className="flex-1 py-1 px-2 rounded text-xs bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-900/40 font-medium flex items-center justify-center space-x-1 transition"
          >
            <UserCheck size={13} />
            <span>Assumir Card</span>
          </button>

          {isAdmin && (
            <button
              type="button"
              onClick={onAssignOther}
              className="py-1 px-2 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-darkSurface-border font-medium flex items-center justify-center space-x-1 transition"
              title="Atribuir a outro operador"
            >
              <Users size={12} />
              <span>Destinar</span>
            </button>
          )}
        </div>
      )}

      <StatusActionButton
        status={card.status}
        onStartImplantation={onStartImplantation}
        onConclude={onConclude}
        onReopen={onReopen}
      />
    </footer>
  );
};
