import { BarChart3, CalendarDays } from "lucide-react";
import logoBip360 from "../../assets/images/logo-bip360.png";
import logoChiquinho from "../../assets/images/logo-chiquinho.png";
import { PresentationToggle } from "../PresentationToggle";

const PresentationLogos = () => (
  <div className="flex items-center gap-3 pr-3 border-r border-slate-200 dark:border-darkSurface-border">
    <img
      src={logoChiquinho}
      alt="Chiquinho Sorvetes"
      className="h-9 md:h-10 w-auto object-contain drop-shadow-xs"
    />
    <img
      src={logoBip360}
      alt="BIP360 Sistemas"
      className="h-8 md:h-9 w-auto object-contain drop-shadow-xs brightness-105"
    />
  </div>
);

/**
 * Cabeçalho do painel de métricas: logos (no modo TV), título, mês de referência e botão de apresentação.
 */
export const MetricsHeader = ({ isFullscreen, referenceLabel, onToggleFullscreen }) => {
  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 relative z-10">
      <div className="flex items-center gap-4">
        {isFullscreen && <PresentationLogos />}

        <hgroup>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="text-brand-500" size={24} />
            Métricas de Implantação SiTEF & BIP360
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-darkSurface-muted">
            Painel consolidado de produtividade dos operadores, status e volumetria
          </p>
        </hgroup>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <p className="text-xs bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 px-3 py-1.5 rounded-lg border border-brand-200 dark:border-brand-900/60 font-semibold flex items-center gap-1.5">
          <CalendarDays size={14} />
          <span className="capitalize">Referência: {referenceLabel}</span>
        </p>

        <PresentationToggle isFullscreen={isFullscreen} onToggle={onToggleFullscreen} />
      </div>
    </header>
  );
};
