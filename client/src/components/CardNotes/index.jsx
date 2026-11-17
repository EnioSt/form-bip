import { MessageSquare } from "lucide-react";
import { DetailSection } from "../DetailSection";
import { NoteForm } from "../NoteForm";
import { NoteItem } from "../NoteItem";

/**
 * Seção de observações internas do card: formulário de nova nota + histórico (mais recentes primeiro).
 */
export const CardNotes = ({
  notes,
  user,
  newNoteText,
  savingNote,
  onChangeNoteText,
  onAddNote,
  onDeleteNote,
}) => {
  const list = Array.isArray(notes) ? notes : [];

  return (
    <DetailSection
      icon={MessageSquare}
      title={`Observações Internas (${list.length})`}
      className="space-y-3 pt-4 border-t border-slate-100 dark:border-darkSurface-border"
      aside={<span className="text-[11px] text-slate-400">Qualquer operador pode colaborar</span>}
    >
      <NoteForm
        value={newNoteText}
        saving={savingNote}
        onChange={onChangeNoteText}
        onSubmit={onAddNote}
      />

      {list.length > 0 ? (
        <ul className="space-y-2">
          {list
            .slice()
            .reverse()
            .map((n) => (
              <NoteItem
                key={n.id}
                note={n}
                isOwn={n.author_id === user?.id}
                canDelete={n.author_id === user?.id || user?.role === "admin"}
                onDelete={() => onDeleteNote(n.id)}
              />
            ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-darkSurface-bg/50 p-3 rounded-xl text-center border border-dashed border-slate-200 dark:border-darkSurface-border">
          Nenhuma observação registrada neste card até o momento.
        </p>
      )}
    </DetailSection>
  );
};
