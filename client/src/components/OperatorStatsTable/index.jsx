import { UserCheck } from "lucide-react";
import { OperatorStatsRow } from "../OperatorStatsRow";

/**
 * Tabela de produtividade e carga por operador no período filtrado.
 */
export const OperatorStatsTable = ({ operatorStats }) => {
  return (
    <section aria-labelledby="operator-stats-title" className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 border border-slate-200 dark:border-darkSurface-border shadow-sm">
      <header className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-darkSurface-border">
        <div className="flex items-center space-x-2">
          <UserCheck className="text-brand-500" size={20} />
          <h2 id="operator-stats-title" className="text-base font-bold text-slate-900 dark:text-white font-heading">
            Produtividade e Carga por Operador
          </h2>
        </div>
        <small className="text-xs text-slate-400">Dados baseados no período filtrado</small>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-darkSurface-bg/50 border-b border-slate-200 dark:border-darkSurface-border text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-4 py-3">Operador</th>
              <th scope="col" className="px-4 py-3 text-center">Cards Vinculados</th>
              <th scope="col" className="px-4 py-3 text-center">Em Implantação</th>
              <th scope="col" className="px-4 py-3 text-center">Já Concluídos</th>
              <th scope="col" className="px-4 py-3 text-center">Taxa de Conclusão</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-darkSurface-border">
            {operatorStats.map((op) => (
              <OperatorStatsRow key={op.id} operator={op} />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
