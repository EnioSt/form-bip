import { useState, useMemo } from 'react';
import { AlertTriangle, Store, ArrowRight, X } from 'lucide-react';
import { Modal } from '../Modal';

// Normaliza strings (sem acentos, minúsculas, pontuações limpas)
const normalizeText = (text = '') =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Busca lojas semelhantes já cadastradas
const findSimilarCards = (title, cards) => {
  const cleanInput = normalizeText(title);
  if (!cleanInput || cleanInput.length < 3) return [];

  const inputTokens = cleanInput.split(' ').filter(t => t.length >= 2);

  return cards.filter(card => {
    const cleanCardTitle = normalizeText(card.title || '');
    if (!cleanCardTitle) return false;

    // 1. Igualdade direta ou substring mútua
    if (cleanCardTitle.includes(cleanInput) || cleanInput.includes(cleanCardTitle)) {
      return true;
    }

    // 2. Coincidência de múltiplos tokens significativos
    const cardTokens = cleanCardTitle.split(' ').filter(t => t.length >= 2);
    const matchingTokens = inputTokens.filter(tok => cardTokens.includes(tok));

    return matchingTokens.length >= 2 || (inputTokens.length === 1 && matchingTokens.length === 1);
  });
};

const SimilarCardsWarning = ({ title, similarCards, onClose, onConfirm }) => (
  <div className="space-y-4">
    <aside role="alert" className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-start gap-3">
      <span className="p-1.5 bg-amber-100 dark:bg-amber-900/60 rounded-lg text-amber-700 dark:text-amber-300 shrink-0 mt-0.5">
        <AlertTriangle size={18} />
      </span>
      <div className="text-xs text-amber-900 dark:text-amber-200 flex-1">
        <p className="font-bold text-sm text-amber-950 dark:text-amber-100 mb-0.5">
          Atenção: Loja com nome parecido encontrada!
        </p>
        <p>
          Já existem <strong>{similarCards.length}</strong> card(s) cadastrado(s) com denominação semelhante a "<strong>{title}</strong>". Verifique abaixo se a loja já não foi criada antes de prosseguir:
        </p>
      </div>
    </aside>

    <ul className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
      {similarCards.map(c => (
        <li
          key={c.id}
          className="p-2.5 rounded-lg border border-slate-200 dark:border-darkSurface-border bg-slate-50/70 dark:bg-darkSurface-bg/70 flex items-center justify-between text-xs"
        >
          <span className="flex items-center space-x-2 truncate">
            <Store size={14} className="text-slate-500 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-white truncate">
              {c.title}
            </span>
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-200 dark:bg-darkSurface-cardHover text-slate-700 dark:text-slate-300 capitalize shrink-0 ml-2">
            {c.status}
          </span>
        </li>
      ))}
    </ul>

    <footer className="pt-2 border-t border-slate-100 dark:border-darkSurface-border flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded-lg transition"
      >
        Cancelar
      </button>
      <button
        type="button"
        onClick={onConfirm}
        className="px-4 py-2 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
      >
        <span>Continuar para Criação</span>
        <ArrowRight size={13} />
      </button>
    </footer>
  </div>
);

/**
 * Conteúdo da modal. Só é montado enquanto a modal está aberta,
 * então o estado do aviso de duplicidade é zerado automaticamente ao fechar.
 */
const CreateCardModalContent = ({
  title,
  cards,
  onChangeTitle,
  onClose,
  onSubmit
}) => {
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const similarCards = useMemo(() => findSimilarCards(title, cards), [title, cards]);

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Se houver cards com nome parecido e ainda não confirmou na tela de aviso
    if (similarCards.length > 0 && !showDuplicateWarning) {
      setShowDuplicateWarning(true);
      return;
    }

    setShowDuplicateWarning(false);
    onSubmit(e);
  };

  const handleConfirmCreationAnyway = (e) => {
    setShowDuplicateWarning(false);
    onSubmit(e);
  };

  return (
    <Modal
      labelledBy="create-card-modal-title"
      overlayClassName="overflow-y-auto"
      className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in zoom-in-95 duration-200"
    >
      <header className="flex items-start justify-between mb-3">
        <hgroup>
          <h3 id="create-card-modal-title" className="text-lg font-bold font-heading text-slate-900 dark:text-white">
            Criar Novo Card de Onboarding
          </h3>
          <p className="text-xs text-slate-500 dark:text-darkSurface-muted mt-0.5">
            Informe a identificação da loja (ex: "São José do Rio Preto 05").
          </p>
        </hgroup>
        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition"
        >
          <X size={18} />
        </button>
      </header>

      {showDuplicateWarning && similarCards.length > 0 ? (
        <SimilarCardsWarning
          title={title}
          similarCards={similarCards}
          onClose={onClose}
          onConfirm={handleConfirmCreationAnyway}
        />
      ) : (
        <form onSubmit={handleSubmitAttempt}>
          <fieldset className="mb-4">
            <label htmlFor="create-card-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nome / Unidade da Loja
            </label>
            <input
              id="create-card-title"
              type="text"
              value={title}
              onChange={(e) => {
                onChangeTitle(e.target.value);
                setShowDuplicateWarning(false);
              }}
              placeholder="Ex: Ribeirão Preto Sul 02"
              required
              autoFocus
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm"
            />
          </fieldset>

          {/* Pré-aviso discreto enquanto digita se houver parecidos */}
          {similarCards.length > 0 && (
            <p className="mb-4 p-2.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 rounded-lg text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                {similarCards.length} loja(s) encontrada(s) com nome parecido no sistema.
              </span>
            </p>
          )}

          <footer className="flex justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-darkSurface-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <span>Criar Card</span>
            </button>
          </footer>
        </form>
      )}
    </Modal>
  );
};

export const CreateCardModal = ({ isOpen, cards = [], ...props }) => {
  if (!isOpen) return null;
  return <CreateCardModalContent cards={cards} {...props} />;
};
