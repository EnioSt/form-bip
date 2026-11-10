import React from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CalendarWidget({
  calendarGrid,
  calendarMonthLabel,
  isFullscreen = false,
  onPrevMonth,
  onNextMonth
}) {
  return (
    <div className={`bg-white dark:bg-darkSurface-card rounded-2xl border border-slate-200 dark:border-darkSurface-border shadow-sm flex flex-col ${
      isFullscreen ? 'h-full p-4 sm:p-5 justify-between' : 'p-6 space-y-4'
    }`}>
      {/* Header do Calendário */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-darkSurface-border shrink-0">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Calendar size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
              Calendário de Implantações Previstas
            </h2>
            <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
              Visualização mensal das lojas agendadas para ativação técnica do SiTEF
            </p>
          </div>
        </div>

        {/* Navegação entre Meses */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-darkSurface-border hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover text-slate-600 dark:text-slate-300 transition"
            title="Mês Anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-white px-3 py-1 bg-slate-50 dark:bg-darkSurface-bg rounded-lg border border-slate-200 dark:border-darkSurface-border capitalize min-w-[140px] text-center">
            {calendarMonthLabel}
          </span>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-darkSurface-border hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover text-slate-600 dark:text-slate-300 transition"
            title="Próximo Mês"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Grade do Calendário */}
      <div className={`border border-slate-200 dark:border-darkSurface-border rounded-xl overflow-hidden flex flex-col ${
        isFullscreen ? 'flex-1 min-h-0' : ''
      }`}>
        {/* Cabeçalho dos Dias da Semana */}
        <div className="grid grid-cols-7 bg-slate-50 dark:bg-darkSurface-bg/70 border-b border-slate-200 dark:border-darkSurface-border text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase py-2 shrink-0">
          <div className="text-slate-400 dark:text-slate-500 bg-slate-100/60 dark:bg-darkSurface-card/60">Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div className="text-slate-400 dark:text-slate-500 bg-slate-100/60 dark:bg-darkSurface-card/60">Sáb</div>
        </div>

        {/* Células dos Dias */}
        <div className={`grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-darkSurface-border/60 bg-white dark:bg-darkSurface-card ${
          isFullscreen ? 'flex-1 h-full' : ''
        }`}
        style={isFullscreen ? { gridTemplateRows: 'repeat(6, minmax(0, 1fr))' } : {}}
        >
          {calendarGrid.map((day, idx) => {
            const dayOfWeek = idx % 7; // 0 = Dom, 6 = Sáb
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            if (!day.isCurrentMonth) {
              return (
                <div key={idx} className={`p-1.5 ${
                  isWeekend 
                    ? 'bg-slate-100/70 dark:bg-darkSurface-bg/60' 
                    : 'bg-slate-50/50 dark:bg-darkSurface-bg/30'
                } text-slate-300 dark:text-slate-600 ${
                  isFullscreen ? 'min-h-[135px] h-full' : 'min-h-[90px]'
                }`} />
              );
            }

            return (
              <div 
                key={idx} 
                className={`p-2 flex flex-col transition hover:bg-slate-100/60 dark:hover:bg-darkSurface-bg/50 ${
                  isFullscreen ? 'min-h-[135px] h-full' : 'min-h-[90px]'
                } ${
                  day.isToday 
                    ? 'bg-purple-50/60 dark:bg-purple-950/20' 
                    : isWeekend 
                      ? 'bg-slate-50/80 dark:bg-darkSurface-bg/50' 
                      : 'bg-white dark:bg-darkSurface-card'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 shrink-0">
                  <span 
                    className={`font-bold rounded-full flex items-center justify-center ${
                      isFullscreen ? 'text-xs w-6 h-6' : 'text-xs w-5 h-5'
                    } ${
                      day.isToday 
                        ? 'bg-purple-600 text-white shadow-sm' 
                        : isWeekend
                          ? 'text-slate-500 dark:text-slate-400'
                          : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {day.dayNumber}
                  </span>
                  {day.items.length > 0 && (
                    <span className={`font-bold text-purple-600 dark:text-purple-400 ${
                      isFullscreen ? 'text-[11px]' : 'text-[10px]'
                    }`}>
                      {day.items.length} {day.items.length === 1 ? 'loja' : 'lojas'}
                    </span>
                  )}
                </div>

                {/* Lojas Agendadas para este Dia */}
                <div className="space-y-1.5 flex-1 overflow-y-auto custom-scrollbar">
                  {day.items.map(item => (
                    <div
                      key={item.id}
                      className={`font-medium leading-tight px-2 py-1.5 rounded-lg bg-purple-100/90 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-800/60 truncate shadow-xs ${
                        isFullscreen ? 'text-xs' : 'text-[11px]'
                      }`}
                      title={`Unidade: ${item.title} (Status: ${item.status})`}
                    >
                      <span className="font-semibold">{item.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
