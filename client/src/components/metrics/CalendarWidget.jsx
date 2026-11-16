import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock } from 'lucide-react';

export default function CalendarWidget({
  calendarGrid,
  calendarMonthLabel,
  isFullscreen = false,
  onPrevMonth,
  onNextMonth
}) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-darkSurface-border shadow-sm flex flex-col ${
      isFullscreen 
        ? 'h-full p-4 sm:p-5 justify-between bg-white/85 dark:bg-darkSurface-card/90 backdrop-blur-sm' 
        : 'p-6 space-y-4 bg-white dark:bg-darkSurface-card'
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

        {/* Legenda de Cores dos Status e Navegação */}
        <div className="flex flex-wrap items-center gap-3 self-start sm:self-auto">
          {/* Legenda Explicativa */}
          <div className="flex items-center gap-2 bg-slate-100/80 dark:bg-darkSurface-bg px-2.5 py-1 rounded-lg border border-slate-200 dark:border-darkSurface-border text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
              <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300">Em Implantação</span>
            </div>
            <span className="text-slate-300 dark:text-slate-600">|</span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-xs" />
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Concluída</span>
            </div>
          </div>

          {/* Navegação entre Meses */}
          <div className="flex items-center space-x-2">
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
      </div>

      {/* Grade do Calendário */}
      <div className={`border border-slate-200 dark:border-darkSurface-border rounded-xl flex flex-col ${
        isFullscreen ? 'flex-1 min-h-0' : 'overflow-hidden'
      }`}>
        {/* Cabeçalho dos Dias da Semana */}
        <div className={`grid grid-cols-7 border-b border-slate-200 dark:border-darkSurface-border text-center text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase py-1.5 shrink-0 ${
          isFullscreen 
            ? 'bg-slate-50/90 dark:bg-darkSurface-bg/90' 
            : 'bg-slate-50 dark:bg-darkSurface-bg/70'
        }`}>
          <div className={`text-slate-400 dark:text-slate-500 ${isFullscreen ? 'bg-slate-100/70 dark:bg-darkSurface-card/70' : 'bg-slate-100/60 dark:bg-darkSurface-card/60'}`}>Dom</div>
          <div>Seg</div>
          <div>Ter</div>
          <div>Qua</div>
          <div>Qui</div>
          <div>Sex</div>
          <div className={`text-slate-400 dark:text-slate-500 ${isFullscreen ? 'bg-slate-100/70 dark:bg-darkSurface-card/70' : 'bg-slate-100/60 dark:bg-darkSurface-card/60'}`}>Sáb</div>
        </div>

        {/* Células dos Dias */}
        <div className={`grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-darkSurface-border/60 ${
          isFullscreen 
            ? 'flex-1 min-h-0 bg-white/80 dark:bg-darkSurface-card/85' 
            : 'bg-white dark:bg-darkSurface-card'
        }`}
        style={isFullscreen ? { gridAutoRows: 'minmax(min-content, 1fr)' } : {}}
        >
          {calendarGrid.map((day, idx) => {
            const dayOfWeek = idx % 7; // 0 = Dom, 6 = Sáb
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

            if (!day.isCurrentMonth) {
              return (
                <div key={idx} className={`p-1.5 flex flex-col ${
                  isWeekend 
                    ? isFullscreen ? 'bg-slate-100/75 dark:bg-darkSurface-bg/70' : 'bg-slate-100/70 dark:bg-darkSurface-bg/60' 
                    : isFullscreen ? 'bg-slate-50/70 dark:bg-darkSurface-bg/60' : 'bg-slate-50/50 dark:bg-darkSurface-bg/30'
                } text-slate-300 dark:text-slate-600 ${
                  isFullscreen ? 'min-h-[50px] h-full' : 'min-h-[90px]'
                }`} />
              );
            }

            return (
              <div 
                key={idx} 
                className={`p-1.5 sm:p-2 flex flex-col transition hover:bg-slate-100/70 dark:hover:bg-darkSurface-bg/60 ${
                  isFullscreen ? 'min-h-[60px] h-full' : 'min-h-[90px]'
                } ${
                  day.isToday 
                    ? 'bg-purple-50/80 dark:bg-purple-950/40' 
                    : isWeekend 
                      ? isFullscreen ? 'bg-slate-50/85 dark:bg-darkSurface-bg/65' : 'bg-slate-50/70 dark:bg-darkSurface-bg/40' 
                      : isFullscreen
                        ? 'bg-white/80 dark:bg-darkSurface-card/80'
                        : 'bg-white dark:bg-darkSurface-card'
                }`}
              >
                <div className="flex items-center justify-between mb-1 shrink-0">
                  <span 
                    className={`font-bold rounded-full flex items-center justify-center ${
                      isFullscreen ? 'text-[11px] sm:text-xs w-5 h-5 sm:w-6 sm:h-6' : 'text-xs w-5 h-5'
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
                    <span className={`font-bold text-slate-600 dark:text-slate-300 ${
                      isFullscreen ? 'text-[10px] sm:text-[11px]' : 'text-[10px]'
                    }`}>
                      {day.items.length} {day.items.length === 1 ? 'loja' : 'lojas'}
                    </span>
                  )}
                </div>

                {/* Lojas Agendadas para este Dia - Exibe TODAS as lojas adaptando a altura naturalmente */}
                <div className={`flex-1 flex flex-col gap-1 ${
                  isFullscreen ? 'justify-start' : 'overflow-y-auto custom-scrollbar'
                }`}>
                  {day.items.map(item => {
                    const isConcluido = item.status === 'concluido';
                    const isItemInactive = item.is_active === false;

                    return (
                      <div
                        key={item.id}
                        className={`font-medium leading-tight rounded border truncate shadow-xs flex items-center shrink-0 ${
                          isFullscreen 
                            ? 'px-1.5 py-1 text-[11px] gap-1.5' 
                            : 'px-1.5 py-1 text-[11px] gap-1.5 rounded-md'
                        } ${
                          isItemInactive
                            ? 'bg-slate-100/80 dark:bg-darkSurface-bg/70 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-darkSurface-border/80 opacity-60'
                            : isConcluido
                              ? 'bg-emerald-100/90 dark:bg-emerald-950/75 text-emerald-950 dark:text-emerald-100 border-emerald-300 dark:border-emerald-800'
                              : 'bg-purple-100/90 dark:bg-purple-950/75 text-purple-950 dark:text-purple-100 border-purple-200 dark:border-purple-800/60'
                        }`}
                        title={`Unidade: ${item.title} (Status: ${isItemInactive ? 'Inativa no Sistema' : isConcluido ? 'Concluída' : 'Em Implantação / Prevista'})`}
                      >
                        {isItemInactive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        ) : isConcluido ? (
                          <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        ) : (
                          <Clock size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />
                        )}
                        <span className={`font-semibold truncate ${isItemInactive ? 'line-through decoration-rose-500 decoration-1' : ''}`}>
                          {item.title}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
