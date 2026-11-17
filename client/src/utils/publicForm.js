/**
 * Funções puras do formulário público de credenciamento SiTEF.
 */

export const DEFAULT_ACQUIRERS = [
  "Bin",
  "Cielo",
  "Getnet",
  "PagSeguro (PagBank)",
  "Rede",
  "Sicredi",
  "Sipag (Sicoob)",
  "Stone",
];

const OTHER = "Outro";

const isFilled = (val) => val !== undefined && val !== null && String(val).trim() !== "";

const toStatusMap = (items) => Object.fromEntries(items.map((item) => [item.id, item.ok]));

/**
 * Converte os dados salvos (API) para os valores do formulário.
 * Adquirentes fora da lista conhecida viram "Outro" + nome digitado.
 */
export const mapFormDataToValues = (formData, knownAcquirers) => {
  const rawAdquirente = formData.adquirente_banco || "";
  const isKnown = knownAcquirers.includes(rawAdquirente);
  const isCustom = rawAdquirente && !isKnown;

  return {
    cnpj: formData.cnpj || "",
    razao_social: formData.razao_social || "",
    responsavel: formData.responsavel || formData.contato_nome || "",
    telefone: formData.telefone || formData.contato_telefone || "",
    email_unidade: formData.email_unidade || formData.contato_email || "",
    endereco: formData.endereco || "",
    cep: formData.cep || "",
    cidade: formData.cidade || "",
    uf: formData.uf || "",
    adquirente_banco: isCustom ? OTHER : rawAdquirente,
    adquirente_outro_nome: isCustom ? rawAdquirente : formData.adquirente_outro_nome || "",
    numero_logico_adquirente: formData.numero_logico_adquirente || "",
    qtd_pdvs_tef: formData.qtd_pdvs_tef || formData.sitef_quantidade_terminais || "1",
    qtd_totems_tef: formData.qtd_totems_tef || "0",
    foto_maquininha_ok: !!formData.foto_maquininha_ok,
    photo_url: formData.photo_url || "",
    pix_psp_banco: formData.pix_psp_banco || formData.pix_banco || "",
    pix_vinculacao_fiserv_ok: !!formData.pix_vinculacao_fiserv_ok,
    pix_chave: formData.pix_chave || "",
    pix_nao_se_aplica: !!formData.pix_nao_se_aplica,
  };
};

/** Monta o payload de envio: "Outro" é substituído pelo nome digitado. */
export const buildSubmitPayload = (values) => ({
  ...values,
  adquirente_banco: values.adquirente_banco === OTHER ? values.adquirente_outro_nome : values.adquirente_banco,
});

/**
 * Progresso de preenchimento e status (OK/Pendente) de cada item, conforme a planilha SiTef.
 * A seção Pix sai da conta quando marcada como "Não se aplica".
 */
export const computeFormProgress = (values) => {
  // Seção 1: Dados da Loja (9 campos)
  const s1 = [
    { id: 1, ok: isFilled(values.cnpj) },
    { id: 2, ok: isFilled(values.razao_social) },
    { id: 3, ok: isFilled(values.responsavel) },
    { id: 4, ok: isFilled(values.telefone) },
    { id: 5, ok: isFilled(values.email_unidade) },
    { id: 6, ok: isFilled(values.endereco) },
    { id: 7, ok: isFilled(values.cep) },
    { id: 8, ok: isFilled(values.cidade) },
    { id: 9, ok: isFilled(values.uf) },
  ];

  // Seção 2: Dados do Adquirente (5 campos)
  const acquirerOk =
    values.adquirente_banco === OTHER ? isFilled(values.adquirente_outro_nome) : isFilled(values.adquirente_banco);

  const s2 = [
    { id: 10, ok: acquirerOk },
    { id: 11, ok: isFilled(values.numero_logico_adquirente) },
    { id: 12, ok: isFilled(values.qtd_pdvs_tef) },
    { id: 13, ok: isFilled(values.qtd_totems_tef) },
    { id: 14, ok: !!values.foto_maquininha_ok || isFilled(values.photo_url) },
  ];

  // Seção 3: Credenciamento Pix (3 campos ou N/A)
  const pixNA = !!values.pix_nao_se_aplica;
  const s3 = [
    { id: 15, ok: pixNA || isFilled(values.pix_psp_banco) },
    { id: 16, ok: pixNA || !!values.pix_vinculacao_fiserv_ok },
    { id: 17, ok: pixNA || isFilled(values.pix_chave) },
  ];

  const allItems = [...s1, ...s2, ...(pixNA ? [] : s3)];
  const completedCount = allItems.filter((item) => item.ok).length;
  const totalCount = allItems.length;

  return {
    percentage: Math.round((completedCount / (totalCount || 1)) * 100),
    completedCount,
    totalCount,
    s1Status: toStatusMap(s1),
    s2Status: toStatusMap(s2),
    s3Status: toStatusMap(s3),
  };
};

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

/** Valida o arquivo de foto. Retorna a mensagem de erro ou null. */
export const validatePhotoFile = (file) => {
  if (!file.type.startsWith("image/")) return "Selecione apenas arquivos de imagem (.png, .jpg, .jpeg)";
  if (file.size > MAX_PHOTO_SIZE) return "A imagem deve ter no máximo 5MB";
  return null;
};
