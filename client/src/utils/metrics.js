/**
 * Funções puras de cálculo do painel de métricas.
 * Não dependem de React: recebem dados e devolvem resultados.
 */

export const toISODate = (date) => date.toISOString().split("T")[0];

/** Primeiro e último dia do mês da data informada (YYYY-MM-DD). */
export const getMonthRange = (date) => ({
  start: toISODate(new Date(date.getFullYear(), date.getMonth(), 1)),
  end: toISODate(new Date(date.getFullYear(), date.getMonth() + 1, 0)),
});

const isWithinPeriod = (card, startDate, endDate) => {
  if (!card.created_at) return true;
  const cardDate = card.created_at.split("T")[0];
  if (startDate && cardDate < startDate) return false;
  if (endDate && cardDate > endDate) return false;
  return true;
};

const matchesOperator = (card, operator) => {
  if (operator === "all") return true;
  if (operator === "unassigned") return !card.operator_id;
  return card.operator_id === operator;
};

const toPositiveInt = (value) => {
  const n = parseInt(value, 10);
  return !isNaN(n) && n > 0 ? n : 0;
};

const countByStatus = (cards, status) => cards.filter((c) => c.status === status).length;

/** Loja ativa = não foi inativada manualmente nem pela API de franquias. */
export const isCardActive = (card) => card.is_active !== false;

/** Mantém só as lojas ativas: inativas ficam no histórico do card, fora dos relatórios. */
export const onlyActiveCards = (cards) => cards.filter(isCardActive);

/**
 * Aplica os filtros de loja, operador e período.
 * No modo TV (ignoreFilters) devolve todos os cards para a visão geral acumulada.
 */
export const filterCards = (cards, { store, operator, startDate, endDate, ignoreFilters }) => {
  if (ignoreFilters) return cards;
  return cards.filter(
    (card) =>
      (store === "all" || card.id === store) &&
      matchesOperator(card, operator) &&
      isWithinPeriod(card, startDate, endDate),
  );
};

/** Totais acumulados desde sempre, considerando apenas lojas ativas. */
const computeAllTimeTotals = (cards) => {
  const totals = { allTimePdvs: 0, allTimeTotems: 0, allTimeConcluidos: 0, allTimeLojasAtivas: 0 };

  onlyActiveCards(cards).forEach((c) => {
    totals.allTimeLojasAtivas += 1;
    if (c.status === "concluido") totals.allTimeConcluidos += 1;
    if (c.formData) {
      totals.allTimePdvs += toPositiveInt(c.formData.qtd_pdvs_tef);
      totals.allTimeTotems += toPositiveInt(c.formData.qtd_totems_tef);
    }
  });

  return totals;
};

/** PDVs e TOTEMs do conjunto filtrado, considerando apenas lojas ativas. */
const computeTerminalTotals = (cards) => {
  let totalPdvs = 0;
  let totalTotems = 0;
  onlyActiveCards(cards).forEach((c) => {
    if (c.formData) {
      totalPdvs += toPositiveInt(c.formData.qtd_pdvs_tef);
      totalTotems += toPositiveInt(c.formData.qtd_totems_tef);
    }
  });
  return { totalPdvs, totalTotems };
};

/** Desempenho por operador (respeita filtros de loja e período, nunca o de operador). */
const computeOperatorStats = (cards, users, { store, startDate, endDate }) =>
  users.map((u) => {
    const userCards = onlyActiveCards(cards).filter(
      (c) =>
        (store === "all" || c.id === store) &&
        c.operator_id === u.id &&
        isWithinPeriod(c, startDate, endDate),
    );

    const totalVinculados = userCards.length;
    const concluidos = countByStatus(userCards, "concluido");

    return {
      ...u,
      totalVinculados,
      emImplantacao: countByStatus(userCards, "implantacao"),
      concluidos,
      preenchidos: countByStatus(userCards, "preenchido"),
      taxaConclusao: totalVinculados > 0 ? Math.round((concluidos / totalVinculados) * 100) : 0,
    };
  });

/**
 * Consolida todas as métricas exibidas no painel.
 * Lojas inativas não entram em nenhuma contagem (só em `inativas`, para informação).
 */
export const computeMetrics = ({ filteredCards, cards, users, filters }) => {
  const activeCards = onlyActiveCards(filteredCards);
  const total = activeCards.length;
  const concluido = countByStatus(activeCards, "concluido");

  return {
    total,
    inativas: filteredCards.length - total,
    ...computeTerminalTotals(activeCards),
    ...computeAllTimeTotals(cards),
    triagem: countByStatus(activeCards, "triagem"),
    preenchido: countByStatus(activeCards, "preenchido"),
    implantacao: countByStatus(activeCards, "implantacao"),
    concluido,
    taxaConclusao: total > 0 ? Math.round((concluido / total) * 100) : 0,
    cardsComFoto: activeCards.filter((c) => c.formData?.photo_url).length,
    cardsComPix: activeCards.filter(
      (c) => c.formData && !c.formData.pix_nao_se_aplica && c.formData.pix_chave,
    ).length,
    operatorStats: computeOperatorStats(cards, users, filters),
  };
};

/**
 * Monta a grade mensal do calendário com as lojas agendadas em cada dia.
 * Dias anteriores ao dia 1 (alinhamento da semana) vêm como células vazias.
 */
export const buildCalendarGrid = (calendarDate, cards, todayISO) => {
  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();
  const startingDayOfWeek = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const scheduledMap = {};
  cards.forEach((card) => {
    if (!card.scheduled_date) return;
    const [cYear, cMonth] = card.scheduled_date.split("-").map(Number);
    if (cYear === year && cMonth === month + 1) {
      (scheduledMap[card.scheduled_date] ??= []).push(card);
    }
  });

  const days = Array.from({ length: startingDayOfWeek }, () => ({ dayNumber: null, isCurrentMonth: false }));

  for (let d = 1; d <= totalDays; d++) {
    const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    days.push({
      dayNumber: d,
      dateString,
      isCurrentMonth: true,
      isToday: todayISO === dateString,
      items: scheduledMap[dateString] || [],
    });
  }

  return days;
};

export const formatMonthLabel = (date) =>
  date.toLocaleString("pt-BR", { month: "long", year: "numeric" });
