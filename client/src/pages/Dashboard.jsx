import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { themeConfig } from '../theme/theme';
import { Plus } from 'lucide-react';

import KanbanMetricsBar from '../components/kanban/KanbanMetricsBar';
import KanbanColumn from '../components/kanban/KanbanColumn';
import CardDetailModal from '../components/kanban/CardDetailModal';
import ScheduleModal from '../components/kanban/ScheduleModal';
import CreateCardModal from '../components/kanban/CreateCardModal';
import ConfirmModal from '../components/ConfirmModal';

const COLUMNS = [
  { id: 'triagem', title: 'Triagem', theme: themeConfig.colors.status.triagem },
  { id: 'preenchido', title: 'Preenchido', theme: themeConfig.colors.status.preenchido },
  { id: 'implantacao', title: 'Em Implantação', theme: themeConfig.colors.status.implantacao },
  { id: 'concluido', title: 'Concluído', theme: themeConfig.colors.status.concluido }
];

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);
  const [draggedCard, setDraggedCard] = useState(null);

  // Estado para o Modal Detalhado do Card
  const [selectedCard, setSelectedCard] = useState(null);
  const [loadingCardDetails, setLoadingCardDetails] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Estado para o Modal de Agendamento da Data Prevista
  const [scheduleModal, setScheduleModal] = useState({
    isOpen: false,
    card: null,
    date: ''
  });

  // Estado para o Modal de Confirmação com Efeito Blur
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'danger',
    onConfirm: null
  });

  const fetchBoardData = async () => {
    try {
      const [cardsRes, usersRes] = await Promise.all([
        api.getCards(),
        api.getUsers()
      ]);
      setCards(cardsRes);
      setUsers(usersRes);

      // Atualiza o card aberto no modal caso esteja ativo
      if (selectedCard) {
        const updated = cardsRes.find(c => c.id === selectedCard.id);
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
      setNewTitle('');
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
    e.dataTransfer.setData('text/plain', card.id);
    e.dataTransfer.effectAllowed = 'move';
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
    if (targetColumnId === 'implantacao') {
      handleStartImplantation(card);
      return;
    }

    // Se o destino for "concluido" e ainda não tem data prevista, ou transição normal
    // Atualização otimista imediata para feedback instantâneo
    setCards(prev => prev.map(c => c.id === card.id ? { ...c, status: targetColumnId } : c));
    await handleMoveStatus(card.id, targetColumnId);
  };

  const handleStartImplantation = (card) => {
    const today = new Date().toISOString().split('T')[0];
    setScheduleModal({
      isOpen: true,
      card,
      date: card.scheduled_date || today
    });
  };

  const handleConfirmSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleModal.card || !scheduleModal.date) return;

    const today = new Date().toISOString().split('T')[0];
    if (scheduleModal.date < today) {
      alert('A data prevista de implantação não pode ser uma data retroativa (anterior a hoje).');
      return;
    }

    try {
      if (scheduleModal.card.status === 'implantacao' || scheduleModal.card.status === 'concluido') {
        await api.updateCardSchedule(scheduleModal.card.id, scheduleModal.date);
        if (selectedCard && selectedCard.id === scheduleModal.card.id) {
          setSelectedCard(prev => ({
            ...prev,
            scheduled_date: scheduleModal.date
          }));
        }
        fetchBoardData();
      } else {
        await handleMoveStatus(scheduleModal.card.id, 'implantacao', scheduleModal.date);
      }
      setScheduleModal({ isOpen: false, card: null, date: '' });
    } catch (err) {
      alert(err.message || 'Erro ao salvar data de implantação');
    }
  };

  const handleReopen = (cardId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Reabrir Formulário',
      message: 'Deseja reabrir este formulário para nova edição pelo cliente? Todos os dados atuais preenchidos serão preservados.',
      confirmText: 'Sim, Reabrir',
      cancelText: 'Cancelar',
      variant: 'warning',
      onConfirm: async () => {
        try {
          await api.reopenCard(cardId);
          fetchBoardData();
        } catch (err) {
          alert(err.message);
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
    });
  };

  const handleOpenCard = async (card) => {
    setSelectedCard(card);
    setLoadingCardDetails(true);
    try {
      const fullData = await api.getCardDetails(card.id);
      setSelectedCard(fullData);
    } catch (err) {
      console.error('Erro ao buscar detalhes completos do card:', err);
    } finally {
      setLoadingCardDetails(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedCard) return;

    if (newNoteText.trim().length > 150) {
      alert('A observação deve ter no máximo 150 caracteres.');
      return;
    }

    setSavingNote(true);
    try {
      const res = await api.addCardNote(
        selectedCard.id,
        newNoteText.trim(),
        user?.id,
        user?.name || 'Operador'
      );
      setNewNoteText('');
      setSelectedCard(prev => ({
        ...prev,
        notes: res.card.notes
      }));
      fetchBoardData();
    } catch (err) {
      alert(err.message || 'Erro ao adicionar observação');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Excluir Observação',
      message: 'Tem certeza que deseja remover esta observação? Esta ação não pode ser desfeita.',
      confirmText: 'Sim, Excluir',
      cancelText: 'Cancelar',
      variant: 'danger',
      onConfirm: async () => {
        try {
          const res = await api.deleteCardNote(
            selectedCard.id,
            noteId,
            user?.id,
            user?.role
          );
          setSelectedCard(prev => ({
            ...prev,
            notes: res.card.notes
          }));
          fetchBoardData();
        } catch (err) {
          alert(err.message || 'Erro ao excluir observação');
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      }
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
    const op = users.find(u => u.id === operatorId);
    return op ? op.name : null;
  };

  return (
    <div className="flex-1 flex flex-col space-y-3 min-h-0">
      {/* Top Banner & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
        <div>
          <h1 className="text-xl font-bold font-heading text-slate-900 dark:text-white">
            Kanban de Onboarding & SiTEF
          </h1>
          <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
            Clique em qualquer card para visualizar os dados preenchidos pelo cliente
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium rounded-lg shadow-sm transition text-xs sm:text-sm self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Novo Card / Loja</span>
          </button>
        )}
      </div>

      {/* Barra Superior de Métricas do Kanban */}
      <KanbanMetricsBar columns={COLUMNS} cards={cards} />

      {/* Colunas do Kanban */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3.5 min-h-0 items-stretch">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.id}
            column={column}
            cards={cards}
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
            onStartImplantation={handleStartImplantation}
            onMoveStatus={handleMoveStatus}
            onReopen={handleReopen}
          />
        ))}
      </div>

      {/* Modal Detalhado do Card com Dados e Observações */}
      <CardDetailModal
        selectedCard={selectedCard}
        loadingCardDetails={loadingCardDetails}
        user={user}
        operatorName={selectedCard ? getOperatorName(selectedCard.operator_id) : null}
        newNoteText={newNoteText}
        savingNote={savingNote}
        onClose={() => setSelectedCard(null)}
        onCopyLink={copyFormLink}
        onStartImplantation={handleStartImplantation}
        onChangeNoteText={setNewNoteText}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Modal de Criação de Card */}
      <CreateCardModal
        isOpen={showAddModal}
        title={newTitle}
        onChangeTitle={setNewTitle}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleCreateCard}
      />

      {/* Modal de Agendamento da Data Prevista */}
      <ScheduleModal
        isOpen={scheduleModal.isOpen}
        card={scheduleModal.card}
        date={scheduleModal.date}
        onChangeDate={(d) => setScheduleModal(prev => ({ ...prev, date: d }))}
        onClose={() => setScheduleModal({ isOpen: false, card: null, date: '' })}
        onSubmit={handleConfirmSchedule}
      />

      {/* Modal de Confirmação Profissional (Backdrop Blur) */}
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText={confirmDialog.confirmText}
        cancelText={confirmDialog.cancelText}
        variant={confirmDialog.variant}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
