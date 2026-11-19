import { Plus, CreditCard } from 'lucide-react';
import { SearchInput } from '../SearchInput';

const OperatorFilter = ({ value, users, onChange }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    aria-label="Filtrar por operador"
    className="shrink-0 py-1.5 pl-3 pr-7 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs cursor-pointer font-medium"
  >
    <option value="all">Todos os Operadores</option>
    <option value="unassigned">Sem Operador Atribuído</option>
    {users.map((u) => (
      <option key={u.id} value={u.id}>
        {u.name} {u.is_active === false ? '(Inativo)' : ''}
      </option>
    ))}
  </select>
);

/**
 * Cabeçalho da página do Kanban: título, busca, filtro por operador e ações.
 */
export const KanbanToolbar = ({
  searchTerm,
  onSearchChange,
  operatorFilter,
  onOperatorFilterChange,
  users,
  isAdmin,
  onAddAcquirer,
  onAddCard
}) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
      <hgroup>
        <h1 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
          Kanban de Onboarding & SiTEF
        </h1>
        <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
          Clique em qualquer card para visualizar os dados preenchidos pelo cliente
        </p>
      </hgroup>

      <div role="toolbar" aria-label="Ações do Kanban" className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto">
        <SearchInput
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Buscar unidade ou loja..."
        />

        <OperatorFilter value={operatorFilter} users={users} onChange={onOperatorFilterChange} />

        <button
          type="button"
          onClick={onAddAcquirer}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-card dark:hover:bg-darkSurface-cardHover text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-darkSurface-border font-medium rounded-lg transition text-xs sm:text-sm shrink-0 whitespace-nowrap shadow-2xs"
          title="Cadastrar nova adquirente para seleção nos formulários"
        >
          <CreditCard size={15} className="text-brand-500" />
          <span>Adicionar Adquirente</span>
        </button>

        {/* Só aparece se a página fornecer onAddCard (hoje desativado: cards vêm da API de franquias) */}
        {isAdmin && onAddCard && (
          <button
            type="button"
            onClick={onAddCard}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium rounded-lg shadow-sm transition text-xs sm:text-sm shrink-0 whitespace-nowrap"
          >
            <Plus size={16} />
            <span>Novo Card / Loja</span>
          </button>
        )}
      </div>
    </header>
  );
};
