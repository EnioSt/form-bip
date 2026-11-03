import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  BarChart3, 
  Calendar, 
  UserCheck, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ArrowRight, 
  Filter, 
  TrendingUp,
  Percent,
  AlertCircle,
  Building2,
  CalendarDays,
  RotateCcw
} from 'lucide-react';

export default function DashboardMetrics() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros: Usuário / Operador e Período (padrão: Mês atual)
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

  const [selectedOperator, setSelectedOperator] = useState('all');
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);

  useEffect(() => {
    async function loadData() {
      try {
        const [cardsRes, usersRes] = await Promise.all([
          api.getCards(),
          api.getUsers()
        ]);
        setCards(cardsRes);
        setUsers(usersRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const resetFilters = () => {
    setSelectedOperator('all');
    setStartDate(firstDayOfMonth);
    setEndDate(lastDayOfMonth);
  };

  // Filtragem dos cards
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // 1. Filtro por Operador
      if (selectedOperator !== 'all') {
        if (selectedOperator === 'unassigned') {
          if (card.operator_id) return false;
        } else if (card.operator_id !== selectedOperator) {
          return false;
        }
      }

      // 2. Filtro por Data de criação
      if (card.created_at) {
        const cardDate = card.created_at.split('T')[0];
        if (startDate && cardDate < startDate) return false;
        if (endDate && cardDate > endDate) return false;
      }

      return true;
    });
  }, [cards, selectedOperator, startDate, endDate]);

  // Cálculos de Métricas
  const metrics = useMemo(() => {
    const total = filteredCards.length;
    const triagem = filteredCards.filter(c => c.status === 'triagem').length;
    const preenchido = filteredCards.filter(c => c.status === 'preenchido').length;
    const implantacao = filteredCards.filter(c => c.status === 'implantacao').length;
    const concluido = filteredCards.filter(c => c.status === 'concluido').length;

    const taxaConclusao = total > 0 ? Math.round((concluido / total) * 100) : 0;
    const cardsComFoto = filteredCards.filter(c => c.formData?.photo_url).length;
    const cardsComPix = filteredCards.filter(c => c.formData && !c.formData.pix_nao_se_aplica && c.formData.pix_chave).length;

    // Desempenho por Operador
    const operatorStats = users.map(u => {
      const userCards = cards.filter(c => {
        if (c.operator_id !== u.id) return false;
        if (c.created_at) {
          const cardDate = c.created_at.split('T')[0];
          if (startDate && cardDate < startDate) return false;
          if (endDate && cardDate > endDate) return false;
        }
        return true;
      });

      const totalVinculados = userCards.length;
      const emImplantacao = userCards.filter(c => c.status === 'implantacao').length;
      const concluidos = userCards.filter(c => c.status === 'concluido').length;
      const preenchidos = userCards.filter(c => c.status === 'preenchido').length;

      return {
        ...u,
        totalVinculados,
        emImplantacao,
        concluidos,
        preenchidos,
        taxaConclusao: totalVinculados > 0 ? Math.round((concluidos / totalVinculados) * 100) : 0
      };
    });

    return {
      total,
      triagem,
      preenchido,
      implantacao,
      concluido,
      taxaConclusao,
      cardsComFoto,
      cardsComPix,
      operatorStats
    };
  }, [filteredCards, cards, users, startDate, endDate]);

  const currentMonthLabel = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header com Descrição */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-brand-500" size={26} />
            Métricas de Implantação SiTEF & BIP360
          </h1>
          <p className="text-sm text-slate-500 dark:text-darkSurface-muted">
            Painel consolidado de produtividade dos operadores, status e volumetria
          </p>
        </div>

        <div className="text-xs bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-lg border border-brand-200 dark:border-brand-900/60 font-semibold flex items-center gap-1.5 self-start sm:self-auto">
          <CalendarDays size={15} />
          <span className="capitalize">Referência: {currentMonthLabel}</span>
        </div>
      </div>

      {/* Barra de Filtros */}
      <div className="bg-white dark:bg-darkSurface-card rounded-2xl p-5 border border-slate-200 dark:border-darkSurface-border shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-darkSurface-border">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            <Filter size={15} className="text-brand-500" />
            <span>Filtros Estratégicos</span>
          </div>

          <button
            onClick={resetFilters}
            className="text-xs text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1 font-semibold transition"
          >
            <RotateCcw size={12} />
            <span>Mês Atual / Limpar</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Filtro Operador */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Operador Vinculado
            </label>
            <select
              value={selectedOperator}
              onChange={(e) => setSelectedOperator(e.target.value)}
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
                onChange={(e) => setStartDate(e.target.value)}
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
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cards de Métricas Gerais do Período */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Filtrado */}
        <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-slate-400">Total Cards</span>
            <Building2 size={16} className="text-slate-400" />
          </div>
          <div className="text-2xl font-black font-heading mt-1 text-slate-900 dark:text-white">{metrics.total}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">No período selecionado</span>
        </div>

        {/* Em Triagem */}
        <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-amber-500">Triagem</span>
            <Clock size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl font-black font-heading mt-1 text-amber-600 dark:text-amber-400">{metrics.triagem}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Aguardando cliente</span>
        </div>

        {/* Preenchidos */}
        <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-blue-500">Preenchidos</span>
            <Layers size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl font-black font-heading mt-1 text-blue-600 dark:text-blue-400">{metrics.preenchido}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Prontos para assumir</span>
        </div>

        {/* Em Implantação */}
        <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-purple-500">Implantação</span>
            <ArrowRight size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl font-black font-heading mt-1 text-purple-600 dark:text-purple-400">{metrics.implantacao}</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Em andamento técnico</span>
        </div>

        {/* Concluídos */}
        <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold text-emerald-500">Concluídos</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-heading mt-1 text-emerald-600 dark:text-emerald-400">{metrics.concluido}</div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1 block">
            {metrics.taxaConclusao}% de eficácia
          </span>
        </div>
      </div>

      {/* Tabela de Produtividade por Operador */}
      <div className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 border border-slate-200 dark:border-darkSurface-border shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-darkSurface-border">
          <div className="flex items-center space-x-2">
            <UserCheck className="text-brand-500" size={20} />
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Produtividade e Carga por Operador
            </h2>
          </div>
          <span className="text-xs text-slate-400">Dados baseados no período filtrado</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-darkSurface-bg/50 border-b border-slate-200 dark:border-darkSurface-border text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Operador</th>
                <th className="px-4 py-3 text-center">Cards Vinculados</th>
                <th className="px-4 py-3 text-center">Em Implantação</th>
                <th className="px-4 py-3 text-center">Já Concluídos</th>
                <th className="px-4 py-3 text-center">Taxa de Conclusão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-darkSurface-border">
              {metrics.operatorStats.map((op) => (
                <tr key={op.id} className="hover:bg-slate-50 dark:hover:bg-darkSurface-cardHover/50 transition">
                  <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-white flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
                      {op.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{op.name}</div>
                      <div className="text-[11px] text-slate-400">{op.email}</div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-200">
                    {op.totalVinculados}
                  </td>

                  <td className="px-4 py-3.5 text-center font-bold text-purple-600 dark:text-purple-400">
                    {op.emImplantacao}
                  </td>

                  <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                    {op.concluidos}
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    <div className="inline-flex items-center space-x-2">
                      <div className="w-16 bg-slate-200 dark:bg-darkSurface-bg rounded-full h-2 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full" 
                          style={{ width: `${op.taxaConclusao}%` }} 
                        />
                      </div>
                      <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{op.taxaConclusao}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Indicadores Adicionais de Qualidade Técnica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Qualidade Cadastral</span>
            <div className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
              {metrics.cardsComFoto} lojas com foto registrada
            </div>
            <p className="text-xs text-slate-500 dark:text-darkSurface-muted mt-0.5">
              Fotos da maquininha anexadas para abertura de chamado SiTEF
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            📷
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-bold text-slate-400">Adesão ao Pix TEF</span>
            <div className="text-xl font-bold font-heading text-slate-900 dark:text-white mt-1">
              {metrics.cardsComPix} lojas operando com Pix
            </div>
            <p className="text-xs text-slate-500 dark:text-darkSurface-muted mt-0.5">
              Chave Pix e homologação bancária FISERV cadastradas
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            ⚡
          </div>
        </div>
      </div>
    </div>
  );
}

