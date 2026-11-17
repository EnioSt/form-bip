import { CheckCircle2, Clock } from "lucide-react";

const getStatusLabel = (isInactive, isConcluido) => {
  if (isInactive) return "Inativa no Sistema";
  if (isConcluido) return "Concluída";
  return "Em Implantação / Prevista";
};

const getToneClass = (isInactive, isConcluido) => {
  if (isInactive)
    return "bg-slate-100/80 dark:bg-darkSurface-bg/70 text-slate-400 dark:text-slate-500 border-slate-300 dark:border-darkSurface-border/80 opacity-60";
  if (isConcluido)
    return "bg-emerald-100/90 dark:bg-emerald-950/75 text-emerald-950 dark:text-emerald-100 border-emerald-300 dark:border-emerald-800";
  return "bg-purple-100/90 dark:bg-purple-950/75 text-purple-950 dark:text-purple-100 border-purple-200 dark:border-purple-800/60";
};

const StatusIcon = ({ isInactive, isConcluido }) => {
  if (isInactive) return <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />;
  if (isConcluido) return <CheckCircle2 size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0" />;
  return <Clock size={12} className="text-purple-600 dark:text-purple-400 shrink-0" />;
};

/**
 * Loja agendada dentro de uma célula do calendário.
 */
export const CalendarEvent = ({ item, isFullscreen }) => {
  const isConcluido = item.status === "concluido";
  const isInactive = item.is_active === false;

  return (
    <li
      className={`font-medium leading-tight rounded border truncate shadow-xs flex items-center shrink-0 ${
        isFullscreen ? "px-1.5 py-1 text-[11px] gap-1.5" : "px-1.5 py-1 text-[11px] gap-1.5 rounded-md"
      } ${getToneClass(isInactive, isConcluido)}`}
      title={`Unidade: ${item.title} (Status: ${getStatusLabel(isInactive, isConcluido)})`}
    >
      <StatusIcon isInactive={isInactive} isConcluido={isConcluido} />
      <span className={`font-semibold truncate ${isInactive ? "line-through decoration-rose-500 decoration-1" : ""}`}>
        {item.title}
      </span>
    </li>
  );
};
