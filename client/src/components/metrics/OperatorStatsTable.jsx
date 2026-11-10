import React from 'react';
import { UserCheck } from 'lucide-react';

export default function OperatorStatsTable({ operatorStats }) {
  return (
    <div className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 border border-slate-200 dark:border-darkSurface-border shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-darkSurface-border">
        <div className="flex items-center space-x-2">
          <UserCheck className="text-brand-500" size={20} />
          <h2 className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Produtividade e Carga por Operador
          </h2>
        </div>
        <span className="text-xs text-slate-400">Dados baseados no período filtrado</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-darkSurface-bg/50 border-b border-slate-200 dark:border-darkSurface-border text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Operador</th>
              <th className="px-4 py-3 text-center">Cards Vinculados</th>
              <th className="px-4 py-3 text-center">Em Implantação</th>
              <th className="px-4 py-3 text-center">Já Concluídos</th>
              <th className="px-4 py-3 text-center">Taxa de Conclusão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-darkSurface-border">
            {operatorStats.map((op) => (
              <tr key={op.id} className="hover:bg-slate-50 dark:hover:bg-darkSurface-cardHover/50 transition">
                <td className="px-4 py-3.5 font-medium text-slate-800 dark:text-white flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
                    {op.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{op.name}</div>
                    <div className="text-[11px] text-slate-400">{op.email}</div>
                  </div>
                </td>

                <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-200">
                  {op.totalVinculados}
                </td>

                <td className="px-4 py-3.5 text-center font-bold text-purple-600 dark:text-purple-400">
                  {op.emImplantacao}
                </td>

                <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
                  {op.concluidos}
                </td>

                <td className="px-4 py-3.5 text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-16 bg-slate-200 dark:bg-darkSurface-bg rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full" 
                        style={{ width: `${op.taxaConclusao}%` }} 
                      />
                    </div>
                    <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{op.taxaConclusao}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
