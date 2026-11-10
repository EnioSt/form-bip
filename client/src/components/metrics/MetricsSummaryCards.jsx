import React from "react";
import {
  Building2,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Monitor,
  Smartphone,
} from "lucide-react";

export default function MetricsSummaryCards({ metrics, isFullscreen = false }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 ${
      isFullscreen ? 'gap-2.5' : 'gap-3 sm:gap-4'
    }`}>
      {/* Quantidade de PDVs */}
      <div className={`${isFullscreen ? 'p-2.5' : 'p-4'} rounded-xl bg-white dark:bg-darkSurface-card border border-blue-200 dark:border-blue-900/50 shadow-sm relative overflow-hidden group`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
            Qtd. PDVs
          </span>
          <div className={`${isFullscreen ? 'w-6 h-6' : 'w-7 h-7'} rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center`}>
            <Monitor size={isFullscreen ? 13 : 15} />
          </div>
        </div>
        <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-black font-heading mt-1 text-slate-900 dark:text-white flex items-baseline gap-1.5`}>
          <span>{metrics.totalPdvs}</span>
          {!isFullscreen && (
            <span className="text-xs font-normal text-slate-400 dark:text-darkSurface-muted" title="Total geral acumulado">
              / {metrics.allTimePdvs} total
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block truncate">
          {isFullscreen ? 'Total acumulado geral' : 'No período selecionado'}
        </span>
      </div>

      {/* Quantidade de TOTEMs */}
      <div className={`${isFullscreen ? 'p-2.5' : 'p-4'} rounded-xl bg-white dark:bg-darkSurface-card border border-indigo-200 dark:border-indigo-900/50 shadow-sm relative overflow-hidden group`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
            Qtd. TOTEMs
          </span>
          <div className={`${isFullscreen ? 'w-6 h-6' : 'w-7 h-7'} rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center`}>
            <Smartphone size={isFullscreen ? 13 : 15} />
          </div>
        </div>
        <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-black font-heading mt-1 text-slate-900 dark:text-white flex items-baseline gap-1.5`}>
          <span>{metrics.totalTotems}</span>
          {!isFullscreen && (
            <span className="text-xs font-normal text-slate-400 dark:text-darkSurface-muted" title="Total geral acumulado">
              / {metrics.allTimeTotems} total
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block truncate">
          {isFullscreen ? 'Total acumulado geral' : 'No período selecionado'}
        </span>
      </div>

      {/* Em Triagem */}
      <div className={`${isFullscreen ? 'p-2.5' : 'p-4'} rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-semibold text-amber-500">
            Triagem
          </span>
          <Clock size={isFullscreen ? 14 : 16} className="text-amber-500" />
        </div>
        <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-black font-heading mt-1 text-amber-600 dark:text-amber-400`}>
          {metrics.triagem}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block">
          Aguardando cliente
        </span>
      </div>

      {/* Preenchidos */}
      <div className={`${isFullscreen ? 'p-2.5' : 'p-4'} rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-semibold text-blue-500">
            Preenchidos
          </span>
          <Layers size={isFullscreen ? 14 : 16} className="text-blue-500" />
        </div>
        <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-black font-heading mt-1 text-blue-600 dark:text-blue-400`}>
          {metrics.preenchido}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block">
          Prontos p/ assumir
        </span>
      </div>

      {/* Em Implantação */}
      <div className={`${isFullscreen ? 'p-2.5' : 'p-4'} rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-semibold text-purple-500">
            Implantação
          </span>
          <ArrowRight size={isFullscreen ? 14 : 16} className="text-purple-500" />
        </div>
        <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-black font-heading mt-1 text-purple-600 dark:text-purple-400`}>
          {metrics.implantacao}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block">
          Em andamento técnico
        </span>
      </div>

      {/* Concluídos */}
      <div className={`${isFullscreen ? 'p-2.5' : 'p-4'} rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm`}>
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-semibold text-emerald-500">
            Concluídos
          </span>
          <CheckCircle2 size={isFullscreen ? 14 : 16} className="text-emerald-500" />
        </div>
        <div className={`${isFullscreen ? 'text-xl' : 'text-2xl'} font-black font-heading mt-1 text-emerald-600 dark:text-emerald-400`}>
          {metrics.concluido}
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
          {metrics.taxaConclusao}% de eficácia
        </span>
      </div>
    </div>
  );
}
