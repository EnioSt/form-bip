import React from "react";
import {
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Monitor,
  Smartphone,
} from "lucide-react";

export default function MetricsSummaryCards({ metrics, isFullscreen = false }) {
  // Modo TV: exibe exclusivamente os 3 cards principais em tela cheia com dados acumulados
  if (isFullscreen) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        {/* 1. Quantidade de PDVs */}
        <div className="p-3.5 bg-white/80 dark:bg-darkSurface-card/80 backdrop-blur-xs rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
              Quantidade de PDVs
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <Monitor size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-heading mt-2 text-slate-900 dark:text-white">
            {metrics.totalPdvs}
          </div>
          <span className="text-xs text-slate-500 dark:text-darkSurface-muted mt-1 block">
            Total de PDVs (Terminais) desde o início
          </span>
        </div>

        {/* 2. Quantidade de TOTEMs */}
        <div className="p-3.5 bg-white/80 dark:bg-darkSurface-card/80 backdrop-blur-xs rounded-2xl border border-indigo-200 dark:border-indigo-900/50 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
              Quantidade de TOTEMs
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold shadow-xs">
              <Smartphone size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-heading mt-2 text-slate-900 dark:text-white">
            {metrics.totalTotems}
          </div>
          <span className="text-xs text-slate-500 dark:text-darkSurface-muted mt-1 block">
            Total de Totens (Terminais) desde o início
          </span>
        </div>

        {/* 3. Total Concluídos */}
        <div className="p-3.5 bg-white/80 dark:bg-darkSurface-card/80 backdrop-blur-xs rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400">
              Lojas com SiTEF
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shadow-xs">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="text-3xl font-black font-heading mt-2 text-emerald-600 dark:text-emerald-400 flex items-baseline gap-2">
            <span>{metrics.allTimeConcluidos}</span>
            <span className="text-sm font-semibold text-slate-400 dark:text-darkSurface-muted font-normal">
              / {metrics.allTimeLojasAtivas} ativas
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-darkSurface-muted mt-1 block">
            Lojas com SiTEF concluído vs total da rede
          </span>
        </div>
      </div>
    );
  }

  // Modo Normal (Dashboard completo): exibe todos os cards
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. Quantidade de PDVs (Acumulado Geral) */}
      <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-blue-200 dark:border-blue-900/50 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
            Qtd. PDVs
          </span>
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Monitor size={15} />
          </div>
        </div>
        <div className="text-2xl font-black font-heading mt-1.5 text-slate-900 dark:text-white flex items-baseline gap-1.5">
          <span>{metrics.allTimePdvs}</span>
          {metrics.totalPdvs !== metrics.allTimePdvs && (
            <span className="text-xs font-normal text-slate-400 dark:text-darkSurface-muted" title="No período selecionado">
              / {metrics.totalPdvs} no mês
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block truncate">
          Total desde o início
        </span>
      </div>

      {/* 2. Quantidade de TOTEMs (Acumulado Geral) */}
      <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-indigo-200 dark:border-indigo-900/50 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
            Qtd. TOTEMs
          </span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Smartphone size={15} />
          </div>
        </div>
        <div className="text-2xl font-black font-heading mt-1.5 text-slate-900 dark:text-white flex items-baseline gap-1.5">
          <span>{metrics.allTimeTotems}</span>
          {metrics.totalTotems !== metrics.allTimeTotems && (
            <span className="text-xs font-normal text-slate-400 dark:text-darkSurface-muted" title="No período selecionado">
              / {metrics.totalTotems} no mês
            </span>
          )}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block truncate">
          Total desde o início
        </span>
      </div>

      {/* 3. Total Concluídos (Acumulado Geral) */}
      <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-emerald-200 dark:border-emerald-900/50 shadow-sm relative overflow-hidden group">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-semibold text-emerald-500">
            Concluídos
          </span>
          <CheckCircle2 size={16} className="text-emerald-500" />
        </div>
        <div className="text-2xl font-black font-heading mt-1.5 text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1.5">
          <span>{metrics.allTimeConcluidos}</span>
          {metrics.concluido !== metrics.allTimeConcluidos && (
            <span className="text-xs font-normal text-slate-400 dark:text-darkSurface-muted" title="No período selecionado">
              / {metrics.concluido} no mês
            </span>
          )}
        </div>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5 block">
          Total desde o início
        </span>
      </div>

      {/* 4. Em Triagem (Período) */}
      <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-semibold text-amber-500">
            Triagem
          </span>
          <Clock size={16} className="text-amber-500" />
        </div>
        <div className="text-2xl font-black font-heading mt-1.5 text-amber-600 dark:text-amber-400">
          {metrics.triagem}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block">
          Aguardando cliente
        </span>
      </div>

      {/* 5. Preenchidos (Período) */}
      <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-semibold text-blue-500">
            Preenchidos
          </span>
          <Layers size={16} className="text-blue-500" />
        </div>
        <div className="text-2xl font-black font-heading mt-1.5 text-blue-600 dark:text-blue-400">
          {metrics.preenchido}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block">
          Prontos p/ assumir
        </span>
      </div>

      {/* 6. Em Implantação (Período) */}
      <div className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[11px] uppercase font-semibold text-purple-500">
            Implantação
          </span>
          <ArrowRight size={16} className="text-purple-500" />
        </div>
        <div className="text-2xl font-black font-heading mt-1.5 text-purple-600 dark:text-purple-400">
          {metrics.implantacao}
        </div>
        <span className="text-[10px] text-slate-400 dark:text-darkSurface-muted mt-0.5 block">
          Em andamento técnico
        </span>
      </div>
    </div>
  );
}
