import { useFullscreen } from "../hooks/useFullscreen";
import { useDashboardMetrics } from "../hooks/useDashboardMetrics";
import { MetricsHeader } from "../components/MetricsHeader";
import { DashboardFilterBar } from "../components/DashboardFilterBar";
import { MetricsSummaryCards } from "../components/MetricsSummaryCards";
import { CalendarWidget } from "../components/CalendarWidget";
import { OperatorStatsTable } from "../components/OperatorStatsTable";
import { QualityIndicatorCard } from "../components/QualityIndicatorCard";

export const DashboardMetrics = () => {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { cards, users, filters, metrics, calendar, referenceLabel } = useDashboardMetrics({ isFullscreen });

  return (
    <div
      className={`space-y-4 relative ${isFullscreen ? "h-full flex flex-col justify-between overflow-hidden" : ""}`}
    >
      <MetricsHeader
        isFullscreen={isFullscreen}
        referenceLabel={referenceLabel}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Barra de Filtros - Ocultada no Modo TV / Tela Cheia */}
      {!isFullscreen && (
        <DashboardFilterBar
          users={users}
          cards={cards}
          selectedStore={filters.store}
          selectedOperator={filters.operator}
          startDate={filters.startDate}
          endDate={filters.endDate}
          isFiltering={filters.isFiltering}
          onChangeStore={filters.changeStore}
          onChangeOperator={filters.changeOperator}
          onChangeStartDate={filters.changeStartDate}
          onChangeEndDate={filters.changeEndDate}
          onReset={filters.reset}
        />
      )}

      <section
        aria-label="Resumo do período"
        className={`shrink-0 transition-opacity duration-200 relative z-10 ${filters.isFiltering ? "opacity-60" : "opacity-100"}`}
      >
        <MetricsSummaryCards metrics={metrics} isFullscreen={isFullscreen} />
      </section>

      <div className={isFullscreen ? "flex-1 min-h-0 relative z-10" : "relative z-10"}>
        <CalendarWidget
          calendarGrid={calendar.grid}
          calendarMonthLabel={calendar.monthLabel}
          isFullscreen={isFullscreen}
          onPrevMonth={calendar.goToPrevMonth}
          onNextMonth={calendar.goToNextMonth}
        />
      </div>

      {/* Demais tabelas e detalhes - Ocultados no Modo TV para visualização limpa nas TVs */}
      {!isFullscreen && (
        <>
          <OperatorStatsTable operatorStats={metrics.operatorStats} />

          <section aria-label="Indicadores de qualidade técnica" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QualityIndicatorCard
              label="Qualidade Cadastral"
              value={`${metrics.cardsComFoto} lojas com foto registrada`}
              description="Fotos da maquininha anexadas para abertura de chamado SiTEF"
              icon="📷"
              iconClassName="bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
            />
            <QualityIndicatorCard
              label="Adesão ao Pix TEF"
              value={`${metrics.cardsComPix} lojas operando com Pix`}
              description="Chave Pix e homologação bancária FISERV cadastradas"
              icon="⚡"
              iconClassName="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
            />
          </section>
        </>
      )}
    </div>
  );
};
