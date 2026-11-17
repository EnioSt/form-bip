import { UserCheck, Edit2 } from 'lucide-react';

const OperatorSelect = ({ value, users, onSelect, onCancel }) => (
  <select
    value={value || ''}
    onChange={onSelect}
    onBlur={onCancel}
    autoFocus
    aria-label="Operador responsável"
    className="text-[11px] py-0.5 px-1.5 rounded bg-white dark:bg-darkSurface-card border border-brand-400 text-slate-800 dark:text-white focus:outline-none shadow-xs"
  >
    <option value="">Nenhum</option>
    {users.map(u => (
      <option key={u.id} value={u.id}>
        {u.name} ({u.role === 'admin' ? 'Admin' : 'Operador'})
      </option>
    ))}
  </select>
);

/**
 * Tag do operador responsável pelo ticket.
 * Admins podem trocar o operador a qualquer momento (select inline).
 */
export const OperatorTag = ({
  operatorName,
  operatorId,
  users = [],
  canEdit = false,
  isEditing = false,
  onStartEdit,
  onCancelEdit,
  onSelect
}) => {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {operatorName ? (
        <span className="inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60 font-medium">
          <UserCheck size={12} />
          <span>{operatorName}</span>
        </span>
      ) : (
        <span className="text-xs text-slate-400 italic">Sem operador</span>
      )}

      {canEdit && (
        <span onClick={(e) => e.stopPropagation()} className="relative inline-block">
          {isEditing ? (
            <OperatorSelect
              value={operatorId}
              users={users}
              onSelect={onSelect}
              onCancel={onCancelEdit}
            />
          ) : (
            <button
              type="button"
              onClick={onStartEdit}
              className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded transition"
              title="Trocar operador responsável (Admin)"
            >
              <Edit2 size={11} />
            </button>
          )}
        </span>
      )}
    </div>
  );
};
