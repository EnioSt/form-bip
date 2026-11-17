import { Filter, RotateCcw, Store } from "lucide-react";
import { FilterField } from "../FilterField";

const CONTROL_CLASS =
  "w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500";

const UpdatingBadge = () => (
  <span role="status" className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 animate-pulse">
    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping inline-block" />
    Atualizando...
  </span>
);

/**
 * Barra de filtros do painel de métricas: loja, operador e período.
 */
export const DashboardFilterBar = ({
  users,
  cards = [],
  selectedStore = "all",
  selectedOperator,
  startDate,
  endDate,
  isFiltering = false,
  onChangeStore,
  onChangeOperator,
  onChangeStartDate,
  onChangeEndDate,
  onReset,
}) => {
  return (
    <section aria-label="Filtros" className="bg-white dark:bg-darkSurface-card rounded-2xl p-5 border border-slate-200 dark:border-darkSurface-border shadow-sm">
      <header className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-darkSurface-border">
        <h2 className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Filter size={15} className="text-brand-500" />
          <span>Filtros Estratégicos</span>
          {isFiltering && <UpdatingBadge />}
        </h2>

        <button
          type="button"
          onClick={onReset}
          disabled={isFiltering}
          className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 font-semibold transition disabled:opacity-50"
        >
          <RotateCcw size={12} className={isFiltering ? "animate-spin" : ""} />
          <span>Mês Atual / Limpar</span>
        </button>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterField id="filter-store" label="Loja / Unidade" icon={Store}>
          <select
            id="filter-store"
            value={selectedStore}
            onChange={(e) => onChangeStore(e.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="all">Todas as Lojas</option>
            {cards.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField id="filter-operator" label="Operador Vinculado">
          <select
            id="filter-operator"
            value={selectedOperator}
            onChange={(e) => onChangeOperator(e.target.value)}
            className={CONTROL_CLASS}
          >
            <option value="all">Todos os Operadores</option>
            <option value="unassigned">Sem Operador Atribuído</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === "admin" ? "Admin" : "Operador"})
              </option>
            ))}
          </select>
        </FilterField>

        <FilterField id="filter-start-date" label="Data Inicial">
          <input
            id="filter-start-date"
            type="date"
            value={startDate}
            onChange={(e) => onChangeStartDate(e.target.value)}
            className={CONTROL_CLASS}
          />
        </FilterField>

        <FilterField id="filter-end-date" label="Data Final">
          <input
            id="filter-end-date"
            type="date"
            value={endDate}
            onChange={(e) => onChangeEndDate(e.target.value)}
            className={CONTROL_CLASS}
          />
        </FilterField>
      </div>
    </section>
  );
};
