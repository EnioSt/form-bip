import React from "react";
import { createPortal } from "react-dom";
import {
  X,
  Building2,
  CreditCard,
  QrCode,
  FileText,
  Copy,
  FileDown,
  Download,
  MessageSquare,
  Send,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import {
  downloadMarkdown,
  downloadPhotoSeparately,
} from "../../utils/exporter";

export default function CardDetailModal({
  selectedCard,
  loadingCardDetails,
  user,
  operatorName,
  newNoteText,
  savingNote,
  onClose,
  onCopyLink,
  onStartImplantation,
  onToggleActive,
  onDeleteCard,
  onChangeNoteText,
  onAddNote,
  onDeleteNote,
}) {
  if (!selectedCard) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in fade-in zoom-in-95 duration-200">
        {/* Header do Modal */}
        <div className="p-6 border-b border-slate-100 dark:border-darkSurface-border flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-900/40">
                DADOS DO FORMULÁRIO SITEF
              </span>
              {/* Botão Interruptor Ativo / Inativo no Sistema */}
              {onToggleActive && (
                <button
                  type="button"
                  onClick={() => onToggleActive(selectedCard.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition ${
                    selectedCard.is_active !== false
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800"
                      : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800"
                  }`}
                  title={
                    selectedCard.is_active !== false
                      ? "Clique para inativar esta loja no sistema"
                      : "Clique para reativar esta loja no sistema"
                  }
                >
                  <span
                    className={`w-2 h-2 rounded-full ${selectedCard.is_active !== false ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                  />
                  <span>
                    {selectedCard.is_active !== false
                      ? "Loja Ativa no Sistema"
                      : "Loja Inativa no Sistema"}
                  </span>
                </button>
              )}
            </div>
            <h3
              className={`text-xl font-black font-heading mt-1 ${
                selectedCard.is_active === false
                  ? "line-through text-slate-400 dark:text-slate-500 decoration-rose-500 decoration-2"
                  : "text-slate-900 dark:text-white"
              }`}
            >
              {selectedCard.title}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
              <span>
                Status:{" "}
                <strong className="uppercase text-brand-600 dark:text-brand-400">
                  {selectedCard.status}
                </strong>
              </span>
              <span>•</span>
              <span>
                Formulário:{" "}
                <strong>
                  {selectedCard.is_form_open ? "Aberto" : "Fechado"}
                </strong>
              </span>
              {selectedCard.operator_id && (
                <>
                  <span>•</span>
                  <span>
                    Operador: <strong>{operatorName}</strong>
                  </span>
                </>
              )}
              {selectedCard.scheduled_date ? (
                <>
                  <span>•</span>
                  <span className="text-purple-600 dark:text-purple-400 font-semibold inline-flex items-center gap-1">
                    Data Prevista:{" "}
                    <strong>
                      {new Date(
                        selectedCard.scheduled_date + "T12:00:00",
                      ).toLocaleDateString("pt-BR")}
                    </strong>
                    <button
                      type="button"
                      onClick={() => onStartImplantation(selectedCard)}
                      className="ml-1 text-purple-500 hover:text-purple-700 underline text-[11px]"
                      title="Alterar data"
                    >
                      (alterar)
                    </button>
                  </span>
                </>
              ) : (
                selectedCard.status === "implantacao" && (
                  <>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => onStartImplantation(selectedCard)}
                      className="text-amber-600 hover:text-amber-800 underline font-semibold text-xs"
                    >
                      + Definir data prevista
                    </button>
                  </>
                )
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onDeleteCard && (
              <button
                type="button"
                onClick={() =>
                  onDeleteCard(selectedCard.id, selectedCard.title)
                }
                className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Excluir este card"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {loadingCardDetails ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-500 dark:text-darkSurface-muted">
                Carregando dados preenchidos...
              </p>
            </div>
          ) : !selectedCard.formData ? (
            <div className="text-center py-12 text-slate-400">
              <FileText size={40} className="mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Este formulário ainda não foi preenchido pelo cliente.
              </p>
              <p className="text-xs mt-1">
                Envie o link público para o franqueado realizar o
                credenciamento.
              </p>
              <button
                onClick={(e) => onCopyLink(selectedCard.unique_token, e)}
                className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition"
              >
                <Copy size={13} />
                <span>Copiar Link do Formulário</span>
              </button>
            </div>
          ) : (
            <>
              {/* 1. DADOS DA LOJA */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                  <Building2 size={16} />
                  <span>1. DADOS DA LOJA</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-darkSurface-bg/60 p-4 rounded-xl border border-slate-200 dark:border-darkSurface-border">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #1. CNPJ
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.cnpj || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #2. Razão Social
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.razao_social || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #3. Responsável
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.responsavel || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #4. Telefone
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.telefone || "—"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-400 block font-medium">
                      #5. Email da Unidade
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.email_unidade || "—"}
                    </span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-xs text-slate-400 block font-medium">
                      #6. Endereço
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.endereco || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #7. CEP
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.cep || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #8 e #9. Cidade / UF
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.cidade || "—"} /{" "}
                      {selectedCard.formData.uf || "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. DADOS DO ADQUIRENTE */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                  <CreditCard size={16} />
                  <span>2. DADOS DO ADQUIRENTE (SiTEF)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 dark:bg-darkSurface-bg/60 p-4 rounded-xl border border-slate-200 dark:border-darkSurface-border">
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #10. Número Lógico
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.numero_logico_adquirente || "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #11. Quantidade de PDVs
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.qtd_pdvs_tef || "0"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block font-medium">
                      #12. Quantidade de TOTEMs
                    </span>
                    <span className="font-semibold text-slate-800 dark:text-white">
                      {selectedCard.formData.qtd_totems_tef || "0"}
                    </span>
                  </div>
                  <div className="sm:col-span-3 pt-2 border-t border-slate-200/60 dark:border-darkSurface-border/60 flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        #13. Foto da Maquininha
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                        {selectedCard.formData.foto_maquininha_ok
                          ? "✓ Marcada como OK"
                          : "Não confirmada"}
                      </span>
                    </div>
                    {selectedCard.formData.photo_url && (
                      <a
                        href={selectedCard.formData.photo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 bg-white dark:bg-darkSurface-card hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-darkSurface-border text-brand-600 dark:text-brand-400 font-medium transition"
                      >
                        <ImageIcon size={14} />
                        <span>Ver Foto Registrada</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. CREDENCIAMENTO PIX */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                  <QrCode size={16} />
                  <span>3. CREDENCIAMENTO PIX</span>
                </div>

                {selectedCard.formData.pix_nao_se_aplica ? (
                  <div className="p-3 bg-slate-50 dark:bg-darkSurface-bg/60 rounded-xl border border-slate-200 dark:border-darkSurface-border text-xs text-slate-500">
                    Loja optou por <strong>Não se aplica (N/A)</strong> para
                    recebimento com Pix.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-darkSurface-bg/60 p-4 rounded-xl border border-slate-200 dark:border-darkSurface-border">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        #14. Identificação do PSP (Banco)
                      </span>
                      <span className="font-semibold text-slate-800 dark:text-white">
                        {selectedCard.formData.pix_psp_banco || "—"}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">
                        #15. Integração FISERV no Banco
                      </span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                        {selectedCard.formData.pix_vinculacao_fiserv_ok
                          ? "✓ Vinculada e Confirmada"
                          : "Pendente"}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="text-xs text-slate-400 block font-medium">
                        #16. Chave Pix Utilizada
                      </span>
                      <span className="font-mono font-semibold text-slate-800 dark:text-white">
                        {selectedCard.formData.pix_chave || "—"}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 4. OBSERVAÇÕES INTERNAS DO CARD */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-darkSurface-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
                <MessageSquare size={16} />
                <span>
                  Observações Internas (
                  {Array.isArray(selectedCard.notes)
                    ? selectedCard.notes.length
                    : 0}
                  )
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                Qualquer operador pode colaborar
              </span>
            </div>

            {/* Formulário para Nova Observação */}
            <form onSubmit={onAddNote} className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  maxLength={150}
                  value={newNoteText}
                  onChange={(e) => onChangeNoteText(e.target.value)}
                  placeholder="Adicione um recado, detalhe de contato ou observação do card (máx 150 caracteres)..."
                  className="w-full p-3 pr-20 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-xl text-xs text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
                <div className="absolute right-3 bottom-3 flex items-center space-x-2">
                  <span
                    className={`text-[10px] font-mono font-medium ${
                      newNoteText.length >= 140
                        ? "text-rose-500 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    {newNoteText.length}/150
                  </span>
                  <button
                    type="submit"
                    disabled={savingNote || !newNoteText.trim()}
                    className="px-2.5 py-1 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 transition shadow-sm"
                  >
                    <Send size={12} />
                    <span>Salvar</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Lista de Observações Anteriores */}
            <div className="space-y-2">
              {Array.isArray(selectedCard.notes) &&
              selectedCard.notes.length > 0 ? (
                selectedCard.notes
                  .slice()
                  .reverse()
                  .map((n) => {
                    const canDelete =
                      n.author_id === user?.id || user?.role === "admin";

                    return (
                      <div
                        key={n.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-darkSurface-bg/70 border border-slate-200 dark:border-darkSurface-border text-xs space-y-1 group"
                      >
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {n.author_name}
                            {n.author_id === user?.id && (
                              <span className="ml-1 text-[10px] text-brand-500 font-normal">
                                (você)
                              </span>
                            )}
                          </span>

                          <div className="flex items-center space-x-2">
                            <span>
                              {new Date(n.created_at).toLocaleString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>

                            {canDelete && (
                              <button
                                type="button"
                                onClick={() => onDeleteNote(n.id)}
                                className="p-1 text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition"
                                title="Excluir minha observação"
                              >
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 break-words font-medium">
                          {n.text}
                        </p>
                      </div>
                    );
                  })
              ) : (
                <p className="text-xs text-slate-400 italic bg-slate-50 dark:bg-darkSurface-bg/50 p-3 rounded-xl text-center border border-dashed border-slate-200 dark:border-darkSurface-border">
                  Nenhuma observação registrada neste card até o momento.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="p-4 border-t border-slate-100 dark:border-darkSurface-border flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-darkSurface-bg/50 rounded-b-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={(e) => onCopyLink(selectedCard.unique_token, e)}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-darkSurface-card hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover border border-slate-200 dark:border-darkSurface-border text-slate-700 dark:text-slate-300 font-medium transition"
            >
              <Copy size={13} />
              <span>Copiar Link</span>
            </button>

            {selectedCard.formData && (
              <>
                <button
                  onClick={() => downloadMarkdown(selectedCard)}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-brand-600 hover:bg-brand-700 text-white font-medium shadow-sm transition"
                  title="Baixar resumo completo em arquivo Markdown (.md)"
                >
                  <FileDown size={13} />
                  <span>Exportar .MD (Bloco de Notas)</span>
                </button>

                {selectedCard.formData.photo_url && (
                  <button
                    onClick={() => downloadPhotoSeparately(selectedCard)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm transition"
                    title="Baixar a imagem da maquininha"
                  >
                    <Download size={13} />
                    <span>Baixar Foto</span>
                  </button>
                )}
              </>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-darkSurface-cardHover dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
