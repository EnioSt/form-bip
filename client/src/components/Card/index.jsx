import { useState } from 'react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { OperatorTag } from '../OperatorTag';
import { CardSchedule } from '../CardSchedule';
import { CardActions } from '../CardActions';

const parseOperatorId = (value) => {
  if (!value) return null;
  return isNaN(value) ? value : Number(value);
};

const FormLinkBadge = ({ isOpen }) =>
  isOpen ? (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 shrink-0">
      Link Aberto
    </span>
  ) : (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-darkSurface-cardHover dark:text-slate-400 border border-slate-200 dark:border-darkSurface-border shrink-0">
      Fechado
    </span>
  );

const NotesCountBadge = ({ count }) => (
  <span
    className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-darkSurface-cardHover px-1.5 py-0.5 rounded border border-slate-200 dark:border-darkSurface-border flex items-center gap-1"
    title={`${count} observação(ões) interna(s)`}
  >
    <MessageSquare size={10} className="text-brand-500" />
    <span>{count}</span>
  </span>
);

const DataOkBadge = () => (
  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
    <CheckCircle2 size={11} /> Dados OK
  </span>
);

// Lê os campos do formulário atual, com fallback para nomes de versões anteriores
const getQuickData = (formData) => ({
  responsavel: formData.responsavel || formData.contato_nome || formData.manager_name || "—",
  telefone: formData.telefone || formData.contato_telefone || formData.manager_phone || "—",
  pdvs: formData.qtd_pdvs_tef || formData.sitef_quantidade_terminais || formData.pdv_count || 0,
  totems: formData.qtd_totems_tef || formData.totem_count || 0,
});

const QuickFormData = ({ formData }) => {
  const { responsavel, telefone, pdvs, totems } = getQuickData(formData);

  return (
    <section className="bg-slate-50 dark:bg-darkSurface-bg/70 rounded-lg p-2 mb-2.5 text-xs text-slate-600 dark:text-slate-300 space-y-0.5 border border-slate-100 dark:border-darkSurface-border">
      <p className="truncate"><span className="font-medium text-slate-500">Resp:</span> {responsavel}</p>
      <p className="truncate"><span className="font-medium text-slate-500">Tel:</span> {telefone}</p>
      <p className="truncate font-semibold text-brand-600 dark:text-brand-400">
        {pdvs} {Number(pdvs) === 1 ? "PDV" : "PDVs"} • {totems} {Number(totems) === 1 ? "Totem" : "Totens"}
      </p>
    </section>
  );
};

/**
 * Ticket da loja no Kanban: título, status do link, tag do operador,
 * data prevista, dados rápidos e ações.
 */
export const Card = ({
  card,
  user,
  users = [],
  operatorName,
  copiedToken,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onOpenCard,
  onCopyLink,
  onAssume,
  onAssignOperator,
  onStartImplantation,
  onMoveStatus,
  onReopen,
  onDeleteCard
}) => {
  const [isChangingOperator, setIsChangingOperator] = useState(false);

  const hasData = !!card.formData;
  const isAdmin = user?.role === 'admin';
  const isInactive = card.is_active === false;
  const notesCount = Array.isArray(card.notes) ? card.notes.length : 0;
  const activeUsers = users.filter(u => u.is_active !== false);

  const handleOperatorSelect = (e) => {
    e.stopPropagation();
    onAssignOperator?.(card.id, parseOperatorId(e.target.value));
    setIsChangingOperator(false);
  };

  return (
    <article
      draggable
      onDragStart={(e) => onDragStart?.(e, card)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenCard(card)}
      className={`rounded-xl p-3.5 shadow-sm border transition-all group cursor-grab active:cursor-grabbing relative select-none ${
        isInactive
          ? 'bg-slate-50/80 dark:bg-darkSurface-card/60 border-dashed border-slate-300 dark:border-darkSurface-border/80 opacity-70 hover:opacity-95 hover:border-slate-400'
          : 'bg-white dark:bg-darkSurface-card border-slate-200/90 dark:border-darkSurface-border hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500'
      } ${
        isDragging ? 'opacity-40 scale-[0.98] border-brand-500 shadow-lg' : ''
      }`}
    >
      {/* Título & Status do Formulário */}
      <header className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm leading-snug transition-colors ${
            isInactive
              ? 'line-through text-slate-400 dark:text-slate-500 decoration-rose-500 decoration-2'
              : 'text-slate-800 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400'
          }`}>
            {card.title}
          </h4>
          {isInactive && (
            <span className="inline-block mt-0.5 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.2 rounded border border-rose-200/60 dark:border-rose-900/40 uppercase tracking-wider">
              Loja Inativa
            </span>
          )}
        </div>
        <FormLinkBadge isOpen={card.is_form_open} />
      </header>

      {/* Tag do Operador e Indicadores de Dados / Notas */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <OperatorTag
          operatorName={operatorName}
          operatorId={card.operator_id}
          users={activeUsers}
          canEdit={isAdmin}
          isEditing={isChangingOperator}
          onStartEdit={() => setIsChangingOperator(true)}
          onCancelEdit={() => setIsChangingOperator(false)}
          onSelect={handleOperatorSelect}
        />

        <div className="flex items-center gap-1.5">
          {notesCount > 0 && <NotesCountBadge count={notesCount} />}
          {hasData && <DataOkBadge />}
        </div>
      </div>

      <CardSchedule
        scheduledDate={card.scheduled_date}
        status={card.status}
        onSchedule={() => onStartImplantation(card)}
      />

      {hasData && <QuickFormData formData={card.formData} />}

      <CardActions
        card={card}
        isAdmin={isAdmin}
        isCopied={copiedToken === card.unique_token}
        onCopyLink={() => onCopyLink(card.unique_token)}
        onDelete={onDeleteCard ? () => onDeleteCard(card.id, card.title) : undefined}
        onAssume={() => onAssume(card.id)}
        onAssignOther={() => setIsChangingOperator(true)}
        onStartImplantation={() => onStartImplantation(card)}
        onConclude={() => onMoveStatus(card.id, 'concluido')}
        onReopen={() => onReopen(card)}
      />
    </article>
  );
};
