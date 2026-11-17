import { createPortal } from 'react-dom';

/**
 * Casca base de todas as modais: portal no <body>, overlay escuro e painel com role="dialog".
 * - overlayClassName: classes extras do overlay (ex: animação, overflow-y-auto)
 * - className: classes completas do painel
 */
export const Modal = ({
  isOpen = true,
  className = '',
  overlayClassName = '',
  labelledBy,
  children
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 ${overlayClassName}`}>
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={className}
      >
        {children}
      </section>
    </div>,
    document.body
  );
};
