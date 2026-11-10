import React from 'react';
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
  CalendarClock 
} from 'lucide-react';

export default function KanbanCard({
  card,
  user,
  operatorName,
  copiedToken,
  isDragging = false,
  onDragStart,
  onDragEnd,
  onOpenCard,
  onCopyLink,
  onAssume,
  onStartImplantation,
  onMoveStatus,
  onReopen
}) {
  const hasData = !!card.formData;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, card)}
      onDragEnd={onDragEnd}
      onClick={() => onOpenCard(card)}
      className={`bg-white dark:bg-darkSurface-card rounded-xl p-3.5 shadow-sm border border-slate-200/90 dark:border-darkSurface-border hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition-all group cursor-grab active:cursor-grabbing relative select-none ${
        isDragging ? 'opacity-40 scale-[0.98] border-brand-500 shadow-lg' : ''
      }`}
    >
      {/* Título & Status Form */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-semibold text-slate-800 dark:text-white text-sm leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {card.title}
        </h4>
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
        {operatorName ? (
          <div className="inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60 font-medium">
            <UserCheck size={12} />
            <span>{operatorName}</span>
          </div>
        ) : (
          <span className="text-xs text-slate-400 italic">Sem operador atribuído</span>
        )}

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

      {/* Data Prevista de Implantação no Card (com botão de edição rápida) */}
      {card.scheduled_date ? (
        <div className="mb-2.5 flex items-center justify-between text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1.5 rounded-lg border border-purple-200 dark:border-purple-900/60">
          <div className="flex items-center space-x-1.5">
            <Calendar size={13} className="shrink-0 text-purple-600 dark:text-purple-400" />
            <span>
              Previsto: {new Date(card.scheduled_date + 'T12:00:00').toLocaleDateString('pt-BR')}
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartImplantation(card);
            }}
            className="p-1 text-purple-500 hover:text-purple-800 dark:hover:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded transition"
            title="Alterar Data de Implantação"
          >
            <Edit2 size={12} />
          </button>
        </div>
      ) : card.status === 'implantacao' && (
        <div className="mb-2.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStartImplantation(card);
            }}
            className="w-full flex items-center justify-center space-x-1 text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-2 py-1 rounded-lg border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 transition"
          >
            <CalendarClock size={12} />
            <span>Definir Data de Implantação</span>
          </button>
        </div>
      )}

      {/* Ações do Card */}
      <div 
        className="space-y-2 pt-2 border-t border-slate-100 dark:border-darkSurface-border/60"
        onClick={(e) => e.stopPropagation()} // Impede abrir modal ao clicar nas ações
      >
        {/* Copiar / Abrir Link do Franqueado */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={(e) => onCopyLink(card.unique_token, e)}
            className="flex-1 py-1 px-2 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center space-x-1 transition"
            title="Copiar Link do Formulário"
          >
            {copiedToken === card.unique_token ? (
              <>
                <Check size={12} className="text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copiado!</span>
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
        </div>

        {/* Botão Assumir (se não atribuído) */}
        {!card.operator_id && (
          <button
            onClick={() => onAssume(card.id)}
            className="w-full py-1 px-2 rounded text-xs bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-900/40 font-medium flex items-center justify-center space-x-1 transition"
          >
            <UserCheck size={13} />
            <span>Assumir Card</span>
          </button>
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

        {/* Reabertura de Formulário */}
        {(card.status !== 'triagem' || !card.is_form_open) && (
          <button
            onClick={() => onReopen(card.id)}
            className="w-full py-1 px-2 rounded text-[11px] text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 flex items-center justify-center space-x-1 transition"
            title="Reabre o formulário para edição do cliente mantendo dados"
          >
            <RotateCcw size={12} />
            <span>Reabrir Formulário</span>
          </button>
        )}
      </div>
    </div>
  );
}
