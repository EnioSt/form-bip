import { Calendar } from "lucide-react";
import { CalendarLegend } from "../CalendarLegend";
import { MonthNavigator } from "../MonthNavigator";
import { CalendarDayCell } from "../CalendarDayCell";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const WeekdayHeader = ({ isFullscreen }) => {
  const weekendClass = `text-slate-400 dark:text-slate-500 ${
    isFullscreen ? "bg-slate-100/70 dark:bg-darkSurface-card/70" : "bg-slate-100/60 dark:bg-darkSurface-card/60"
  }`;

  return (
    <div
      aria-hidden="true"
      className={`grid grid-cols-7 border-b border-slate-200 dark:border-darkSurface-border text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase py-1.5 shrink-0 ${
        isFullscreen ? "bg-slate-50/90 dark:bg-darkSurface-bg/90" : "bg-slate-50 dark:bg-darkSurface-bg/70"
      }`}
    >
      {WEEKDAYS.map((label, idx) => (
        <div key={label} className={idx === 0 || idx === 6 ? weekendClass : undefined}>
          {label}
        </div>
      ))}
    </div>
  );
};

/**
 * Calendário mensal de implantações previstas.
 * A grade (calendarGrid) é calculada pela página; aqui é apenas a exibição.
 */
export const CalendarWidget = ({
  calendarGrid,
  calendarMonthLabel,
  isFullscreen = false,
  onPrevMonth,
  onNextMonth,
}) => {
  return (
    <section
      aria-labelledby="calendar-title"
      className={`rounded-2xl border border-slate-200 dark:border-darkSurface-border shadow-sm flex flex-col ${
        isFullscreen
          ? "h-full p-4 sm:p-5 justify-between bg-white/85 dark:bg-darkSurface-card/90 backdrop-blur-sm"
          : "p-6 space-y-4 bg-white dark:bg-darkSurface-card"
      }`}
    >
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-darkSurface-border shrink-0">
        <div className="flex items-center space-x-2.5">
          <figure className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Calendar size={18} />
          </figure>
          <hgroup>
            <h2 id="calendar-title" className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Calendário de Implantações Previstas
            </h2>
            <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
              Visualização mensal das lojas agendadas para ativação técnica do SiTEF
            </p>
          </hgroup>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          <CalendarLegend />
          <MonthNavigator label={calendarMonthLabel} onPrev={onPrevMonth} onNext={onNextMonth} />
        </div>
      </header>

      <div className={`border border-slate-200 dark:border-darkSurface-border rounded-xl flex flex-col ${isFullscreen ? "flex-1 min-h-0" : "overflow-hidden"}`}>
        <WeekdayHeader isFullscreen={isFullscreen} />

        <ol
          className={`grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-darkSurface-border/60 ${
            isFullscreen ? "flex-1 min-h-0 bg-white/80 dark:bg-darkSurface-card/85" : "bg-white dark:bg-darkSurface-card"
          }`}
          style={isFullscreen ? { gridAutoRows: "minmax(min-content, 1fr)" } : {}}
        >
          {calendarGrid.map((day, idx) => {
            const dayOfWeek = idx % 7; // 0 = Dom, 6 = Sáb
            return (
              <CalendarDayCell
                key={idx}
                day={day}
                isWeekend={dayOfWeek === 0 || dayOfWeek === 6}
                isFullscreen={isFullscreen}
              />
            );
          })}
        </ol>
      </div>
    </section>
  );
};
