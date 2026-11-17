import { Copy, FileDown, Download, RotateCcw } from "lucide-react";
import { downloadMarkdown, downloadPhotoSeparately } from "../../utils/exporter";

/**
 * Rodapé do modal de detalhes: copiar link, reabrir formulário, exportações e fechar.
 * - onReopenForm: reabre o link para o cliente corrigir os dados (já pré-preenchidos)
 */
export const CardDetailFooter = ({ card, onCopyLink, onReopenForm, onClose }) => {
  const hasData = !!card.formData;
  const hasPhoto = hasData && !!card.formData.photo_url;
  const canReopenForm = hasData && !card.is_form_open && !!onReopenForm;

  return (
    <footer className="p-4 border-t border-slate-100 dark:border-darkSurface-border flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-darkSurface-bg/50 rounded-b-2xl">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-darkSurface-card hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover border border-slate-200 dark:border-darkSurface-border text-slate-700 dark:text-slate-300 font-medium transition"
        >
          <Copy size={13} />
          <span>Copiar Link</span>
        </button>

        {canReopenForm && (
          <button
            type="button"
            onClick={onReopenForm}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-300 font-medium transition"
            title="Reabre o link para o cliente corrigir os dados. As informações já preenchidas são mantidas."
          >
            <RotateCcw size={13} />
            <span>Reabrir Formulário</span>
          </button>
        )}

        {hasData && (
          <button
            type="button"
            onClick={() => downloadMarkdown(card)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition"
            title="Baixar resumo completo em arquivo Markdown (.md)"
          >
            <FileDown size={13} />
            <span>Exportar .MD (Bloco de Notas)</span>
          </button>
        )}

        {hasPhoto && (
          <button
            type="button"
            onClick={() => downloadPhotoSeparately(card)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition"
            title="Baixar a imagem da maquininha"
          >
            <Download size={13} />
            <span>Baixar Foto</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="px-4 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-darkSurface-cardHover dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium rounded-lg transition"
      >
        Fechar
      </button>
    </footer>
  );
};
