import { Trash2 } from "lucide-react";

const formatDateTime = (iso) =>
  new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Uma observação interna: autor, data/hora, texto e botão de exclusão (se permitido).
 */
export const NoteItem = ({ note, isOwn, canDelete, onDelete }) => {
  return (
    <li className="p-3 rounded-xl bg-slate-50 dark:bg-darkSurface-bg/70 border border-slate-200 dark:border-darkSurface-border text-xs group">
      <article className="space-y-1">
        <header className="flex items-center justify-between text-[11px] text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {note.author_name}
            {isOwn && (
              <span className="ml-1 text-[10px] text-brand-500 font-normal">(você)</span>
            )}
          </span>

          <div className="flex items-center space-x-2">
            <time dateTime={note.created_at}>{formatDateTime(note.created_at)}</time>

            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="p-1 text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                title="Excluir minha observação"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </header>
        <p className="text-slate-800 dark:text-slate-200 break-words font-medium">{note.text}</p>
      </article>
    </li>
  );
};
