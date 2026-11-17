import { Calendar, ArrowRight } from 'lucide-react';
import { Modal } from '../Modal';

const getToday = () => new Date().toISOString().split('T')[0];

export const ScheduleModal = ({
  isOpen,
  card,
  date,
  moveToImplantation = false,
  onChangeDate,
  onClose,
  onSubmit
}) => {
  if (!isOpen || !card) return null;

  const today = getToday();
  const isReopening = moveToImplantation && card.status === 'concluido';
  const isReschedule = !moveToImplantation && (card.status === 'implantacao' || card.status === 'concluido');

  const submitLabel = isReopening
    ? 'Reabrir Implantação'
    : isReschedule ? 'Salvar Nova Data' : 'Avançar para Implantação';

  return (
    <Modal
      labelledBy="schedule-modal-title"
      overlayClassName="overflow-y-auto"
      className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in zoom-in-95 duration-200"
    >
      <header className="flex items-center space-x-3 mb-3">
        <figure className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
          <Calendar size={20} />
        </figure>
        <hgroup>
          <h3 id="schedule-modal-title" className="text-base font-bold font-heading text-slate-900 dark:text-white">
            Data Prevista de Implantação
          </h3>
          <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
            {card.title}
          </p>
        </hgroup>
      </header>

      <p className="text-xs text-slate-600 dark:text-darkSurface-muted mb-4 leading-relaxed">
        {isReopening
          ? <>O card voltará para <strong>Em Implantação</strong> mantendo todos os dados do formulário. Defina a nova data prevista da implantação.</>
          : <>Defina a data prevista em que a equipe técnica realizará a implantação do SiTEF. Essa data alimentará o <strong>calendário do dashboard</strong>.</>}
      </p>

      <form onSubmit={onSubmit} className="space-y-4">
        <fieldset>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="schedule-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Dia Previsto *
            </label>
            <button
              type="button"
              onClick={() => onChangeDate(getToday())}
              className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline font-medium"
            >
              Hoje
            </button>
          </div>
          <input
            id="schedule-date"
            type="date"
            required
            min={today}
            value={date}
            onChange={(e) => onChangeDate(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-xl text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
          {date && date < today && (
            <span role="alert" className="text-[11px] text-rose-500 mt-1 block">
              A data de implantação não pode ser anterior a hoje.
            </span>
          )}
        </fieldset>

        <footer className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-darkSurface-border/60">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded-xl transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white rounded-xl shadow-md shadow-purple-600/20 transition flex items-center space-x-1.5"
          >
            <ArrowRight size={14} />
            <span>{submitLabel}</span>
          </button>
        </footer>
      </form>
    </Modal>
  );
};
