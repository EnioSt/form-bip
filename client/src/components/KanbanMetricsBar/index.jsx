import { Clock, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

const COLUMN_ICONS = {
  triagem: Clock,
  preenchido: Layers,
  implantacao: ArrowRight,
  concluido: CheckCircle2
};

const MetricTile = ({ column, count }) => {
  const Icon = COLUMN_ICONS[column.id];

  return (
    <li className="px-4 py-2.5 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm flex items-center justify-between">
      <dl>
        <dt className="text-[11px] uppercase font-semibold text-slate-400">{column.title}</dt>
        <dd className="text-xl font-black font-heading mt-0.5 text-slate-800 dark:text-white">{count}</dd>
      </dl>
      <span
        aria-hidden="true"
        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base"
        style={{ backgroundColor: column.theme.bg, color: column.theme.text }}
      >
        {Icon && <Icon size={16} />}
      </span>
    </li>
  );
};

export const KanbanMetricsBar = ({ columns, cards }) => {
  return (
    <ul className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
      {columns.map(col => (
        <MetricTile
          key={col.id}
          column={col}
          count={cards.filter(c => c.status === col.id).length}
        />
      ))}
    </ul>
  );
};
