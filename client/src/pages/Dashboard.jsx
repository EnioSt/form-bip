import React, { useState, useEffect, useMemo } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { themeConfig } from "../theme/theme";
import { Plus, Search, X, UserCheck, CreditCard } from "lucide-react";

import KanbanMetricsBar from "../components/kanban/KanbanMetricsBar";
import KanbanColumn from "../components/kanban/KanbanColumn";
import CardDetailModal from "../components/kanban/CardDetailModal";
import ScheduleModal from "../components/kanban/ScheduleModal";
import CreateCardModal from "../components/kanban/CreateCardModal";
import AddAcquirerModal from "../components/common/AddAcquirerModal";
import ConfirmModal from "../components/ConfirmModal";

const COLUMNS = [
  { id: "triagem", title: "Triagem", theme: themeConfig.colors.status.triagem },
  {
    id: "preenchido",
    title: "Preenchido",
    theme: themeConfig.colors.status.preenchido,
  },
  {
    id: "implantacao",
    title: "Em Implantação",
    theme: themeConfig.colors.status.implantacao,
  },
  {
    id: "concluido",
    title: "Concluído",
    theme: themeConfig.colors.status.concluido,
  },
];

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddAcquirerModal, setShowAddAcquirerModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOperatorFilter, setSelectedOperatorFilter] = useState("all");

  // Estado para o Modal Detalhado do Card
  const [selectedCard, setSelectedCard] = useState(null);
  const [loadingCardDetails, setLoadingCardDetails] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  // Estado para o Modal de Agendamento da Data Prevista
  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    card: null,
    date: "",
  });

  // Estado para o Modal de Confirmação com Efeito Blur
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: "",
    message: "",
    confirmText: "Confirmar",
    cancelText: "Cancelar",
    variant: "danger",
    onConfirm: null,
  });

  // Função auxiliar para normalizar texto removendo acentos e convertendo para minúsculas
  const normalizeText = (text) => {
    if (!text) return "";
    return text
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  };

  // Filtragem dos cards por termo de busca nas etapas do Kanban
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // 1. Filtro por Operador vinculado
      if (selectedOperatorFilter !== "all") {
        if (selectedOperatorFilter === "unassigned") {
          if (card.operator_id) return false;
        } else if (card.operator_id !== selectedOperatorFilter) {
          return false;
        }
      }

      // 2. Filtro por termo de pesquisa (Unidade / Razão Social / Cidade)
      if (searchTerm.trim()) {
        const normalizedSearch = normalizeText(searchTerm);
        const matchTitle = normalizeText(card.title).includes(normalizedSearch);
        const matchRazao =
          card.formData?.razao_social &&
          normalizeText(card.formData.razao_social).includes(normalizedSearch);
        const matchCidade =
          card.formData?.cidade &&
          normalizeText(card.formData.cidade).includes(normalizedSearch);
        if (!matchTitle && !matchRazao && !matchCidade) return false;
      }

      return true;
    });
  }, [cards, searchTerm, selectedOperatorFilter]);

  const fetchBoardData = async () => {
    try {
      const [cardsRes, usersRes] = await Promise.all([
        api.getCards(),
        api.getUsers(),
      ]);
      setCards(cardsRes);
      setUsers(usersRes);

      // Atualiza o card aberto no modal caso esteja ativo
      if (selectedCard) {
        const updated = cardsRes.find((c) => c.id === selectedCard.id);
        if (updated) setSelectedCard(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, []);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createCard(newTitle.trim());
      setNewTitle("");
      setShowAddModal(false);
      fetchBoardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssume = async (cardId) => {
    try {
      await api.assumeCard(cardId, user.id);
      fetchBoardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssignOperator = async (cardId, operatorId) => {
    try {
      await api.assumeCard(cardId, operatorId);
      fetchBoardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMoveStatus = async (cardId, nextStatus, scheduledDate = null) => {
    try {
      await api.updateCardStatus(cardId, nextStatus, scheduledDate);
      fetchBoardData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Drag and Drop Nativo
  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const handleDropCard = async (targetColumnId) => {
    if (!draggedCard) return;
    const card = draggedCard;
    setDraggedCard(null);

    // Se já estiver na mesma coluna, não faz nada
    if (card.status === targetColumnId) return;

    // Se o destino for "implantacao", precisa definir/confirmar a data prevista
    if (targetColumnId === "implantacao") {
      handleStartImplantation(card);
      return;
    }

    // Se o destino for "concluido" e ainda não tem data prevista, ou transição normal
    // Atualização otimista imediata para feedback instantâneo
    setCards((prev) =>
      prev.map((c) =>
        c.id === card.id ? { ...c, status: targetColumnId } : c,
      ),
    );
    await handleMoveStatus(card.id, targetColumnId);
  };

  const handleStartImplantation = (card) => {
    const today = new Date().toISOString().split("T")[0];
    setScheduleModal({
      isOpen: true,
      card,
      date: card.scheduled_date || today,
    });
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleModal.card || !scheduleModal.date) return;

    const today = new Date().toISOString().split("T")[0];
    if (scheduleModal.date < today) {
      alert(
        "A data prevista de implantação não pode ser uma data retroativa (anterior a hoje).",
      );
      return;
    }

    try {
      if (
        scheduleModal.card.status === "implantacao" ||
        scheduleModal.card.status === "concluido"
      ) {
        await api.updateCardSchedule(scheduleModal.card.id, scheduleModal.date);
        if (selectedCard && selectedCard.id === scheduleModal.card.id) {
          setSelectedCard((prev) => ({
            ...prev,
            scheduled_date: scheduleModal.date,
          }));
        }
        fetchBoardData();
      } else {
        await handleMoveStatus(
          scheduleModal.card.id,
          "implantacao",
          scheduleModal.date,
        );
      }
      setScheduleModal({ isOpen: false, card: null, date: "" });
    } catch (err) {
      alert(err.message || "Erro ao salvar data de implantação");
    }
  };

  const handleReopen = (cardId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Reabrir Formulário",
      message:
        "Deseja reabrir este formulário para nova edição pelo cliente? Todos os dados atuais preenchidos serão preservados.",
      confirmText: "Sim, Reabrir",
      cancelText: "Cancelar",
      variant: "warning",
      onConfirm: async () => {
        try {
          await api.reopenCard(cardId);
          fetchBoardData();
        } catch (err) {
          alert(err.message);
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleOpenCard = async (card) => {
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

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCard) return;

    if (newNoteText.trim().length > 150) {
      alert("A observação deve ter no máximo 150 caracteres.");
      return;
    }

    setSavingNote(true);
    try {
      const res = await api.addCardNote(
        selectedCard.id,
        newNoteText.trim(),
        user?.id,
        user?.name || "Operador",
      );
      setNewNoteText("");
      setSelectedCard((prev) => ({
        ...prev,
        notes: res.card.notes,
      }));
      fetchBoardData();
    } catch (err) {
      alert(err.message || "Erro ao adicionar observação");
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Observação",
      message:
        "Tem certeza que deseja remover esta observação? Esta ação não pode ser desfeita.",
      confirmText: "Sim, Excluir",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: async () => {
        try {
          const res = await api.deleteCardNote(
            selectedCard.id,
            noteId,
            user?.id,
            user?.role,
          );
          setSelectedCard((prev) => ({
            ...prev,
            notes: res.card.notes,
          }));
          fetchBoardData();
        } catch (err) {
          alert(err.message || "Erro ao excluir observação");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const handleToggleActive = async (cardId) => {
    try {
      const updated = await api.toggleCardActive(cardId);
      setCards((prev) =>
        prev.map((c) =>
          c.id === cardId ? { ...c, is_active: updated.is_active } : c,
        ),
      );
      if (selectedCard && selectedCard.id === cardId) {
        setSelectedCard((prev) => ({ ...prev, is_active: updated.is_active }));
      }
    } catch (err) {
      alert(err.message || "Erro ao alterar status da loja");
    }
  };

  const handleDeleteCard = (cardId, cardTitle) => {
    const titleToDisplay = cardTitle || "esta unidade";
    setConfirmDialog({
      isOpen: true,
      title: "Excluir Card do Sistema",
      message: `Tem certeza que deseja excluir o card de "${titleToDisplay}"? Todos os dados vinculados serão excluídos permanentemente. Deseja continuar?`,
      confirmText: "Sim, Excluir Card",
      cancelText: "Cancelar",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.deleteCard(cardId);
          if (selectedCard && selectedCard.id === cardId) {
            setSelectedCard(null);
          }
          fetchBoardData();
        } catch (err) {
          alert(err.message || "Erro ao excluir o card");
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  const copyFormLink = (uniqueToken, e) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/form/${uniqueToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(uniqueToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const getOperatorName = (operatorId) => {
    const op = users.find((u) => u.id === operatorId);
    return op ? op.name : null;
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 min-h-0">
      {/* Top Banner, Pesquisa & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
        <div>
          <h1 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
            Kanban de Onboarding & SiTEF
          </h1>
          <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
            Clique em qualquer card para visualizar os dados preenchidos pelo
            cliente
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto">
          {/* Campo de Pesquisa Rápida por Unidade/Loja */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar unidade ou loja..."
              className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition"
                title="Limpar pesquisa"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Campo de Seleção para Filtrar por Operador */}
          <div className="relative shrink-0">
            <select
              value={selectedOperatorFilter}
              onChange={(e) => setSelectedOperatorFilter(e.target.value)}
              className="py-1.5 pl-3 pr-7 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs cursor-pointer font-medium"
            >
              <option value="all">Todos os Operadores</option>
              <option value="unassigned">Sem Operador Atribuído</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.is_active === false ? "(Inativo)" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Botão Adicionar Adquirente */}
          <button
            type="button"
            onClick={() => setShowAddAcquirerModal(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-card dark:hover:bg-darkSurface-cardHover text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-darkSurface-border font-medium rounded-lg transition text-xs sm:text-sm shrink-0 whitespace-nowrap shadow-2xs"
            title="Cadastrar nova adquirente para seleção nos formulários"
          >
            <CreditCard size={15} className="text-brand-500" />
            <span>Adicionar Adquirente</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium rounded-lg shadow-sm transition text-xs sm:text-sm shrink-0 whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Novo Card / Loja</span>
            </button>
          )}
        </div>
      </div>

      {/* Barra Superior de Métricas do Kanban */}
      <KanbanMetricsBar columns={COLUMNS} cards={cards} />

      {/* Indicador de Filtro Ativo */}
      {(searchTerm || selectedOperatorFilter !== "all") && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-brand-50/80 dark:bg-brand-950/40 border border-brand-200 dark:border-brand-900/60 rounded-lg text-xs text-brand-700 dark:text-brand-300 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span>Filtrando por:</span>
            {searchTerm && (
              <span className="font-semibold bg-white dark:bg-darkSurface-card px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                "{searchTerm}"
              </span>
            )}
            {selectedOperatorFilter !== "all" && (
              <span className="font-semibold bg-white dark:bg-darkSurface-card px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800 flex items-center gap-1">
                <UserCheck size={12} className="text-brand-500" />
                {selectedOperatorFilter === "unassigned"
                  ? "Sem Operador"
                  : getOperatorName(selectedOperatorFilter) || "Operador"}
              </span>
            )}
            <span className="text-slate-500 dark:text-slate-400">
              ({filteredCards.length}{" "}
              {filteredCards.length === 1 ? "card" : "cards"})
            </span>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setSelectedOperatorFilter("all");
            }}
            className="text-xs font-semibold hover:underline flex items-center gap-1 text-brand-600 dark:text-brand-400 ml-2"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}

      {/* Colunas do Kanban */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 min-h-0 items-stretch">
        {COLUMNS.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={filteredCards}
            user={user}
            users={users}
            copiedToken={copiedToken}
            draggedCard={draggedCard}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDropCard={handleDropCard}
            onOpenCard={handleOpenCard}
            onCopyLink={copyFormLink}
            onAssume={handleAssume}
            onAssignOperator={handleAssignOperator}
            onStartImplantation={handleStartImplantation}
            onMoveStatus={handleMoveStatus}
            onReopen={handleReopen}
            onDeleteCard={handleDeleteCard}
          />
        ))}
      </div>

      {/* Modal Detalhado do Card com Dados e Observações */}
      <CardDetailModal
        selectedCard={selectedCard}
        loadingCardDetails={loadingCardDetails}
        user={user}
        operatorName={
          selectedCard ? getOperatorName(selectedCard.operator_id) : null
        }
        newNoteText={newNoteText}
        savingNote={savingNote}
        onClose={() => setSelectedCard(null)}
        onCopyLink={copyFormLink}
        onStartImplantation={handleStartImplantation}
        onToggleActive={handleToggleActive}
        onDeleteCard={handleDeleteCard}
        onChangeNoteText={setNewNoteText}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Modal de Criação de Card */}
      <CreateCardModal
        isOpen={showAddModal}
        title={newTitle}
        cards={cards}
        onChangeTitle={setNewTitle}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateCard}
      />

      {/* Modal de Agendamento da Data Prevista */}
      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        card={scheduleModal.card}
        date={scheduleModal.date}
        onChangeDate={(d) => setScheduleModal((prev) => ({ ...prev, date: d }))}
        onClose={() =>
          setScheduleModal({ isOpen: false, card: null, date: "" })
        }
        onSubmit={handleConfirmSchedule}
      />

      {/* Modal para Adicionar Nova Adquirente */}
      <AddAcquirerModal
        isOpen={showAddAcquirerModal}
        onClose={() => setShowAddAcquirerModal(false)}
        onAcquirerAdded={(updatedList, addedName) => {
          // Adquirente adicionada com sucesso
        }}
      />

      {/* Modal de Confirmação Profissional (Backdrop Blur) */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
