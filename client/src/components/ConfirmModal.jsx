import React from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmação',
  message = 'Tem certeza que deseja realizar esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      iconBg: 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
      icon: <AlertTriangle size={24} />,
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-600/20'
    },
    warning: {
      iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
      icon: <AlertTriangle size={24} />,
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white shadow-amber-600/20'
    },
    primary: {
      iconBg: 'bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400',
      icon: <Info size={24} />,
      confirmBtn: 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-brand-600/20'
    }
  }[variant] || variantStyles.danger;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 animate-in fade-in duration-150">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-darkSurface-card rounded-2xl p-6 shadow-2xl border border-slate-200/80 dark:border-darkSurface-border animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Fechar no canto superior */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition disabled:opacity-50"
        >
          <X size={18} />
        </button>

        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${variantStyles.iconBg}`}>
            {variantStyles.icon}
          </div>

          <div className="flex-1 pr-4">
            <h3 className="text-base font-bold font-heading text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-darkSurface-muted leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-6 flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100 dark:border-darkSurface-border/60">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded-xl transition disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl shadow-md transition disabled:opacity-50 flex items-center space-x-1.5 ${variantStyles.confirmBtn}`}
          >
            <span>{loading ? 'Processando...' : confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
