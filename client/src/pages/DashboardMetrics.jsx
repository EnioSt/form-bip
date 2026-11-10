import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart3, CalendarDays, Maximize2, Minimize2, Tv } from 'lucide-react';

import DashboardFilterBar from '../components/metrics/DashboardFilterBar';
import MetricsSummaryCards from '../components/metrics/MetricsSummaryCards';
import CalendarWidget from '../components/metrics/CalendarWidget';
import OperatorStatsTable from '../components/metrics/OperatorStatsTable';

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
  const [selectedStore, setSelectedStore] = useState('all');
  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [isFiltering, setIsFiltering] = useState(false);

  // Mês e Ano do Calendário de Implantações Previstas
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Estado de Tela Cheia (F11 ou botão TV)
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error('Erro ao ativar tela cheia:', err);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const handlePrevMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

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

  const triggerFilterFeedback = () => {
    setIsFiltering(true);
    setTimeout(() => {
      setIsFiltering(false);
    }, 350);
  };

  const handleStoreChange = (val) => {
    setSelectedStore(val);
    triggerFilterFeedback();
  };

  const handleOperatorChange = (val) => {
    setSelectedOperator(val);
    triggerFilterFeedback();
  };

  const handleStartDateChange = (val) => {
    setStartDate(val);
    triggerFilterFeedback();
  };

  const handleEndDateChange = (val) => {
    setEndDate(val);
    triggerFilterFeedback();
  };

  const resetFilters = () => {
    setSelectedOperator('all');
    setSelectedStore('all');
    setStartDate(firstDayOfMonth);
    setEndDate(lastDayOfMonth);
    triggerFilterFeedback();
  };

  // Filtragem dos cards (Em modo Fullscreen/TV: exibe todos os cards sem filtro de data)
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      // No modo TV, desconsidera filtros para exibir a visão geral acumulada
      if (isFullscreen) return true;

      // 1. Filtro por Loja / Unidade
      if (selectedStore !== 'all' && card.id !== selectedStore) {
        return false;
      }

      // 2. Filtro por Operador
      if (selectedOperator !== 'all') {
        if (selectedOperator === 'unassigned') {
          if (card.operator_id) return false;
        } else if (card.operator_id !== selectedOperator) {
          return false;
        }
      }

      // 3. Filtro por Data de criação
      if (card.created_at) {
        const cardDate = card.created_at.split('T')[0];
        if (startDate && cardDate < startDate) return false;
        if (endDate && cardDate > endDate) return false;
      }

      return true;
    });
  }, [cards, isFullscreen, selectedStore, selectedOperator, startDate, endDate]);

  // Cálculos de Métricas
  const metrics = useMemo(() => {
    const total = filteredCards.length;
    const triagem = filteredCards.filter(c => c.status === 'triagem').length;
    const preenchido = filteredCards.filter(c => c.status === 'preenchido').length;
    const implantacao = filteredCards.filter(c => c.status === 'implantacao').length;
    const concluido = filteredCards.filter(c => c.status === 'concluido').length;

    // Total acumulado desde sempre (all time)
    let allTimePdvs = 0;
    let allTimeTotems = 0;
    cards.forEach(c => {
      if (c.formData) {
        const pdvs = parseInt(c.formData.qtd_pdvs_tef, 10);
        if (!isNaN(pdvs) && pdvs > 0) allTimePdvs += pdvs;

        const totems = parseInt(c.formData.qtd_totems_tef, 10);
        if (!isNaN(totems) && totems > 0) allTimeTotems += totems;
      }
    });

    // Totalização de PDVs e TOTEMs no período filtrado (ou all time se modo TV)
    let totalPdvs = 0;
    let totalTotems = 0;
    filteredCards.forEach(c => {
      if (c.formData) {
        const pdvs = parseInt(c.formData.qtd_pdvs_tef, 10);
        if (!isNaN(pdvs) && pdvs > 0) totalPdvs += pdvs;

        const totems = parseInt(c.formData.qtd_totems_tef, 10);
        if (!isNaN(totems) && totems > 0) totalTotems += totems;
      }
    });

    const taxaConclusao = total > 0 ? Math.round((concluido / total) * 100) : 0;
    const cardsComFoto = filteredCards.filter(c => c.formData?.photo_url).length;
    const cardsComPix = filteredCards.filter(c => c.formData && !c.formData.pix_nao_se_aplica && c.formData.pix_chave).length;

    // Desempenho por Operador
    const operatorStats = users.map(u => {
      const userCards = cards.filter(c => {
        if (selectedStore !== 'all' && c.id !== selectedStore) return false;
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
      totalPdvs,
      totalTotems,
      allTimePdvs,
      allTimeTotems,
      triagem,
      preenchido,
      implantacao,
      concluido,
      taxaConclusao,
      cardsComFoto,
      cardsComPix,
      operatorStats
    };
  }, [filteredCards, cards, users, selectedStore, startDate, endDate]);

  // Grade do Calendário Mensal
  const calendarGrid = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const scheduledMap = {};
    cards.forEach(card => {
      if (card.scheduled_date) {
        const [cYear, cMonth] = card.scheduled_date.split('-').map(Number);
        if (cYear === year && cMonth === month + 1) {
          if (!scheduledMap[card.scheduled_date]) {
            scheduledMap[card.scheduled_date] = [];
          }
          scheduledMap[card.scheduled_date].push(card);
        }
      }
    });

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ dayNumber: null, isCurrentMonth: false });
    }

    for (let d = 1; d <= totalDays; d++) {
      const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isToday = new Date().toISOString().split('T')[0] === formattedDate;
      days.push({
        dayNumber: d,
        dateString: formattedDate,
        isCurrentMonth: true,
        isToday,
        items: scheduledMap[formattedDate] || []
      });
    }

    return days;
  }, [calendarDate, cards]);

  const currentMonthLabel = new Date().toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const calendarMonthLabel = calendarDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <div className={`space-y-4 ${isFullscreen ? 'h-full flex flex-col justify-between overflow-hidden' : ''}`}>
      {/* Header com Descrição e Botão Modo TV / Fullscreen */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-brand-500" size={24} />
            Métricas de Implantação SiTEF & BIP360
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-darkSurface-muted">
            Painel consolidado de produtividade dos operadores, status e volumetria
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="text-xs bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-lg border border-brand-200 dark:border-brand-900/60 font-semibold flex items-center gap-1.5">
            <CalendarDays size={14} />
            <span className="capitalize">Referência: {currentMonthLabel}</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-card dark:hover:bg-darkSurface-cardHover border border-slate-200 dark:border-darkSurface-border text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-sm"
            title={isFullscreen ? 'Sair do Modo TV (Esc)' : 'Ativar Modo TV / Tela Cheia (F11)'}
          >
            {isFullscreen ? (
              <>
                <Minimize2 size={14} />
                <span>Sair Modo TV</span>
              </>
            ) : (
              <>
                <Tv size={14} className="text-purple-500" />
                <span>Modo TV (F11)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Barra de Filtros - Ocultada no Modo TV / Tela Cheia */}
      {!isFullscreen && (
        <DashboardFilterBar
          users={users}
          cards={cards}
          selectedStore={selectedStore}
          selectedOperator={selectedOperator}
          startDate={startDate}
          endDate={endDate}
          isFiltering={isFiltering}
          onChangeStore={handleStoreChange}
          onChangeOperator={handleOperatorChange}
          onChangeStartDate={handleStartDateChange}
          onChangeEndDate={handleEndDateChange}
          onReset={resetFilters}
        />
      )}

      {/* Cards de Métricas Gerais do Período */}
      <div className={`shrink-0 transition-opacity duration-200 ${isFiltering ? 'opacity-60' : 'opacity-100'}`}>
        <MetricsSummaryCards metrics={metrics} isFullscreen={isFullscreen} />
      </div>

      {/* Calendário de Implantações Previstas */}
      <div className={isFullscreen ? 'flex-1 min-h-0' : ''}>
        <CalendarWidget
          calendarGrid={calendarGrid}
          calendarMonthLabel={calendarMonthLabel}
          isFullscreen={isFullscreen}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
        />
      </div>

      {/* Demais tabelas e detalhes - Ocultados no Modo TV / Tela Cheia para visualização limpa nas TVs */}
      {!isFullscreen && (
        <>
          {/* Tabela de Produtividade por Operador */}
          <OperatorStatsTable operatorStats={metrics.operatorStats} />

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
        </>
      )}
    </div>
  );
}
