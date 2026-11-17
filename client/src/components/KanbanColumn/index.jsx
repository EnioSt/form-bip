import { useState } from 'react';
import { Card } from '../Card';

const ColumnHeader = ({ title, color, count }) => (
  <header className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-200 dark:border-darkSurface-border shrink-0">
    <div className="flex items-center space-x-2">
      <span
        aria-hidden="true"
        className="w-2.5 h-2.5 rounded-full"
        style={{ backgroundColor: color }}
      />
      <h3 className="font-semibold text-sm text-slate-800 dark:text-white font-heading">
        {title}
      </h3>
    </div>
    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-darkSurface-cardHover text-slate-600 dark:text-darkSurface-muted">
      {count}
    </span>
  </header>
);

const EmptyColumn = ({ isOver }) => (
  <li className={`h-28 flex flex-col items-center justify-center border-2 border-dashed rounded-xl text-xs transition-colors ${
    isOver
      ? 'border-brand-400 bg-brand-50/50 text-brand-600 dark:text-brand-300'
      : 'border-slate-200 dark:border-darkSurface-border text-slate-400'
  }`}>
    {isOver ? 'Soltar aqui' : 'Nenhum card aqui'}
  </li>
);

/**
 * Coluna do Kanban com área de drop.
 * Todas as props não usadas aqui (handlers do card) são repassadas ao <Card />.
 */
export const KanbanColumn = ({
  column,
  cards,
  users,
  draggedCard,
  onDropCard,
  ...cardProps
}) => {
  const [isOver, setIsOver] = useState(false);
  const columnCards = cards.filter(c => c.status === column.id);

  const getOperatorName = (operatorId) => users.find(u => u.id === operatorId)?.name ?? null;

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDragLeave = (e) => {
    // Só desativa se sair da coluna em si
    if (!e.currentTarget.contains(e.relatedTarget)) setIsOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsOver(false);
    onDropCard?.(column.id);
  };

  return (
    <section
      aria-label={column.title}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-2xl p-3 sm:p-3.5 border transition-colors duration-150 flex flex-col h-full min-h-0 max-h-[calc(100vh-220px)] sm:max-h-[calc(100vh-200px)] ${
        isOver
          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-400 dark:border-brand-500 ring-2 ring-brand-400/30'
          : 'bg-slate-100/70 dark:bg-darkSurface-bg/70 border-slate-200 dark:border-darkSurface-border/80'
      }`}
    >
      <ColumnHeader title={column.title} color={column.theme.border} count={columnCards.length} />

      {/* Lista de Cards com Scroll Interno */}
      <ul className="space-y-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {columnCards.map(card => (
          <li key={card.id}>
            <Card
              {...cardProps}
              card={card}
              users={users}
              operatorName={getOperatorName(card.operator_id)}
              isDragging={draggedCard?.id === card.id}
            />
          </li>
        ))}

        {columnCards.length === 0 && <EmptyColumn isOver={isOver} />}
      </ul>
    </section>
  );
};
