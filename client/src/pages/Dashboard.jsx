import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { themeConfig } from '../theme/theme';
import { 
  Plus, 
  ExternalLink, 
  RotateCcw, 
  UserCheck, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  Copy,
  Check,
  X,
  Building2,
  CreditCard,
  QrCode,
  FileText,
  Phone,
  Mail,
  MapPin,
  Image as ImageIcon,
  Download,
  FileDown
} from 'lucide-react';
import { downloadMarkdown, downloadPhotoSeparately } from '../utils/exporter';

const COLUMNS = [
  { id: 'triagem', title: 'Triagem', theme: themeConfig.colors.status.triagem },
  { id: 'preenchido', title: 'Preenchido', theme: themeConfig.colors.status.preenchido },
  { id: 'implantacao', title: 'Em Implantação', theme: themeConfig.colors.status.implantacao },
  { id: 'concluido', title: 'Concluído', theme: themeConfig.colors.status.concluido }
];

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [cards, setCards] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [copiedToken, setCopiedToken] = useState(null);

  // Estado para o Modal com os dados detalhados do card
  const [selectedCard, setSelectedCard] = useState(null);
  const [loadingCardDetails, setLoadingCardDetails] = useState(false);

  const handleOpenCard = async (card) => {
    setSelectedCard(card);
    setLoadingCardDetails(true);
    try {
      const fullData = await api.getCardDetails(card.id);
      setSelectedCard(fullData);
    } catch (err) {
      console.error('Erro ao buscar detalhes completos do card:', err);
    } finally {
      setLoadingCardDetails(false);
    }
  };

  const fetchBoardData = async () => {
    try {
      const [cardsRes, usersRes] = await Promise.all([
        api.getCards(),
        api.getUsers()
      ]);
      setCards(cardsRes);
      setUsers(usersRes);

      // Se o modal estiver aberto, atualiza os dados dele também
      if (selectedCard) {
        const updated = cardsRes.find(c => c.id === selectedCard.id);
        if (updated) setSelectedCard(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardData();
  }, []);

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await api.createCard(newTitle.trim());
      setNewTitle('');
      setShowAddModal(false);
      fetchBoardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAssume = async (cardId) => {
    try {
      await api.assumeCard(cardId, user.id);
      fetchBoardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleMoveStatus = async (cardId, nextStatus) => {
    try {
      await api.updateCardStatus(cardId, nextStatus);
      fetchBoardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleReopen = async (cardId) => {
    if (!window.confirm('Deseja reabrir este formulário para nova edição pelo cliente? Os dados atuais serão preservados.')) {
      return;
    }
    try {
      await api.reopenCard(cardId);
      fetchBoardData();
    } catch (err) {
      alert(err.message);
    }
  };

  const copyFormLink = (uniqueToken, e) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/form/${uniqueToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(uniqueToken);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  const getOperatorName = (operatorId) => {
    const op = users.find(u => u.id === operatorId);
    return op ? op.name : null;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Metrics & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
            Kanban de Onboarding & SiTEF
          </h1>
          <p className="text-sm text-slate-500 dark:text-darkSurface-muted">
            Clique em qualquer card para visualizar os dados preenchidos pelo cliente
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-medium rounded-lg shadow-sm transition text-sm"
          >
            <Plus size={18} />
            <span>Novo Card / Loja</span>
          </button>
        )}
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {COLUMNS.map(col => {
          const count = cards.filter(c => c.status === col.id).length;
          return (
            <div 
              key={col.id} 
              className="p-4 rounded-xl bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border shadow-sm flex items-center justify-between"
            >
              <div>
                <div className="text-xs uppercase font-semibold text-slate-400">{col.title}</div>
                <div className="text-2xl font-black font-heading mt-0.5 text-slate-800 dark:text-white">{count}</div>
              </div>
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: col.theme.bg, color: col.theme.text }}
              >
                {col.id === 'triagem' && <Clock size={20} />}
                {col.id === 'preenchido' && <Layers size={20} />}
                {col.id === 'implantacao' && <ArrowRight size={20} />}
                {col.id === 'concluido' && <CheckCircle2 size={20} />}
              </div>
            </div>
          );
        })}
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {COLUMNS.map(column => {
          const columnCards = cards.filter(c => c.status === column.id);

          return (
            <div
              key={column.id}
              className="bg-slate-100/70 dark:bg-darkSurface-bg/70 rounded-2xl p-4 border border-slate-200 dark:border-darkSurface-border/80 flex flex-col min-h-[500px]"
            >
              {/* Header da Coluna */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-darkSurface-border">
                <div className="flex items-center space-x-2">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: column.theme.border }}
                  />
                  <h3 className="font-semibold text-sm text-slate-800 dark:text-white font-heading">
                    {column.title}
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-darkSurface-cardHover text-slate-600 dark:text-darkSurface-muted">
                  {columnCards.length}
                </span>
              </div>

              {/* Lista de Cartões */}
              <div className="space-y-3.5 flex-1">
                {columnCards.map(card => {
                  const operatorName = getOperatorName(card.operator_id);
                  const hasData = !!card.formData;

                  return (
                    <div
                      key={card.id}
                      onClick={() => handleOpenCard(card)}
                      className="bg-white dark:bg-darkSurface-card rounded-xl p-4 shadow-sm border border-slate-200/90 dark:border-darkSurface-border hover:shadow-md hover:border-brand-400 dark:hover:border-brand-500 transition group cursor-pointer relative"
                    >
                      {/* Título & Status Form */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-slate-800 dark:text-white text-sm leading-snug group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                          {card.title}
                        </h4>
                        {card.is_form_open ? (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 shrink-0">
                            Link Aberto
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-darkSurface-cardHover dark:text-slate-400 border border-slate-200 dark:border-darkSurface-border shrink-0">
                            Fechado
                          </span>
                        )}
                      </div>

                      {/* Tag do Operador e Indicador de Dados */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        {operatorName ? (
                          <div className="inline-flex items-center space-x-1 text-xs px-2 py-0.5 rounded bg-brand-50 text-brand-700 dark:bg-brand-950/50 dark:text-brand-300 border border-brand-200 dark:border-brand-900/60 font-medium">
                            <UserCheck size={12} />
                            <span>{operatorName}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">Sem operador atribuído</span>
                        )}

                        {hasData && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
                            <CheckCircle2 size={11} /> Dados OK
                          </span>
                        )}
                      </div>

                      {/* Ações do Card */}
                      <div 
                        className="space-y-2 pt-2 border-t border-slate-100 dark:border-darkSurface-border/60"
                        onClick={(e) => e.stopPropagation()} // Impede abrir modal ao clicar diretamente nas ações
                      >
                        {/* Copiar / Abrir Link do Franqueado */}
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={(e) => copyFormLink(card.unique_token, e)}
                            className="flex-1 py-1 px-2 rounded text-xs bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center space-x-1 transition"
                            title="Copiar Link do Formulário"
                          >
                            {copiedToken === card.unique_token ? (
                              <>
                                <Check size={12} className="text-emerald-500" />
                                <span className="text-emerald-500 font-medium">Copiado!</span>
                              </>
                            ) : (
                              <>
                                <Copy size={12} />
                                <span>Copiar Link</span>
                              </>
                            )}
                          </button>

                          <a
                            href={`/form/${card.unique_token}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-darkSurface-cardHover dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
                            title="Abrir Formulário no Navegador"
                          >
                            <ExternalLink size={13} />
                          </a>
                        </div>

                        {/* Botão Assumir (se não assumido) */}
                        {!card.operator_id && (
                          <button
                            onClick={() => handleAssume(card.id)}
                            className="w-full py-1 px-2 rounded text-xs bg-brand-50 hover:bg-brand-100 dark:bg-brand-950/40 dark:hover:bg-brand-900/50 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-900/40 font-medium flex items-center justify-center space-x-1 transition"
                          >
                            <UserCheck size={13} />
                            <span>Assumir Card</span>
                          </button>
                        )}

                        {/* Fluxo de Transição do Kanban */}
                        {card.status === 'preenchido' && (
                          <button
                            onClick={() => handleMoveStatus(card.id, 'implantacao')}
                            className="w-full py-1.5 px-2 rounded text-xs bg-purple-600 hover:bg-purple-700 text-white font-medium flex items-center justify-center space-x-1 shadow-sm transition"
                          >
                            <span>Mover para Implantação</span>
                            <ArrowRight size={13} />
                          </button>
                        )}

                        {card.status === 'implantacao' && (
                          <button
                            onClick={() => handleMoveStatus(card.id, 'concluido')}
                            className="w-full py-1.5 px-2 rounded text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center justify-center space-x-1 shadow-sm transition"
                          >
                            <CheckCircle2 size={13} />
                            <span>Concluir Implantação</span>
                          </button>
                        )}

                        {/* Botão de Reabertura */}
                        {(card.status !== 'triagem' || !card.is_form_open) && (
                          <button
                            onClick={() => handleReopen(card.id)}
                            className="w-full py-1 px-2 rounded text-[11px] text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30 flex items-center justify-center space-x-1 transition"
                            title="Reabre o formulário para edição do cliente mantendo dados"
                          >
                            <RotateCcw size={12} />
                            <span>Reabrir Formulário</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {columnCards.length === 0 && (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-darkSurface-border rounded-xl text-slate-400 text-xs">
                    Nenhum card aqui
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DETALHADO DO CARD COM TODAS AS INFORMAÇÕES DO FORMULÁRIO */}
      {selectedCard && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 dark:border-darkSurface-border animate-in fade-in zoom-in-95 duration-200">
            {/* Header do Modal */}
            <div className="p-6 border-b border-slate-100 dark:border-darkSurface-border flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-900/40">
                  DADOS DO FORMULÁRIO SITEF
                </span>
                <h3 className="text-xl font-black font-heading text-slate-900 dark:text-white mt-1">
                  {selectedCard.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>Status: <strong className="uppercase text-brand-600 dark:text-brand-400">{selectedCard.status}</strong></span>
                  <span>•</span>
                  <span>Formulário: <strong>{selectedCard.is_form_open ? 'Aberto' : 'Fechado'}</strong></span>
                  {selectedCard.operator_id && (
                    <>
                      <span>•</span>
                      <span>Operador: <strong>{getOperatorName(selectedCard.operator_id)}</strong></span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedCard(null)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo com Scroll */}
            <div className="p-6 overflow-y-auto space-y-6 text-sm">
              {loadingCardDetails ? (
                <div className="text-center py-12">
                  <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-xs text-slate-500 dark:text-darkSurface-muted">Carregando dados preenchidos...</p>
                </div>
              ) : !selectedCard.formData ? (
                <div className="text-center py-12 text-slate-400">
                  <FileText size={40} className="mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">Este formulário ainda não foi preenchido pelo cliente.</p>
                  <p className="text-xs mt-1">Envie o link público para o franqueado realizar o credenciamento.</p>
                  <button
                    onClick={(e) => copyFormLink(selectedCard.unique_token, e)}
                    className="mt-4 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs bg-brand-600 hover:bg-brand-700 text-white font-medium"
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
                        <span className="text-xs text-slate-400 block font-medium">#1. CNPJ</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.cnpj || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">#2. Razão Social</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.razao_social || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">#3. Responsável</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.responsavel || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">#4. Telefone</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.telefone || '—'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-xs text-slate-400 block font-medium">#5. Email da Unidade</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.email_unidade || '—'}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-xs text-slate-400 block font-medium">#6. Endereço</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.endereco || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">#7. CEP</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.cep || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">#8 e #9. Cidade / UF</span>
                        <span className="font-semibold text-slate-800 dark:text-white">
                          {selectedCard.formData.cidade || '—'} / {selectedCard.formData.uf || '—'}
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
                        <span className="text-xs text-slate-400 block font-medium">#10. Número Lógico</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.numero_logico_adquirente || '—'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">#11. Quantidade de PDVs</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.qtd_pdvs_tef || '0'}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-400 block font-medium">#12. Quantidade de TOTEMs</span>
                        <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.qtd_totems_tef || '0'}</span>
                      </div>
                      <div className="sm:col-span-3 pt-2 border-t border-slate-200/60 dark:border-darkSurface-border/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-slate-400 block font-medium">#13. Foto da Maquininha</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                            {selectedCard.formData.foto_maquininha_ok ? '✓ Marcada como OK' : 'Não confirmada'}
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
                        Loja optou por <strong>Não se aplica (N/A)</strong> para recebimento com Pix.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 dark:bg-darkSurface-bg/60 p-4 rounded-xl border border-slate-200 dark:border-darkSurface-border">
                        <div>
                          <span className="text-xs text-slate-400 block font-medium">#14. Identificação do PSP (Banco)</span>
                          <span className="font-semibold text-slate-800 dark:text-white">{selectedCard.formData.pix_psp_banco || '—'}</span>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400 block font-medium">#15. Integração FISERV no Banco</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                            {selectedCard.formData.pix_vinculacao_fiserv_ok ? '✓ Vinculada e Confirmada' : 'Pendente'}
                          </span>
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-xs text-slate-400 block font-medium">#16. Chave Pix Utilizada</span>
                          <span className="font-mono font-semibold text-slate-800 dark:text-white">{selectedCard.formData.pix_chave || '—'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer do Modal */}
            <div className="p-4 border-t border-slate-100 dark:border-darkSurface-border flex flex-wrap items-center justify-between gap-2 bg-slate-50 dark:bg-darkSurface-bg/50 rounded-b-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={(e) => copyFormLink(selectedCard.unique_token, e)}
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
                onClick={() => setSelectedCard(null)}
                className="px-4 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 dark:bg-darkSurface-cardHover dark:hover:bg-slate-700 text-slate-800 dark:text-white font-medium rounded-lg transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Card */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-darkSurface-card rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-darkSurface-border">
            <h3 className="text-lg font-bold font-heading text-slate-900 dark:text-white mb-2">
              Criar Novo Card de Onboarding
            </h3>
            <p className="text-xs text-slate-500 dark:text-darkSurface-muted mb-4">
              Informe a identificação da loja (ex: "São José do Rio Preto 05"). O link público será gerado automaticamente.
            </p>

            <form onSubmit={handleCreateCard}>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Ex: Ribeirão Preto Sul 02"
                required
                autoFocus
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm mb-4"
              />

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
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
        </div>
      )}
    </div>
  );
}
