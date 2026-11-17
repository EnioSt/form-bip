import { useState } from "react";
import { KeyRound } from "lucide-react";
import { api } from "../../services/api";
import { Modal } from "../Modal";
import { ModalHeader } from "../ModalHeader";
import { FeedbackAlert } from "../FeedbackAlert";
import { PasswordField } from "../PasswordField";

const TITLE_ID = "change-password-modal-title";

export const ChangePasswordModal = ({
  isOpen,
  targetUser,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !targetUser) return null;

  const isSelf = currentUser?.id === targetUser.id;
  const isAdmin = currentUser?.role === "admin";
  const requiresCurrentPassword = isSelf && !isAdmin;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 4) {
      setFeedback({ type: "error", message: "A nova senha deve ter no mínimo 4 caracteres." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: "error", message: "A confirmação de senha não confere." });
      return;
    }

    setLoading(true);
    try {
      await api.updateUserPassword(targetUser.id, {
        newPassword,
        currentPassword: requiresCurrentPassword ? currentPassword : undefined,
        requesterId: currentUser?.id,
        requesterRole: currentUser?.role,
      });

      setFeedback({ type: "success", message: "Senha atualizada com sucesso!" });
      setTimeout(() => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setFeedback(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      labelledBy={TITLE_ID}
      overlayClassName="overflow-y-auto"
      className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in zoom-in-95 duration-200"
    >
      <ModalHeader
        icon={KeyRound}
        titleId={TITLE_ID}
        title={isSelf ? "Alterar Minha Senha" : `Alterar Senha: ${targetUser.name}`}
        subtitle={
          isSelf
            ? "Defina uma nova senha para o seu acesso"
            : `Redefinindo credencial de acesso (${targetUser.email})`
        }
        onClose={onClose}
      />

      <FeedbackAlert feedback={feedback} />

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Se for o próprio usuário (e não admin redefinindo), pede a senha atual */}
        {requiresCurrentPassword && (
          <PasswordField
            id="current-password"
            label="Senha Atual"
            value={currentPassword}
            onChange={setCurrentPassword}
            placeholder="Sua senha atual"
            autoComplete="current-password"
          />
        )}

        <PasswordField
          id="new-password"
          label="Nova Senha"
          value={newPassword}
          onChange={setNewPassword}
          minLength={4}
          placeholder="Mínimo 4 caracteres"
          autoComplete="new-password"
        />

        <PasswordField
          id="confirm-password"
          label="Confirmar Nova Senha"
          value={confirmPassword}
          onChange={setConfirmPassword}
          minLength={4}
          placeholder="Digite novamente a nova senha"
          autoComplete="new-password"
        />

        <footer className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-darkSurface-border">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded-lg transition"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-xs bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
          >
            {loading ? "Salvando..." : "Salvar Nova Senha"}
          </button>
        </footer>
      </form>
    </Modal>
  );
};
