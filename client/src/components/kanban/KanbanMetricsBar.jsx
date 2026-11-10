import React from 'react';
import { 
  Clock, 
  Layers, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';

export default function KanbanMetricsBar({ columns, cards }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 shrink-0">
      {columns.map(col => {
        const count = cards.filter(c => c.status === col.id).length;
        return (
          <div 
            key={col.id} 
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm flex items-center justify-between"
          >
            <div>
              <div className="text-[11px] uppercase font-semibold text-slate-400">{col.title}</div>
              <div className="text-xl font-black font-heading mt-0.5 text-slate-800 dark:text-white">{count}</div>
            </div>
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-base"
              style={{ backgroundColor: col.theme.bg, color: col.theme.text }}
            >
              {col.id === 'triagem' && <Clock size={16} />}
              {col.id === 'preenchido' && <Layers size={16} />}
              {col.id === 'implantacao' && <ArrowRight size={16} />}
              {col.id === 'concluido' && <CheckCircle2 size={16} />}
            </div>
          </div>
        );
      })}
    </div>
  );
}
