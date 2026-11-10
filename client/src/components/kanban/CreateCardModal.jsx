import React from 'react';
import { createPortal } from 'react-dom';

export default function CreateCardModal({
  isOpen,
  title,
  onChangeTitle,
  onClose,
  onSubmit
}) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in zoom-in-95 duration-200">
        <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-2">
          Criar Novo Card de Onboarding
        </h3>
        <p className="text-xs text-slate-500 dark:text-darkSurface-muted mb-4">
          Informe a identificação da loja (ex: "São José do Rio Preto 05"). O link público será gerado automaticamente.
        </p>

        <form onSubmit={onSubmit}>
          <input
            type="text"
            value={title}
            onChange={(e) => onChangeTitle(e.target.value)}
            placeholder="Ex: Ribeirão Preto Sul 02"
            required
            autoFocus
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm mb-4"
          />

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded-lg transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm transition"
            >
              Criar Card
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
