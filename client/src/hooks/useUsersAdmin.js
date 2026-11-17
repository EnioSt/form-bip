import { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";

const EMPTY_FORM = { name: "", email: "", password: "", role: "operator" };

/**
 * Gestão de usuários: listagem, cadastro, troca de função, ativação e exclusão.
 * - openConfirm / closeConfirm: vindos de useConfirmDialog
 */
export const useUsersAdmin = ({ openConfirm, closeConfirm }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [feedback, setFeedback] = useState(null);

  const loadUsers = useCallback(async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial: o carregador async é definido dentro do efeito (padrão recomendado)
  useEffect(() => {
    const loadInitialUsers = async () => {
      await loadUsers();
    };
    loadInitialUsers();
  }, [loadUsers]);

  const setFormField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const createUser = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await api.createUser(form);
      setFeedback({ type: "success", message: "Usuário cadastrado com sucesso!" });
      setForm(EMPTY_FORM);
      loadUsers();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setFeedback({ type: "success", message: "Função do usuário atualizada com sucesso!" });
      loadUsers();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const toggleActive = async (targetUser) => {
    const isActivating = targetUser.is_active === false;
    try {
      await api.toggleUserActive(targetUser.id);
      setFeedback({
        type: "success",
        message: `Usuário "${targetUser.name}" ${isActivating ? "ativado" : "inativado"} com sucesso!`,
      });
      loadUsers();
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    }
  };

  const deleteUser = (targetUser) => {
    openConfirm({
      title: "Excluir Usuário",
      message: `Tem certeza que deseja excluir o usuário "${targetUser.name}"?`,
      confirmText: "Sim, Excluir",
      variant: "danger",
      onConfirm: async () => {
        try {
          await api.deleteUser(targetUser.id);
          setFeedback({ type: "success", message: "Usuário excluído com sucesso!" });
          loadUsers();
          closeConfirm();
        } catch (err) {
          // Backend bloqueia exclusão de quem tem histórico de cards: orienta a inativar
          openConfirm({
            title: "Exclusão Bloqueada: Histórico Vinculado",
            message: err.message,
            confirmText: "Entendi, manter histórico",
            cancelText: "Fechar",
            variant: "warning",
            onConfirm: closeConfirm,
          });
        }
      },
    });
  };

  const notifyPasswordChanged = () => {
    setFeedback({ type: "success", message: "Senha alterada com sucesso!" });
    loadUsers();
  };

  return {
    users,
    loading,
    form,
    setFormField,
    feedback,
    createUser,
    changeRole,
    toggleActive,
    deleteUser,
    notifyPasswordChanged,
  };
};
