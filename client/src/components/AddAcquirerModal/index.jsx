import { useState } from "react";
import { CreditCard, Plus } from "lucide-react";
import { api } from "../../services/api";
import { Modal } from "../Modal";
import { ModalHeader } from "../ModalHeader";
import { FeedbackAlert } from "../FeedbackAlert";

const TITLE_ID = "add-acquirer-modal-title";

export const AddAcquirerModal = ({ isOpen, onClose, onAcquirerAdded }) => {
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

  return (
    <Modal
      labelledBy={TITLE_ID}
      overlayClassName="overflow-y-auto"
      className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in zoom-in-95 duration-200"
    >
      <ModalHeader
        icon={CreditCard}
        titleId={TITLE_ID}
        title="Adicionar Nova Adquirente"
        subtitle="Adicione uma nova opção de credenciamento TEF ao formulário público"
        onClose={onClose}
      />

      <FeedbackAlert feedback={feedback} />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="acquirer-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Nome da Adquirente / Empresa TEF *
          </label>
          <input
            id="acquirer-name"
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            aria-describedby="acquirer-name-hint"
            placeholder="Ex: Vero (Banrisul), C6 Bank, SafraPay..."
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <small id="acquirer-name-hint" className="text-[11px] text-slate-400 block mt-1">
            Esta adquirente ficará imediatamente disponível para seleção no formulário de credenciamento.
          </small>
        </div>

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
            className="px-4 py-2 text-xs bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus size={14} />
            <span>{loading ? "Cadastrando..." : "Adicionar Adquirente"}</span>
          </button>
        </footer>
      </form>
    </Modal>
  );
};
