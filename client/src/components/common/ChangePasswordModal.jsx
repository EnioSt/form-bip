import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { KeyRound, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function ChangePasswordModal({
  isOpen,
  targetUser,
  currentUser,
  onClose,
  onSuccess
}) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen || !targetUser) return null;

  const isSelf = currentUser?.id === targetUser.id;
  const isAdmin = currentUser?.role === 'admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (newPassword.length < 4) {
      setFeedback({ type: 'error', message: 'A nova senha deve ter no mínimo 4 caracteres.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'A confirmação de senha não confere.' });
      return;
    }

    setLoading(true);
    try {
      await api.updateUserPassword(targetUser.id, {
        newPassword,
        currentPassword: isSelf && !isAdmin ? currentPassword : undefined,
        requesterId: currentUser?.id,
        requesterRole: currentUser?.role
      });

      setFeedback({ type: 'success', message: 'Senha atualizada com sucesso!' });
      setTimeout(() => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setFeedback(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold">
              <KeyRound size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                {isSelf ? 'Alterar Minha Senha' : `Alterar Senha: ${targetUser.name}`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
                {isSelf 
                  ? 'Defina uma nova senha para o seu acesso' 
                  : `Redefinindo credencial de acesso (${targetUser.email})`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition"
          >
            <X size={18} />
          </button>
        </div>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 border ${
              feedback.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900'
            }`}
          >
            {feedback.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Se for o próprio usuário (e não admin redefinindo), pede a senha atual */}
          {isSelf && !isAdmin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Senha Atual
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sua senha atual"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nova Senha
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Mínimo 4 caracteres"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Confirmar Nova Senha
            </label>
            <input
              type="password"
              required
              minLength={4}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Digite novamente a nova senha"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-darkSurface-border">
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
              {loading ? 'Salvando...' : 'Salvar Nova Senha'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
