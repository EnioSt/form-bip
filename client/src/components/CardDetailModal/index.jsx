import { Modal } from "../Modal";
import { CardDetailHeader } from "../CardDetailHeader";
import { FormDataSummary } from "../FormDataSummary";
import { EmptyFormData } from "../EmptyFormData";
import { CardNotes } from "../CardNotes";
import { CardDetailFooter } from "../CardDetailFooter";

const LoadingDetails = () => (
  <div role="status" className="text-center py-12">
    <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
    <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
      Carregando dados preenchidos...
    </p>
  </div>
);

const TITLE_ID = "card-detail-modal-title";

/**
 * Modal com todos os dados do card: formulário preenchido, observações internas e exportações.
 */
export const CardDetailModal = ({
  selectedCard,
  loadingCardDetails,
  user,
  operatorName,
  newNoteText,
  savingNote,
  onClose,
  onCopyLink,
  onStartImplantation,
  onToggleActive,
  onDeleteCard,
  onChangeNoteText,
  onAddNote,
  onDeleteNote,
  onReopenForm,
}) => {
  if (!selectedCard) return null;

  const handleCopyLink = (e) => onCopyLink(selectedCard.unique_token, e);

  const renderFormData = () => {
    if (loadingCardDetails) return <LoadingDetails />;
    if (!selectedCard.formData) return <EmptyFormData onCopyLink={handleCopyLink} />;
    return <FormDataSummary formData={selectedCard.formData} />;
  };

  return (
    <Modal
      labelledBy={TITLE_ID}
      overlayClassName="overflow-y-auto"
      className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in fade-in zoom-in-95 duration-200"
    >
      <CardDetailHeader
        card={selectedCard}
        titleId={TITLE_ID}
        operatorName={operatorName}
        onToggleActive={onToggleActive}
        onStartImplantation={onStartImplantation}
        onDeleteCard={onDeleteCard}
        onClose={onClose}
      />

      <div className="p-6 overflow-y-auto space-y-6 text-sm">
        {renderFormData()}

        <CardNotes
          notes={selectedCard.notes}
          user={user}
          newNoteText={newNoteText}
          savingNote={savingNote}
          onChangeNoteText={onChangeNoteText}
          onAddNote={onAddNote}
          onDeleteNote={onDeleteNote}
        />
      </div>

      <CardDetailFooter
        card={selectedCard}
        onCopyLink={handleCopyLink}
        onReopenForm={onReopenForm ? () => onReopenForm(selectedCard.id) : undefined}
        onClose={onClose}
      />
    </Modal>
  );
};
