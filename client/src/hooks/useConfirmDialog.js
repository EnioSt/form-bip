import { useState, useCallback } from "react";

const INITIAL_STATE = {
  isOpen: false,
  title: "",
  message: "",
  confirmText: "Confirmar",
  cancelText: "Cancelar",
  variant: "danger",
  onConfirm: null,
};

/**
 * Estado do <ConfirmModal />.
 * - openConfirm(config): abre o modal com título, mensagem, textos, variante e onConfirm
 * - closeConfirm(): fecha mantendo o conteúdo (evita "piscar" durante a animação)
 * - dialogProps: props prontas para espalhar no <ConfirmModal {...dialogProps} />
 */
export const useConfirmDialog = () => {
  const [dialog, setDialog] = useState(INITIAL_STATE);

  const closeConfirm = useCallback(() => {
    setDialog((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const openConfirm = useCallback((config) => {
    setDialog({ ...INITIAL_STATE, ...config, isOpen: true });
  }, []);

  const dialogProps = {
    isOpen: dialog.isOpen,
    title: dialog.title,
    message: dialog.message,
    confirmText: dialog.confirmText,
    cancelText: dialog.cancelText,
    variant: dialog.variant,
    onConfirm: dialog.onConfirm,
    onClose: closeConfirm,
  };

  return { openConfirm, closeConfirm, dialogProps };
};
