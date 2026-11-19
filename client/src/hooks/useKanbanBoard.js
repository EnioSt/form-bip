import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useAutoRefresh } from "./useAutoRefresh";

const getToday = () => new Date().toISOString().split("T")[0];

const CLOSED_SCHEDULE = { isOpen: false, card: null, date: "", moveToImplantation: false };

// Mantém a data prevista atual se ainda for válida; senão sugere hoje
const getSuggestedDate = (scheduledDate) => {
  const today = getToday();
  return scheduledDate && scheduledDate >= today ? scheduledDate : today;
};

/**
 * Dados e ações do quadro Kanban: cards, usuários, card aberto no modal,
 * observações, agendamento da implantação e criação de cards.
 * - user: usuário logado
 * - openConfirm / closeConfirm: vindos de useConfirmDialog
 */
export const useKanbanBoard = ({ user, openConfirm, closeConfirm }) => {
  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal detalhado do card
  const [selectedCard, setSelectedCard] = useState(null);
  const [loadingCardDetails, setLoadingCardDetails] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Modal de agendamento da data prevista
  const [scheduleModal, setScheduleModal] = useState(CLOSED_SCHEDULE);

  // Modal de criação de card
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  // ---------- Carregamento ----------

  const loadBoard = useCallback(async () => {
    try {
      const [cardsRes, usersRes] = await Promise.all([api.getCards(), api.getUsers()]);
      setCards(cardsRes);
      setUsers(usersRes);

      // Atualiza o card aberto no modal caso esteja ativo
      setSelectedCard((prev) => {
        if (!prev) return prev;
        return cardsRes.find((c) => c.id === prev.id) ?? prev;
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial: o carregador async é definido dentro do efeito (padrão recomendado)
  useEffect(() => {
    const loadInitialBoard = async () => {
      await loadBoard();
    };
    loadInitialBoard();
  }, [loadBoard]);

  // Sincroniza periodicamente (ex.: franqueado enviou o formulário → card vai para "Preenchido")
  useAutoRefresh(loadBoard);

  const getOperatorName = (operatorId) => users.find((u) => u.id === operatorId)?.name ?? null;

  const patchSelectedCard = (cardId, patch) => {
    setSelectedCard((prev) => (prev && prev.id === cardId ? { ...prev, ...patch } : prev));
  };

  // ---------- Ações de card ----------

  const assignOperator = async (cardId, operatorId) => {
    try {
      await api.assumeCard(cardId, operatorId);
      loadBoard();
    } catch (err) {
      alert(err.message);
    }
  };

  const assumeCard = (cardId) => assignOperator(cardId, user.id);

  const moveStatus = async (cardId, nextStatus, scheduledDate = null) => {
    try {
      await api.updateCardStatus(cardId, nextStatus, scheduledDate);
      loadBoard();
    } catch (err) {
      alert(err.message);
    }
  };

  /**
   * Abre o modal da data prevista.
   * - moveToImplantation: ao confirmar, move o card para "implantacao" (ex.: reabrir um concluído)
   */
  const openSchedule = (card, { moveToImplantation = false } = {}) => {
    setScheduleModal({
      isOpen: true,
      card,
      date: getSuggestedDate(card.scheduled_date),
      moveToImplantation,
    });
  };

  // Concluído → Implantação: mantém os dados do formulário e pede uma nova data
  const reopenImplantation = (card) => openSchedule(card, { moveToImplantation: true });

  const dropCard = async (card, targetColumnId) => {
    // Destino "implantacao" exige definir/confirmar a data prevista
    if (targetColumnId === "implantacao") {
      openSchedule(card, { moveToImplantation: card.status !== "implantacao" });
      return;
    }

    // Atualização otimista para feedback instantâneo
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, status: targetColumnId } : c)));
    await moveStatus(card.id, targetColumnId);
  };

  const reopenCard = (cardId) => {
    openConfirm({
      title: "Reabrir Formulário",
      message:
        "Deseja reabrir este formulário para nova edição pelo cliente? Todos os dados atuais preenchidos serão preservados e o card voltará para a etapa Triagem até o novo envio.",
      confirmText: "Sim, Reabrir",
      variant: "warning",
      onConfirm: async () => {
        try {
          await api.reopenCard(cardId);
          loadBoard();
        } catch (err) {
          alert(err.message);
        } finally {
          closeConfirm();
        }
      },
    });
  };

  const toggleActive = async (cardId) => {
    try {
      const updated = await api.toggleCardActive(cardId);
      const patch = {
        is_active: updated.is_active,
        inactive_reason: updated.inactive_reason ?? null,
        inactivated_at: updated.inactivated_at ?? null,
      };
      setCards((prev) => prev.map((c) => (c.id === cardId ? { ...c, ...patch } : c)));
      patchSelectedCard(cardId, patch);
    } catch (err) {
      alert(err.message || "Erro ao alterar status da loja");
    }
  };

  const deleteCard = (cardId, cardTitle) => {
    const titleToDisplay = cardTitle || "esta unidade";
    openConfirm({
      title: "Excluir Card do Sistema",
      message: `Tem certeza que deseja excluir o card de "${titleToDisplay}"? Todos os dados vinculados serão excluídos permanentemente. Deseja continuar?`,
      confirmText: "Sim, Excluir Card",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.deleteCard(cardId);
          setSelectedCard((prev) => (prev && prev.id === cardId ? null : prev));
          loadBoard();
        } catch (err) {
          alert(err.message || "Erro ao excluir o card");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  // ---------- Modal de detalhes & observações ----------

  const openCard = async (card) => {
    setSelectedCard(card);
    setLoadingCardDetails(true);
    try {
      const fullData = await api.getCardDetails(card.id);
      setSelectedCard(fullData);
    } catch (err) {
      console.error("Erro ao buscar detalhes completos do card:", err);
    } finally {
      setLoadingCardDetails(false);
    }
  };

  const closeCard = () => setSelectedCard(null);

  const addNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCard) return;

    if (newNoteText.trim().length > 150) {
      alert("A observação deve ter no máximo 150 caracteres.");
      return;
    }

    setSavingNote(true);
    try {
      const res = await api.addCardNote(selectedCard.id, newNoteText.trim());
      setNewNoteText("");
      patchSelectedCard(selectedCard.id, { notes: res.card.notes });
      loadBoard();
    } catch (err) {
      alert(err.message || "Erro ao adicionar observação");
    } finally {
      setSavingNote(false);
    }
  };

  const deleteNote = (noteId) => {
    openConfirm({
      title: "Excluir Observação",
      message: "Tem certeza que deseja remover esta observação? Esta ação não pode ser desfeita.",
      confirmText: "Sim, Excluir",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await api.deleteCardNote(selectedCard.id, noteId);
          patchSelectedCard(selectedCard.id, { notes: res.card.notes });
          loadBoard();
        } catch (err) {
          alert(err.message || "Erro ao excluir observação");
        } finally {
          closeConfirm();
        }
      },
    });
  };

  // ---------- Agendamento ----------

  const closeSchedule = () => setScheduleModal(CLOSED_SCHEDULE);

  const setScheduleDate = (date) => setScheduleModal((prev) => ({ ...prev, date }));

  const confirmSchedule = async (e) => {
    e.preventDefault();
    const { card, date, moveToImplantation } = scheduleModal;
    if (!card || !date) return;

    if (date < getToday()) {
      alert("A data prevista de implantação não pode ser uma data retroativa (anterior a hoje).");
      return;
    }

    const isOnlyReschedule =
      !moveToImplantation && (card.status === "implantacao" || card.status === "concluido");

    try {
      if (isOnlyReschedule) {
        await api.updateCardSchedule(card.id, date);
        patchSelectedCard(card.id, { scheduled_date: date });
        loadBoard();
      } else {
        await moveStatus(card.id, "implantacao", date);
        patchSelectedCard(card.id, { status: "implantacao", scheduled_date: date });
      }
      closeSchedule();
    } catch (err) {
      alert(err.message || "Erro ao salvar data de implantação");
    }
  };

  // ---------- Criação de card ----------

  const createCard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createCard(newTitle.trim());
      setNewTitle("");
      setShowCreateModal(false);
      loadBoard();
    } catch (err) {
      alert(err.message);
    }
  };

  return {
    cards,
    users,
    loading,
    getOperatorName,
    actions: {
      assumeCard,
      assignOperator,
      moveStatus,
      dropCard,
      reopenCard,
      reopenImplantation,
      toggleActive,
      deleteCard,
    },
    details: {
      selectedCard,
      loadingCardDetails,
      newNoteText,
      setNewNoteText,
      savingNote,
      openCard,
      closeCard,
      addNote,
      deleteNote,
    },
    schedule: {
      ...scheduleModal,
      open: openSchedule,
      close: closeSchedule,
      setDate: setScheduleDate,
      confirm: confirmSchedule,
    },
    creation: {
      isOpen: showCreateModal,
      open: () => setShowCreateModal(true),
      close: () => setShowCreateModal(false),
      title: newTitle,
      setTitle: setNewTitle,
      submit: createCard,
    },
  };
};
