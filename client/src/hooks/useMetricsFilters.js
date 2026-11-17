import { useState } from "react";

const FEEDBACK_DURATION_MS = 350;

/**
 * Filtros do painel de métricas (loja, operador e período) com feedback visual
 * rápido ("Atualizando...") a cada alteração.
 * - defaultRange: { start, end } usado no carregamento e ao limpar
 */
export const useMetricsFilters = (defaultRange) => {
  const [store, setStore] = useState("all");
  const [operator, setOperator] = useState("all");
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [isFiltering, setIsFiltering] = useState(false);

  const triggerFeedback = () => {
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), FEEDBACK_DURATION_MS);
  };

  const withFeedback = (setter) => (value) => {
    setter(value);
    triggerFeedback();
  };

  const reset = () => {
    setOperator("all");
    setStore("all");
    setStartDate(defaultRange.start);
    setEndDate(defaultRange.end);
    triggerFeedback();
  };

  return {
    store,
    operator,
    startDate,
    endDate,
    isFiltering,
    changeStore: withFeedback(setStore),
    changeOperator: withFeedback(setOperator),
    changeStartDate: withFeedback(setStartDate),
    changeEndDate: withFeedback(setEndDate),
    reset,
  };
};
