import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { api } from '../services/api';
import logoBip360 from '../assets/images/logo-bip360.png';
import { 
  Building2, 
  CreditCard, 
  QrCode, 
  UploadCloud, 
  CheckCircle, 
  CheckCircle2,
  AlertTriangle,
  Lock,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';

export default function PublicForm() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [card, setCard] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { isSubmitting }
  } = useForm({
    defaultValues: {
      cnpj: '',
      razao_social: '',
      responsavel: '',
      telefone: '',
      email_unidade: '',
      endereco: '',
      cep: '',
      cidade: '',
      uf: '',
      numero_logico_adquirente: '',
      qtd_pdvs_tef: '1',
      qtd_totems_tef: '0',
      foto_maquininha_ok: false,
      photo_url: '',
      pix_psp_banco: '',
      pix_vinculacao_fiserv_ok: false,
      pix_chave: '',
      pix_nao_se_aplica: false
    }
  });

  const formValues = watch();

  useEffect(() => {
    async function loadForm() {
      try {
        const data = await api.getFormByToken(token);
        setCard(data.card);

        if (data.formData) {
          reset({
            cnpj: data.formData.cnpj || '',
            razao_social: data.formData.razao_social || '',
            responsavel: data.formData.responsavel || data.formData.contato_nome || '',
            telefone: data.formData.telefone || data.formData.contato_telefone || '',
            email_unidade: data.formData.email_unidade || data.formData.contato_email || '',
            endereco: data.formData.endereco || '',
            cep: data.formData.cep || '',
            cidade: data.formData.cidade || '',
            uf: data.formData.uf || '',
            numero_logico_adquirente: data.formData.numero_logico_adquirente || '',
            qtd_pdvs_tef: data.formData.qtd_pdvs_tef || data.formData.sitef_quantidade_terminais || '1',
            qtd_totems_tef: data.formData.qtd_totems_tef || '0',
            foto_maquininha_ok: !!data.formData.foto_maquininha_ok,
            photo_url: data.formData.photo_url || '',
            pix_psp_banco: data.formData.pix_psp_banco || data.formData.pix_banco || '',
            pix_vinculacao_fiserv_ok: !!data.formData.pix_vinculacao_fiserv_ok,
            pix_chave: data.formData.pix_chave || '',
            pix_nao_se_aplica: !!data.formData.pix_nao_se_aplica
          });
          if (data.formData.photo_url) {
            setPreviewPhoto(data.formData.photo_url);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadForm();
  }, [token, reset]);

  // Cálculo de Progresso automático e status baseado na planilha SiTef
  const progressData = useMemo(() => {
    const isFilled = (val) => val !== undefined && val !== null && String(val).trim() !== '';

    // Seção 1: Dados da Loja (9 campos)
    const s1 = [
      { id: 1, name: 'CNPJ', ok: isFilled(formValues.cnpj) },
      { id: 2, name: 'Razão Social', ok: isFilled(formValues.razao_social) },
      { id: 3, name: 'Responsável', ok: isFilled(formValues.responsavel) },
      { id: 4, name: 'Telefone', ok: isFilled(formValues.telefone) },
      { id: 5, name: 'Email da Unidade', ok: isFilled(formValues.email_unidade) },
      { id: 6, name: 'Endereço', ok: isFilled(formValues.endereco) },
      { id: 7, name: 'CEP', ok: isFilled(formValues.cep) },
      { id: 8, name: 'Cidade', ok: isFilled(formValues.cidade) },
      { id: 9, name: 'UF', ok: isFilled(formValues.uf) }
    ];

    // Seção 2: Dados do Adquirente (4 campos)
    const s2 = [
      { id: 10, name: 'Número Lógico da Adquirente', ok: isFilled(formValues.numero_logico_adquirente) },
      { id: 11, name: 'Quantidade de PDVs com TEF', ok: isFilled(formValues.qtd_pdvs_tef) },
      { id: 12, name: 'Quantidade de TOTEMs com TEF', ok: isFilled(formValues.qtd_totems_tef) },
      { id: 13, name: 'Foto da maquininha', ok: !!formValues.foto_maquininha_ok || isFilled(formValues.photo_url) }
    ];

    // Seção 3: Credenciamento Pix (3 campos ou N/A)
    const pixNA = !!formValues.pix_nao_se_aplica;
    const s3 = [
      { id: 14, name: 'Identificação do PSP (Banco)', ok: pixNA || isFilled(formValues.pix_psp_banco), na: pixNA },
      { id: 15, name: 'Vinculação com integração FISERV no Banco', ok: pixNA || !!formValues.pix_vinculacao_fiserv_ok, na: pixNA },
      { id: 16, name: 'Chave Pix que será utilizada', ok: pixNA || isFilled(formValues.pix_chave), na: pixNA }
    ];

    const allItems = [...s1, ...s2, ...(pixNA ? [] : s3)];
    const completedItems = allItems.filter(item => item.ok);
    const totalCount = allItems.length;
    const percentage = Math.round((completedItems.length / (totalCount || 1)) * 100);

    return {
      percentage,
      completedCount: completedItems.length,
      totalCount,
      s1Status: s1.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.ok }), {}),
      s2Status: s2.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.ok }), {}),
      s3Status: s3.reduce((acc, cur) => ({ ...acc, [cur.id]: cur.ok }), {})
    };
  }, [formValues]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Selecione apenas arquivos de imagem (.png, .jpg, .jpeg)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB');
      return;
    }

    setUploading(true);
    try {
      const res = await api.uploadPhoto(file);
      setValue('photo_url', res.photo_url);
      setValue('foto_maquininha_ok', true);
      setPreviewPhoto(res.photo_url);
    } catch (err) {
      alert('Falha ao processar upload da foto');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values) => {
    try {
      await api.submitForm(token, values);
      setSubmitted(true);
    } catch (err) {
      alert(err.message || 'Erro ao enviar dados do formulário');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-darkSurface-bg flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-500 dark:text-darkSurface-muted font-medium">Carregando formulário SiTEF...</p>
        </div>
      </div>
    );
  }

  if (error || !card) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-darkSurface-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-darkSurface-card p-8 rounded-2xl border border-slate-200 dark:border-darkSurface-border text-center shadow-lg">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={28} />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white mb-2">
            Link Não Disponível
          </h2>
          <p className="text-sm text-slate-500 dark:text-darkSurface-muted">
            {error || 'Este formulário não foi encontrado ou expirou.'}
          </p>
        </div>
      </div>
    );
  }

  if (!card.is_form_open && !submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-darkSurface-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-darkSurface-card p-8 rounded-2xl border border-slate-200 dark:border-darkSurface-border text-center shadow-lg">
          <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={28} />
          </div>
          <h2 className="text-xl font-bold font-heading text-slate-800 dark:text-white mb-2">
            Formulário Finalizado
          </h2>
          <p className="text-sm text-slate-500 dark:text-darkSurface-muted mb-2">
            Os dados para ativação de <strong className="text-slate-700 dark:text-slate-300">{card.title}</strong> já foram recebidos com sucesso.
          </p>
          <p className="text-xs text-slate-400">
            Se precisar fazer qualquer alteração cadastral ou técnica, solicite a reabertura à equipe BIP360.
          </p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-darkSurface-bg flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-darkSurface-card p-8 rounded-2xl border border-slate-200 dark:border-darkSurface-border text-center shadow-lg">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-800 dark:text-white mb-2">
            Formulário Enviado com Sucesso!
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
            Os dados de credenciamento TEF / Pix para a loja <strong>{card.title}</strong> foram salvos e enviados para a fila do SiTef.
          </p>
          <div className="p-3 bg-slate-50 dark:bg-darkSurface-bg rounded-lg text-xs text-slate-500 border border-slate-200 dark:border-darkSurface-border">
            Status do Ticket: <strong>Preenchido</strong>
          </div>
        </div>
      </div>
    );
  }

  const renderStatusBadge = (isOk, isNA = false) => {
    if (isNA) {
      return (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500 dark:bg-darkSurface-cardHover dark:text-slate-400 border border-slate-200 dark:border-darkSurface-border">
          N/A
        </span>
      );
    }
    if (isOk) {
      return (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 flex items-center gap-1">
          <CheckCircle2 size={12} />
          OK
        </span>
      );
    }
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 flex items-center gap-1">
        <Clock size={12} />
        Pendente
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-darkSurface-bg text-slate-800 dark:text-darkSurface-text py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Banner Superior SiTEF BIP360 */}
        <div className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-darkSurface-border">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-darkSurface-border">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <img 
                  src={logoBip360} 
                  alt="BIP360 Sistemas" 
                  className="h-8 w-auto object-contain" 
                />
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-900/40">
                  ATIVAÇÃO SITEF
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white mt-2">
                Formulário de credenciamento TEF / Pix para ativação da loja no SiTef
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-darkSurface-muted mt-1">
                Loja / Unidade: <strong className="text-slate-700 dark:text-slate-300">{card.title}</strong>
              </p>
            </div>

            {/* Progresso do Preenchimento */}
            <div className="bg-slate-50 dark:bg-darkSurface-bg p-4 rounded-xl border border-slate-200 dark:border-darkSurface-border min-w-[210px]">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                <span>Progresso do preenchimento</span>
                <span className="text-brand-600 dark:text-brand-400 font-bold">{progressData.percentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-darkSurface-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-brand-600 to-emerald-500 transition-all duration-300"
                  style={{ width: `${progressData.percentage}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 text-right font-medium">
                {progressData.completedCount} de {progressData.totalCount} itens preenchidos
              </div>
            </div>
          </div>

          {/* Guia de Preenchimento */}
          <div className="mt-4 p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
            <Info size={18} className="shrink-0 text-amber-600 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Como preencher este formulário:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800 dark:text-amber-400">
                <li>Preencha os campos com os dados oficiais da loja. O status muda automaticamente para <strong>OK</strong> ao preencher.</li>
                <li>As orientações e exemplos abaixo dos campos servem como referência de formato.</li>
                <li>Caso a loja não vá operar com Pix, selecione a opção <em>"Não se aplica (N/A)"</em> na seção 3 para não contar no progresso.</li>
              </ul>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* 1. DADOS DA LOJA */}
          <section className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-darkSurface-border">
            <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-slate-100 dark:border-darkSurface-border">
              <Building2 className="text-brand-500" size={20} />
              <h2 className="font-black text-base uppercase tracking-wide font-heading text-slate-900 dark:text-white">
                1. DADOS DA LOJA
              </h2>
            </div>

            <div className="space-y-4">
              {/* Campo 1: CNPJ */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-white">
                    #1. CNPJ *
                  </label>
                  {renderStatusBadge(progressData.s1Status[1])}
                </div>
                <input
                  type="text"
                  required
                  {...register('cnpj')}
                  placeholder="12.345.678/0001-90"
                  className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: 12.345.678/0001-90</span>
              </div>

              {/* Campo 2: Razão Social */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-white">
                    #2. Razão Social *
                  </label>
                  {renderStatusBadge(progressData.s1Status[2])}
                </div>
                <input
                  type="text"
                  required
                  {...register('razao_social')}
                  placeholder="Exemplo Comércio de Alimentos Ltda"
                  className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: Exemplo Comércio de Alimentos Ltda</span>
              </div>

              {/* Grid 3 e 4: Responsável e Telefone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #3. Responsável *
                    </label>
                    {renderStatusBadge(progressData.s1Status[3])}
                  </div>
                  <input
                    type="text"
                    required
                    {...register('responsavel')}
                    placeholder="Maria Souza"
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: Maria Souza</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #4. Telefone *
                    </label>
                    {renderStatusBadge(progressData.s1Status[4])}
                  </div>
                  <input
                    type="text"
                    required
                    {...register('telefone')}
                    placeholder="(17) 99999-0000"
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: (17) 99999-0000</span>
                </div>
              </div>

              {/* Campo 5: Email da Unidade */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-white">
                    #5. Email da Unidade *
                  </label>
                  {renderStatusBadge(progressData.s1Status[5])}
                </div>
                <input
                  type="email"
                  required
                  {...register('email_unidade')}
                  placeholder="loja1@chiquinho.com.br"
                  className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: loja1@chiquinho.com.br</span>
              </div>

              {/* Campo 6: Endereço */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-white">
                    #6. Endereço *
                  </label>
                  {renderStatusBadge(progressData.s1Status[6])}
                </div>
                <input
                  type="text"
                  required
                  {...register('endereco')}
                  placeholder="Rua das Flores, 123 - Centro"
                  className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: "Rua das Flores, 123 - Centro"</span>
              </div>

              {/* Grid 7, 8, 9: CEP, Cidade e UF */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #7. CEP *
                    </label>
                    {renderStatusBadge(progressData.s1Status[7])}
                  </div>
                  <input
                    type="text"
                    required
                    {...register('cep')}
                    placeholder="15000-000"
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo: 15000-000</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #8. Cidade *
                    </label>
                    {renderStatusBadge(progressData.s1Status[8])}
                  </div>
                  <input
                    type="text"
                    required
                    {...register('cidade')}
                    placeholder="São José do Rio Preto"
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo: São José do Rio Preto</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #9. UF *
                    </label>
                    {renderStatusBadge(progressData.s1Status[9])}
                  </div>
                  <input
                    type="text"
                    maxLength={2}
                    required
                    {...register('uf')}
                    placeholder="SP"
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500 uppercase"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo: SP</span>
                </div>
              </div>
            </div>
          </section>

          {/* 2. DADOS DO ADQUIRENTE */}
          <section className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-darkSurface-border">
            <div className="pb-4 mb-5 border-b border-slate-100 dark:border-darkSurface-border">
              <div className="flex items-center space-x-2">
                <CreditCard className="text-brand-500" size={20} />
                <h2 className="font-black text-base uppercase tracking-wide font-heading text-slate-900 dark:text-white">
                  2. DADOS DO ADQUIRENTE
                </h2>
              </div>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1 flex items-center gap-1">
                <Info size={14} /> ⓘ Solicitar ao adquirente (exemplo: REDE)
              </p>
            </div>

            <div className="space-y-4">
              {/* Campo 10: Número Lógico */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="text-xs font-bold text-slate-800 dark:text-white">
                    #10. Número Lógico da Adquirente *
                  </label>
                  {renderStatusBadge(progressData.s2Status[10])}
                </div>
                <input
                  type="text"
                  required
                  {...register('numero_logico_adquirente')}
                  placeholder="Ex: 12345678"
                  className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: Informado pela adquirente</span>
              </div>

              {/* Grid 11 e 12: PDVs e TOTEMs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #11. Quantidade de PDVs com TEF (terminais) *
                    </label>
                    {renderStatusBadge(progressData.s2Status[11])}
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    {...register('qtd_pdvs_tef')}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: 1</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #12. Quantidade de TOTEMs com TEF (terminais) *
                    </label>
                    {renderStatusBadge(progressData.s2Status[12])}
                  </div>
                  <input
                    type="number"
                    min="0"
                    required
                    {...register('qtd_totems_tef')}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: 0</span>
                </div>
              </div>

              {/* Campo 13: Foto da Maquininha */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold text-slate-800 dark:text-white">
                    #13. Foto da maquininha para registro no chamado *
                  </label>
                  {renderStatusBadge(progressData.s2Status[13])}
                </div>
                <p className="text-xs text-slate-500 dark:text-darkSurface-muted mb-3">
                  Exemplo / orientação: Enviar a foto no chamado e marcar como OK
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <label className="flex-1 w-full border-2 border-dashed border-slate-300 dark:border-darkSurface-border hover:border-brand-500 rounded-xl p-4 text-center cursor-pointer transition bg-white dark:bg-darkSurface-card">
                    <UploadCloud size={24} className="mx-auto text-slate-400 mb-1" />
                    <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 block">
                      {uploading ? 'Enviando imagem...' : 'Fazer upload da foto da maquininha'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">PNG, JPG até 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>

                  {previewPhoto && (
                    <div className="p-3 border border-emerald-200 dark:border-emerald-900/60 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
                      <span className="text-[11px] text-emerald-600 font-bold flex items-center justify-center gap-1 mb-1">
                        <CheckCircle2 size={13} /> Foto Registrada
                      </span>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">{previewPhoto}</div>
                    </div>
                  )}
                </div>

                {/* Checkbox opcional de confirmação se foto anexada */}
                <div className="mt-3">
                  <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      {...register('foto_maquininha_ok')}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                    />
                    <span>Marcar foto da maquininha como <strong>OK</strong></span>
                  </label>
                </div>
              </div>
            </div>
          </section>

          {/* 3. CREDENCIAMENTO PIX */}
          <section className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-darkSurface-border">
            <div className="pb-4 mb-5 border-b border-slate-100 dark:border-darkSurface-border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <QrCode className="text-brand-500" size={20} />
                  <h2 className="font-black text-base uppercase tracking-wide font-heading text-slate-900 dark:text-white">
                    3. CREDENCIAMENTO PIX
                  </h2>
                </div>

                {/* Opção N/A caso a loja não opere com Pix */}
                <label className="flex items-center space-x-2 cursor-pointer bg-slate-100 dark:bg-darkSurface-cardHover px-3 py-1.5 rounded-lg border border-slate-200 dark:border-darkSurface-border text-xs font-semibold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    {...register('pix_nao_se_aplica')}
                    className="w-4 h-4 rounded text-slate-600 border-slate-300"
                  />
                  <span>Não se aplica (N/A)</span>
                </label>
              </div>
              <p className="text-xs text-brand-600 dark:text-brand-400 font-medium mt-1 flex items-center gap-1">
                <Info size={14} /> ⓘ Caso deseje operar com Pix, a chave Pix precisa ser habilitada para uso no TEF
              </p>
            </div>

            {formValues.pix_nao_se_aplica ? (
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-dashed border-slate-300 dark:border-darkSurface-border text-center text-xs text-slate-500">
                Seção marcada como <strong>Não se aplica (N/A)</strong> para esta loja. Não contabilizada no progresso.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Campo 14: Identificação do PSP (Banco) */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #14. Identificação do PSP (Banco) *
                    </label>
                    {renderStatusBadge(progressData.s3Status[14])}
                  </div>
                  <input
                    type="text"
                    {...register('pix_psp_banco')}
                    placeholder="Ex: Itaú, Bradesco, Santander, Banco do Brasil..."
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: Banco do cliente onde está a chave Pix</span>
                </div>

                {/* Campo 15: Vinculação com FISERV */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #15. Vinculação com a integração FISERV no Banco *
                    </label>
                    {renderStatusBadge(progressData.s3Status[15])}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-darkSurface-muted mb-2">
                    Exemplo / orientação: Realizar no banco e marcar como OK quando concluído
                  </p>
                  <label className="flex items-center space-x-2 cursor-pointer bg-white dark:bg-darkSurface-card p-2.5 rounded-lg border border-slate-200 dark:border-darkSurface-border text-xs text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      {...register('pix_vinculacao_fiserv_ok')}
                      className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
                    />
                    <span className="font-semibold">Vinculação com FISERV realizada no internet banking / app do banco</span>
                  </label>
                </div>

                {/* Campo 16: Chave Pix */}
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="text-xs font-bold text-slate-800 dark:text-white">
                      #16. Chave Pix que será utilizada na operação *
                    </label>
                    {renderStatusBadge(progressData.s3Status[16])}
                  </div>
                  <input
                    type="text"
                    {...register('pix_chave')}
                    placeholder="CNPJ, e-mail, telefone ou chave aleatória"
                    className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[11px] text-slate-400 block mt-1">Exemplo / orientação: "CNPJ, e-mail, telefone ou chave aleatória"</span>
                </div>
              </div>
            )}
          </section>

          {/* Envio do Formulário */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl shadow-lg shadow-brand-600/25 flex items-center justify-center space-x-2 transition text-base disabled:opacity-50"
            >
              <CheckCircle size={20} />
              <span>{isSubmitting ? 'Gravando e Ativando SiTef...' : 'Salvar e Finalizar Formulário SiTef'}</span>
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Ao concluir, os dados serão validados e o card passará para o status "Preenchido" no painel operacional.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
