import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useConfirmDialog } from "../hooks/useConfirmDialog";
import { useClipboardLink } from "../hooks/useClipboardLink";
import { useKanbanBoard } from "../hooks/useKanbanBoard";
import { useKanbanFilters } from "../hooks/useKanbanFilters";
import { useCardDragAndDrop } from "../hooks/useCardDragAndDrop";
import { themeConfig } from "../theme/theme";

import { KanbanToolbar } from "../components/KanbanToolbar";
import { KanbanMetricsBar } from "../components/KanbanMetricsBar";
import { ActiveFilters } from "../components/ActiveFilters";
import { KanbanBoard } from "../components/KanbanBoard";
import { ScheduleModal } from "../components/ScheduleModal";
import { ConfirmModal } from "../components/ConfirmModal";
import { CardDetailModal } from "../components/CardDetailModal";
import { AddAcquirerModal } from "../components/AddAcquirerModal";

const COLUMNS = [
  { id: "triagem", title: "Triagem", theme: themeConfig.colors.status.triagem },
  { id: "preenchido", title: "Preenchido", theme: themeConfig.colors.status.preenchido },
  { id: "implantacao", title: "Em Implantação", theme: themeConfig.colors.status.implantacao },
  { id: "concluido", title: "Concluído", theme: themeConfig.colors.status.concluido },
];

export const Dashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [showAddAcquirerModal, setShowAddAcquirerModal] = useState(false);

  const { openConfirm, closeConfirm, dialogProps } = useConfirmDialog();
  const { copiedToken, copyFormLink } = useClipboardLink();
  // Criação manual de cards desativada: os cards vêm da API de franquias (useKanbanBoard().creation segue disponível)
  const { cards, users, getOperatorName, actions, details, schedule } = useKanbanBoard({
    user,
    openConfirm,
    closeConfirm,
  });
  const filters = useKanbanFilters(cards, getOperatorName);
  const dnd = useCardDragAndDrop(actions.dropCard);

  const { selectedCard } = details;

  return (
    <div className="flex-1 flex flex-col space-y-3 min-h-0">
      <KanbanToolbar
        searchTerm={filters.searchTerm}
        onSearchChange={filters.setSearchTerm}
        operatorFilter={filters.operatorFilter}
        onOperatorFilterChange={filters.setOperatorFilter}
        users={users}
        isAdmin={isAdmin}
        onAddAcquirer={() => setShowAddAcquirerModal(true)}
      />

      <KanbanMetricsBar columns={COLUMNS} cards={cards} />

      <ActiveFilters
        searchTerm={filters.searchTerm}
        operatorLabel={filters.operatorLabel}
        resultCount={filters.filteredCards.length}
        onClear={filters.clearFilters}
      />

      <KanbanBoard
        columns={COLUMNS}
        cards={filters.filteredCards}
        user={user}
        users={users}
        copiedToken={copiedToken}
        draggedCard={dnd.draggedCard}
        onDragStart={dnd.handleDragStart}
        onDragEnd={dnd.handleDragEnd}
        onDropCard={dnd.handleDropCard}
        onOpenCard={details.openCard}
        onCopyLink={copyFormLink}
        onAssume={actions.assumeCard}
        onAssignOperator={actions.assignOperator}
        onStartImplantation={schedule.open}
        onMoveStatus={actions.moveStatus}
        onReopen={actions.reopenImplantation}
        onDeleteCard={actions.deleteCard}
      />

      <CardDetailModal
        selectedCard={selectedCard}
        loadingCardDetails={details.loadingCardDetails}
        user={user}
        operatorName={selectedCard ? getOperatorName(selectedCard.operator_id) : null}
        newNoteText={details.newNoteText}
        savingNote={details.savingNote}
        onClose={details.closeCard}
        onCopyLink={copyFormLink}
        onStartImplantation={schedule.open}
        onToggleActive={actions.toggleActive}
        onDeleteCard={actions.deleteCard}
        onReopenForm={actions.reopenCard}
        onChangeNoteText={details.setNewNoteText}
        onAddNote={details.addNote}
        onDeleteNote={details.deleteNote}
      />

      <ScheduleModal
        isOpen={schedule.isOpen}
        card={schedule.card}
        date={schedule.date}
        moveToImplantation={schedule.moveToImplantation}
        onChangeDate={schedule.setDate}
        onClose={schedule.close}
        onSubmit={schedule.confirm}
      />

      <AddAcquirerModal
        isOpen={showAddAcquirerModal}
        onClose={() => setShowAddAcquirerModal(false)}
      />

      <ConfirmModal {...dialogProps} />
    </div>
  );
};
