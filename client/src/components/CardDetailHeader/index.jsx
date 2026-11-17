import { X, Trash2 } from "lucide-react";
import { StoreActiveToggle } from "../StoreActiveToggle";

const formatDate = (isoDate) =>
  new Date(isoDate + "T12:00:00").toLocaleDateString("pt-BR");

const Separator = () => <span aria-hidden="true">•</span>;

const ScheduleInfo = ({ card, onSchedule }) => {
  if (card.scheduled_date) {
    return (
      <>
        <Separator />
        <span className="text-purple-600 dark:text-purple-400 font-semibold inline-flex items-center gap-1">
          Data Prevista:{" "}
          <strong>
            <time dateTime={card.scheduled_date}>{formatDate(card.scheduled_date)}</time>
          </strong>
          <button
            type="button"
            onClick={onSchedule}
            className="ml-1 text-purple-500 hover:text-purple-700 underline text-[11px]"
            title="Alterar data"
          >
            (alterar)
          </button>
        </span>
      </>
    );
  }

  if (card.status !== "implantacao") return null;

  return (
    <>
      <Separator />
      <button
        type="button"
        onClick={onSchedule}
        className="text-amber-600 hover:text-amber-800 underline font-semibold text-xs"
      >
        + Definir data prevista
      </button>
    </>
  );
};

/**
 * Cabeçalho do modal de detalhes: selo, status da loja, título, metadados e ações.
 */
export const CardDetailHeader = ({
  card,
  titleId,
  operatorName,
  onToggleActive,
  onStartImplantation,
  onDeleteCard,
  onClose,
}) => {
  const isActive = card.is_active !== false;

  return (
    <header className="p-6 border-b border-slate-100 dark:border-darkSurface-border flex items-center justify-between">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-900/40">
            DADOS DO FORMULÁRIO SITEF
          </span>
          {onToggleActive && (
            <StoreActiveToggle isActive={isActive} onToggle={() => onToggleActive(card.id)} />
          )}
        </div>

        <h3
          id={titleId}
          className={`text-xl font-black font-heading mt-1 ${
            !isActive
              ? "line-through text-slate-400 dark:text-slate-500 decoration-rose-500 decoration-2"
              : "text-slate-900 dark:text-white"
          }`}
        >
          {card.title}
        </h3>

        <p className="flex items-center gap-2 mt-1 text-xs text-slate-500">
          <span>
            Status:{" "}
            <strong className="uppercase text-brand-600 dark:text-brand-400">{card.status}</strong>
          </span>
          <Separator />
          <span>
            Formulário: <strong>{card.is_form_open ? "Aberto" : "Fechado"}</strong>
          </span>
          {card.operator_id && (
            <>
              <Separator />
              <span>
                Operador: <strong>{operatorName}</strong>
              </span>
            </>
          )}
          <ScheduleInfo card={card} onSchedule={() => onStartImplantation(card)} />
        </p>
      </div>

      <div className="flex items-center gap-1">
        {onDeleteCard && (
          <button
            type="button"
            onClick={() => onDeleteCard(card.id, card.title)}
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
            title="Excluir este card"
          >
            <Trash2 size={18} />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition"
        >
          <X size={20} />
        </button>
      </div>
    </header>
  );
};
