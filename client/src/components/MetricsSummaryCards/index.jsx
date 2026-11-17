import { Clock, Layers, ArrowRight, CheckCircle2, Monitor, Smartphone } from "lucide-react";
import { TvMetricCard } from "../TvMetricCard";
import { MetricCard } from "../MetricCard";

const CUMULATIVE_VALUE = "text-slate-900 dark:text-white flex items-baseline gap-1.5";
const CUMULATIVE_LABEL_BOLD = "font-bold tracking-wider";

// Modo TV: exibe exclusivamente os 3 cards principais com dados acumulados
const TvSummary = ({ metrics }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
    <TvMetricCard tone="blue" label="Quantidade de PDVs" icon={Monitor} description="Total de PDVs (Terminais) desde o início">
      {metrics.totalPdvs}
    </TvMetricCard>

    <TvMetricCard tone="indigo" label="Quantidade de TOTEMs" icon={Smartphone} description="Total de Totens (Terminais) desde o início">
      {metrics.totalTotems}
    </TvMetricCard>

    <TvMetricCard
      tone="emerald"
      label="Lojas com SiTEF"
      icon={CheckCircle2}
      description="Lojas com SiTEF concluído vs total da rede"
      valueClassName="text-emerald-600 dark:text-emerald-400 flex items-baseline gap-2"
    >
      <span>{metrics.allTimeConcluidos}</span>
      <span className="text-sm font-semibold text-slate-400 dark:text-darkSurface-muted font-normal">
        / {metrics.allTimeLojasAtivas} ativas
      </span>
    </TvMetricCard>
  </div>
);

// Modo Normal (Dashboard completo): exibe todos os cards
const FullSummary = ({ metrics }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
    <MetricCard
      label="Qtd. PDVs"
      className="border-blue-200 dark:border-blue-900/50 relative overflow-hidden group"
      labelClassName={`${CUMULATIVE_LABEL_BOLD} text-blue-600 dark:text-blue-400`}
      icon={
        <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Monitor size={15} />
        </span>
      }
      value={metrics.allTimePdvs}
      comparison={metrics.totalPdvs}
      valueClassName={CUMULATIVE_VALUE}
      description="Total desde o início"
      descriptionClassName="text-slate-400 dark:text-darkSurface-muted truncate"
    />

    <MetricCard
      label="Qtd. TOTEMs"
      className="border-indigo-200 dark:border-indigo-900/50 relative overflow-hidden group"
      labelClassName={`${CUMULATIVE_LABEL_BOLD} text-indigo-600 dark:text-indigo-400`}
      icon={
        <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Smartphone size={15} />
        </span>
      }
      value={metrics.allTimeTotems}
      comparison={metrics.totalTotems}
      valueClassName={CUMULATIVE_VALUE}
      description="Total desde o início"
      descriptionClassName="text-slate-400 dark:text-darkSurface-muted truncate"
    />

    <MetricCard
      label="Concluídos"
      className="border-emerald-200 dark:border-emerald-900/50 relative overflow-hidden group"
      labelClassName="font-semibold text-emerald-500"
      icon={<CheckCircle2 size={16} className="text-emerald-500" />}
      value={metrics.allTimeConcluidos}
      comparison={metrics.concluido}
      valueClassName="text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5"
      description="Total desde o início"
      descriptionClassName="text-emerald-600 dark:text-emerald-400 font-semibold"
    />

    <MetricCard
      label="Triagem"
      labelClassName="font-semibold text-amber-500"
      icon={<Clock size={16} className="text-amber-500" />}
      value={metrics.triagem}
      valueClassName="text-amber-600 dark:text-amber-400"
      description="Aguardando cliente"
    />

    <MetricCard
      label="Preenchidos"
      labelClassName="font-semibold text-blue-500"
      icon={<Layers size={16} className="text-blue-500" />}
      value={metrics.preenchido}
      valueClassName="text-blue-600 dark:text-blue-400"
      description="Prontos p/ assumir"
    />

    <MetricCard
      label="Implantação"
      labelClassName="font-semibold text-purple-500"
      icon={<ArrowRight size={16} className="text-purple-500" />}
      value={metrics.implantacao}
      valueClassName="text-purple-600 dark:text-purple-400"
      description="Em andamento técnico"
    />
  </div>
);

export const MetricsSummaryCards = ({ metrics, isFullscreen = false }) => {
  return isFullscreen ? <TvSummary metrics={metrics} /> : <FullSummary metrics={metrics} />;
};
