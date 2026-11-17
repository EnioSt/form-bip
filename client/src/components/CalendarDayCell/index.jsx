import { CalendarEvent } from "../CalendarEvent";

const getEmptyCellBg = (isWeekend, isFullscreen) => {
  if (isWeekend) return isFullscreen ? "bg-slate-100/75 dark:bg-darkSurface-bg/70" : "bg-slate-100/70 dark:bg-darkSurface-bg/60";
  return isFullscreen ? "bg-slate-50/70 dark:bg-darkSurface-bg/60" : "bg-slate-50/50 dark:bg-darkSurface-bg/30";
};

const getDayCellBg = (isToday, isWeekend, isFullscreen) => {
  if (isToday) return "bg-purple-50/80 dark:bg-purple-950/40";
  if (isWeekend) return isFullscreen ? "bg-slate-50/85 dark:bg-darkSurface-bg/65" : "bg-slate-50/70 dark:bg-darkSurface-bg/40";
  return isFullscreen ? "bg-white/80 dark:bg-darkSurface-card/80" : "bg-white dark:bg-darkSurface-card";
};

const getDayNumberTone = (isToday, isWeekend) => {
  if (isToday) return "bg-purple-600 text-white shadow-sm";
  if (isWeekend) return "text-slate-500 dark:text-slate-400";
  return "text-slate-700 dark:text-slate-300";
};

/**
 * Célula de um dia no calendário. Células fora do mês são renderizadas vazias.
 */
export const CalendarDayCell = ({ day, isWeekend, isFullscreen }) => {
  if (!day.isCurrentMonth) {
    return (
      <li
        aria-hidden="true"
        className={`p-1.5 flex flex-col ${getEmptyCellBg(isWeekend, isFullscreen)} text-slate-300 dark:text-slate-600 ${
          isFullscreen ? "min-h-[50px] h-full" : "min-h-[90px]"
        }`}
      />
    );
  }

  const count = day.items.length;

  return (
    <li
      aria-current={day.isToday ? "date" : undefined}
      className={`p-1.5 sm:p-2 flex flex-col transition hover:bg-slate-100/70 dark:hover:bg-darkSurface-bg/60 ${
        isFullscreen ? "min-h-[60px] h-full" : "min-h-[90px]"
      } ${getDayCellBg(day.isToday, isWeekend, isFullscreen)}`}
    >
      <header className="flex items-center justify-between mb-1 shrink-0">
        <time
          dateTime={day.dateString}
          className={`font-bold rounded-full flex items-center justify-center ${
            isFullscreen ? "text-[11px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6" : "text-xs w-5 h-5"
          } ${getDayNumberTone(day.isToday, isWeekend)}`}
        >
          {day.dayNumber}
        </time>
        {count > 0 && (
          <span className={`font-bold text-slate-600 dark:text-slate-300 ${isFullscreen ? "text-[10px] sm:text-[11px]" : "text-[10px]"}`}>
            {count} {count === 1 ? "loja" : "lojas"}
          </span>
        )}
      </header>

      {/* Lojas agendadas para este dia - exibe todas adaptando a altura naturalmente */}
      <ul className={`flex-1 flex flex-col gap-1 ${isFullscreen ? "justify-start" : "overflow-y-auto custom-scrollbar"}`}>
        {day.items.map((item) => (
          <CalendarEvent key={item.id} item={item} isFullscreen={isFullscreen} />
        ))}
      </ul>
    </li>
  );
};
