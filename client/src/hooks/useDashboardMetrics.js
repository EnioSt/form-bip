import { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { useMetricsFilters } from "./useMetricsFilters";
import { useCalendarMonth } from "./useCalendarMonth";
import {
  toISODate,
  getMonthRange,
  filterCards,
  computeMetrics,
  buildCalendarGrid,
  formatMonthLabel,
} from "../utils/metrics";

/**
 * Dados do painel de métricas: carrega cards/usuários, aplica filtros e
 * calcula métricas e calendário.
 * - isFullscreen: no Modo TV os filtros são ignorados (visão acumulada)
 */
export const useDashboardMetrics = ({ isFullscreen }) => {
  // "Hoje" é fixado na montagem para manter o render puro
  const [today] = useState(() => new Date());
  const todayISO = toISODate(today);

  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = useMetricsFilters(getMonthRange(today));
  const calendar = useCalendarMonth(today);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cardsRes, usersRes] = await Promise.all([api.getCards(), api.getUsers()]);
        setCards(cardsRes);
        setUsers(usersRes);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const { store, operator, startDate, endDate } = filters;

  const filteredCards = useMemo(
    () => filterCards(cards, { store, operator, startDate, endDate, ignoreFilters: isFullscreen }),
    [cards, store, operator, startDate, endDate, isFullscreen],
  );

  const metrics = useMemo(
    () => computeMetrics({ filteredCards, cards, users, filters: { store, startDate, endDate } }),
    [filteredCards, cards, users, store, startDate, endDate],
  );

  const calendarGrid = useMemo(
    () => buildCalendarGrid(calendar.calendarDate, cards, todayISO),
    [calendar.calendarDate, cards, todayISO],
  );

  return {
    cards,
    users,
    loading,
    filters,
    metrics,
    calendar: {
      grid: calendarGrid,
      monthLabel: formatMonthLabel(calendar.calendarDate),
      goToPrevMonth: calendar.goToPrevMonth,
      goToNextMonth: calendar.goToNextMonth,
    },
    referenceLabel: formatMonthLabel(today),
  };
};
