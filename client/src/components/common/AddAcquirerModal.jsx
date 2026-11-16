import React, { useState } from "react";
import { createPortal } from "react-dom";
import { CreditCard, Plus, X, CheckCircle2, AlertCircle } from "lucide-react";
import { api } from "../../services/api";

export default function AddAcquirerModal({ isOpen, onClose, onAcquirerAdded }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await api.addAcquirer(name.trim());
      setFeedback({
        type: "success",
        message: `Adquirente "${name.trim()}" adicionado com sucesso!`,
      });
      setTimeout(() => {
        if (onAcquirerAdded) onAcquirerAdded(res.acquirers, res.added);
        setName("");
        setFeedback(null);
        onClose();
      }, 1000);
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "Erro ao adicionar adquirente",
      });
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
              <CreditCard size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
                Adicionar Nova Adquirente
              </h3>
              <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
                Adicione uma nova opção de credenciamento TEF ao formulário
                público
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
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 size={15} />
            ) : (
              <AlertCircle size={15} />
            )}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Nome da Adquirente / Empresa TEF *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Vero (Banrisul), C6 Bank, SafraPay..."
              className="w-full px-3 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Esta adquirente ficará imediatamente disponível para seleção no
              formulário de credenciamento.
            </span>
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
              className="px-4 py-2 text-xs bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <Plus size={14} />
              <span>{loading ? "Cadastrando..." : "Adicionar Adquirente"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
