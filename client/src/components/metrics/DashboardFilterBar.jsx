import React from 'react';
import { Filter, RotateCcw, Store } from 'lucide-react';

export default function DashboardFilterBar({
  users,
  cards = [],
  selectedStore = 'all',
  selectedOperator,
  startDate,
  endDate,
  isFiltering = false,
  onChangeStore,
  onChangeOperator,
  onChangeStartDate,
  onChangeEndDate,
  onReset
}) {
  return (
    <div className="bg-white dark:bg-darkSurface-card rounded-2xl p-5 border border-slate-200 dark:border-darkSurface-border shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-darkSurface-border">
        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          <Filter size={15} className="text-brand-500" />
          <span>Filtros Estratégicos</span>
          {isFiltering && (
            <span className="flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-ping inline-block" />
              Atualizando...
            </span>
          )}
        </div>

        <button
          onClick={onReset}
          disabled={isFiltering}
          className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 font-semibold transition disabled:opacity-50"
        >
          <RotateCcw size={12} className={isFiltering ? 'animate-spin' : ''} />
          <span>Mês Atual / Limpar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Filtro por Loja / Unidade */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5 flex items-center gap-1">
            <Store size={13} className="text-brand-500" />
            <span>Loja / Unidade</span>
          </label>
          <select
            value={selectedStore}
            onChange={(e) => onChangeStore(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Todas as Lojas</option>
            {cards.map(c => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro Operador */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Operador Vinculado
          </label>
          <select
            value={selectedOperator}
            onChange={(e) => onChangeOperator(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="all">Todos os Operadores</option>
            <option value="unassigned">Sem Operador Atribuído</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role === 'admin' ? 'Admin' : 'Operador'})
              </option>
            ))}
          </select>
        </div>

        {/* Data Início */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Data Inicial
          </label>
          <div className="relative">
            <input
              type="date"
              value={startDate}
              onChange={(e) => onChangeStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Data Fim */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
            Data Final
          </label>
          <div className="relative">
            <input
              type="date"
              value={endDate}
              onChange={(e) => onChangeEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
