import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  UserCheck, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  MessageSquare, 
  Calendar, 
  Edit2, 
  CalendarClock,
  UserPlus,
  Users,
  Trash2
} from 'lucide-react';

export default function KanbanCard({
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
}) {
  const hasData = !!card.formData;
  const isAdmin = user?.role === 'admin';
  const isInactive = card.is_active === false;
  const [isChangingOperator, setIsChangingOperator] = useState(false);

  const handleOperatorSelect = (e) => {
    e.stopPropagation();
    const newOpId = e.target.value ? (isNaN(e.target.value) ? e.target.value : Number(e.target.value)) : null;
    if (onAssignOperator) {
      onAssignOperator(card.id, newOpId);
    }
    setIsChangingOperator(false);
  };

  const activeUsers = users.filter(u => u.is_active !== false);

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, card)}
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
      {/* Título & Status Form */}
      <div className="flex items-start justify-between gap-2 mb-2">
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
        {card.is_form_open ? (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 shrink-0">
            Link Aberto
          </span>
        ) : (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-darkSurface-cardHover dark:text-slate-400 border border-slate-200 dark:border-darkSurface-border shrink-0">
            Fechado
          </span>
        )}
      </div>

      {/* Tag do Operador e Indicador de Dados / Notas */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {operatorName ? (
            <div className="inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60 font-medium">
              <UserCheck size={12} />
              <span>{operatorName}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 italic">Sem operador</span>
          )}

          {/* Se for Admin, permite trocar o operador responsável a qualquer momento */}
          {isAdmin && (
            <div onClick={(e) => e.stopPropagation()} className="relative inline-block">
              {isChangingOperator ? (
                <select
                  value={card.operator_id || ''}
                  onChange={handleOperatorSelect}
                  onBlur={() => setIsChangingOperator(false)}
                  autoFocus
                  className="text-[11px] py-0.5 px-1.5 rounded bg-white dark:bg-darkSurface-card border border-brand-400 text-slate-800 dark:text-white focus:outline-none shadow-xs"
                >
                  <option value="">Nenhum</option>
                  {activeUsers.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role === 'admin' ? 'Admin' : 'Operador'})
                    </option>
                  ))}
                </select>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsChangingOperator(true)}
                  className="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded transition"
                  title="Trocar operador responsável (Admin)"
                >
                  <Edit2 size={11} />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {Array.isArray(card.notes) && card.notes.length > 0 && (
            <span 
              className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-darkSurface-cardHover px-1.5 py-0.5 rounded border border-slate-200 dark:border-darkSurface-border flex items-center gap-1"
              title={`${card.notes.length} observação(ões) interna(s)`}
            >
              <MessageSquare size={10} className="text-brand-500" />
              <span>{card.notes.length}</span>
            </span>
          )}

          {hasData && (
            <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
              <CheckCircle2 size={11} /> Dados OK
            </span>
          )}
        </div>
      </div>

      {/* Data Prevista de Implantação no Card */}
      {card.scheduled_date ? (
        <div className="mb-2.5 flex items-center justify-between text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-900/60">
          <div className="flex items-center space-x-1.5">
            <Calendar size={13} className="shrink-0 text-purple-600 dark:text-purple-400" />
            <span>
              Previsão: {new Date(card.scheduled_date + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartImplantation(card);
            }}
            className="p-1 hover:bg-purple-200 dark:hover:bg-purple-900/60 rounded text-purple-600 dark:text-purple-400 transition"
            title="Alterar Data Prevista"
          >
            <Edit2 size={11} />
          </button>
        </div>
      ) : card.status === 'implantacao' && (
        <div className="mb-2.5 flex items-center justify-between text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
          <div className="flex items-center space-x-1.5">
            <CalendarClock size={13} className="shrink-0 text-amber-600 dark:text-amber-400" />
            <span>Sem data agendada</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartImplantation(card);
            }}
            className="text-[10px] font-bold text-amber-700 dark:text-amber-300 hover:underline"
          >
            Agendar
          </button>
        </div>
      )}

      {/* Dados Rápidos Preenchidos */}
      {hasData && (
        <div className="bg-slate-50 dark:bg-darkSurface-bg/70 rounded-lg p-2 mb-2.5 text-xs text-slate-600 dark:text-slate-300 space-y-0.5 border border-slate-100 dark:border-darkSurface-border">
          <p className="truncate"><span className="font-medium text-slate-500">Resp:</span> {card.formData.manager_name}</p>
          <p className="truncate"><span className="font-medium text-slate-500">Tel:</span> {card.formData.manager_phone}</p>
          <p className="truncate font-semibold text-brand-600 dark:text-brand-400">
            {card.formData.pdv_count} PDVs • {card.formData.totem_count} Totens
          </p>
        </div>
      )}

      {/* Ações do Card */}
      <div className="space-y-1.5 pt-1 border-t border-slate-100 dark:border-darkSurface-border" onClick={e => e.stopPropagation()}>
        {/* Linha de Link & Visualização */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => onCopyLink(card.unique_token)}
            className="flex-1 py-1 px-2 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center space-x-1 transition"
          >
            {copiedToken === card.unique_token ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copiar Link</span>
              </>
            )}
          </button>

          <a
            href={`/form/${card.unique_token}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
            title="Abrir Formulário no Navegador"
          >
            <ExternalLink size={13} />
          </a>

          {/* Botão de Excluir Card */}
          {onDeleteCard && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteCard(card.id, card.title);
              }}
              className="p-1.5 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
              title="Excluir Card"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Atribuição de Operador:
            - Se for operador comum: só pode assumir se não tiver operador (!card.operator_id)
            - Se for admin e o card estiver sem operador: pode assumir para si ou destinar a um operador
        */}
        {!card.operator_id && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onAssume(card.id)}
              className="flex-1 py-1 px-2 rounded text-xs bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-900/40 font-medium flex items-center justify-center space-x-1 transition"
            >
              <UserCheck size={13} />
              <span>Assumir Card</span>
            </button>

            {isAdmin && (
              <button
                onClick={() => setIsChangingOperator(true)}
                className="py-1 px-2 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-darkSurface-border font-medium flex items-center justify-center space-x-1 transition"
                title="Atribuir a outro operador"
              >
                <Users size={12} />
                <span>Destinar</span>
              </button>
            )}
          </div>
        )}

        {/* Mover de Preenchido para Implantação com Agendamento */}
        {card.status === 'preenchido' && (
          <button
            onClick={() => onStartImplantation(card)}
            className="w-full py-1.5 px-2 rounded text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center space-x-1 shadow-sm transition"
          >
            <span>Agendar & Iniciar Implantação</span>
            <ArrowRight size={13} />
          </button>
        )}

        {/* Mover de Implantação para Concluído */}
        {card.status === 'implantacao' && (
          <button
            onClick={() => onMoveStatus(card.id, 'concluido')}
            className="w-full py-1.5 px-2 rounded text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center space-x-1 shadow-sm transition"
          >
            <CheckCircle2 size={13} />
            <span>Concluir Implantação</span>
          </button>
        )}

        {/* Reabrir Card Concluído */}
        {card.status === 'concluido' && (
          <button
            onClick={() => onReopen(card.id)}
            className="w-full py-1.5 px-2 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium flex items-center justify-center space-x-1 border border-slate-200 dark:border-darkSurface-border transition"
          >
            <RotateCcw size={12} />
            <span>Reabrir para Implantação</span>
          </button>
        )}
      </div>
    </div>
  );
}
