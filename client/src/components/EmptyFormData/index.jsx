import { FileText, Copy } from "lucide-react";

/**
 * Estado vazio do modal de detalhes quando o cliente ainda não preencheu o formulário.
 */
export const EmptyFormData = ({ onCopyLink }) => {
  return (
    <section className="text-center py-12 text-slate-400">
      <FileText size={40} className="mx-auto mb-2 opacity-50" />
      <p className="font-semibold text-slate-700 dark:text-slate-300">
        Este formulário ainda não foi preenchido pelo cliente.
      </p>
      <p className="text-xs mt-1">
        Envie o link público para o franqueado realizar o credenciamento.
      </p>
      <button
        type="button"
        onClick={onCopyLink}
        className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition"
      >
        <Copy size={13} />
        <span>Copiar Link do Formulário</span>
      </button>
    </section>
  );
};
