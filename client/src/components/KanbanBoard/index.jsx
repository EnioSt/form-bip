import { KanbanColumn } from '../KanbanColumn';

/**
 * Grade de colunas do Kanban. Repassa as demais props para cada <KanbanColumn />.
 */
export const KanbanBoard = ({ columns, ...columnProps }) => {
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 min-h-0 items-stretch">
      {columns.map(column => (
        <KanbanColumn key={column.id} column={column} {...columnProps} />
      ))}
    </div>
  );
};
