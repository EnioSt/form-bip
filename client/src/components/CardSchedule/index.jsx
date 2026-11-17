import { Calendar, CalendarClock, Edit2 } from 'lucide-react';

const formatDate = (isoDate) =>
  new Date(isoDate + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

/**
 * Faixa com a data prevista de implantação do ticket.
 * Mostra "Sem data agendada" quando o card está em implantação sem data definida.
 */
export const CardSchedule = ({ scheduledDate, status, onSchedule }) => {
  const handleClick = (e) => {
    e.stopPropagation();
    onSchedule();
  };

  if (scheduledDate) {
    return (
      <p className="mb-2.5 flex items-center justify-between text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-900/60">
        <span className="flex items-center space-x-1.5">
          <Calendar size={13} className="shrink-0 text-purple-600 dark:text-purple-400" />
          <span>
            Previsão: <time dateTime={scheduledDate}>{formatDate(scheduledDate)}</time>
          </span>
        </span>
        <button
          type="button"
          onClick={handleClick}
          className="p-1 hover:bg-purple-200 dark:hover:bg-purple-900/60 rounded text-purple-600 dark:text-purple-400 transition"
          title="Alterar Data Prevista"
        >
          <Edit2 size={11} />
        </button>
      </p>
    );
  }

  if (status !== 'implantacao') return null;

  return (
    <p className="mb-2.5 flex items-center justify-between text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
      <span className="flex items-center space-x-1.5">
        <CalendarClock size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Sem data agendada</span>
      </span>
      <button
        type="button"
        onClick={handleClick}
        className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline"
      >
        Agendar
      </button>
    </p>
  );
};
