import { useState } from "react";

/**
 * Mês exibido no calendário, com navegação para o anterior/próximo.
 */
export const useCalendarMonth = (initialDate) => {
  const [calendarDate, setCalendarDate] = useState(initialDate);

  const goToPrevMonth = () =>
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));

  const goToNextMonth = () =>
    setCalendarDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  return { calendarDate, goToPrevMonth, goToNextMonth };
};
