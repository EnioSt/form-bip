import React, { useState } from 'react';
import KanbanCard from './KanbanCard';

export default function KanbanColumn({
  column,
  cards,
  user,
  users,
  copiedToken,
  draggedCard,
  onDragStart,
  onDragEnd,
  onDropCard,
  onOpenCard,
  onCopyLink,
  onAssume,
  onAssignOperator,
  onStartImplantation,
  onMoveStatus,
  onReopen,
  onDeleteCard
}) {
  const [isOver, setIsOver] = useState(false);
  const columnCards = cards.filter(c => c.status === column.id);

  const getOperatorName = (operatorId) => {
    const op = users.find(u => u.id === operatorId);
    return op ? op.name : null;
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    // Só desativa se sair da coluna em si
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    if (onDropCard) {
      onDropCard(column.id);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl p-3 sm:p-3.5 border transition-colors duration-150 flex flex-col h-full min-h-0 max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-200px)] ${
        isOver
          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-400 dark:border-brand-500 ring-2 ring-brand-400/30'
          : 'bg-slate-100/70 dark:bg-darkSurface-bg/70 border-slate-200 dark:border-darkSurface-border/80'
      }`}
    >
      {/* Header da Coluna */}
      <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-darkSurface-border shrink-0">
        <div className="flex items-center space-x-2">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: column.theme.border }}
          />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-white font-heading">
            {column.title}
          </h3>
        </div>
        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-darkSurface-cardHover text-slate-600 dark:text-darkSurface-muted">
          {columnCards.length}
        </span>
      </div>

      {/* Lista de Cards com Scroll Interno */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {columnCards.map(card => (
          <KanbanCard
            key={card.id}
            card={card}
            user={user}
            users={users}
            operatorName={getOperatorName(card.operator_id)}
            copiedToken={copiedToken}
            isDragging={draggedCard?.id === card.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onOpenCard={onOpenCard}
            onCopyLink={onCopyLink}
            onAssume={onAssume}
            onAssignOperator={onAssignOperator}
            onStartImplantation={onStartImplantation}
            onMoveStatus={onMoveStatus}
            onReopen={onReopen}
            onDeleteCard={onDeleteCard}
          />
        ))}

        {columnCards.length === 0 && (
          <div className={`h-28 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-xs transition-colors ${
            isOver 
              ? 'border-brand-400 bg-brand-50/50 text-brand-600 dark:text-brand-300' 
              : 'border-slate-200 dark:border-darkSurface-border text-slate-400'
          }`}>
            {isOver ? 'Soltar aqui' : 'Nenhum card aqui'}
          </div>
        )}
      </div>
    </div>
  );
}
