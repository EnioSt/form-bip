/**
 * Validação do formulário público NO SERVIDOR (espelha as regras do front).
 * O front pode ser burlado; esta é a validação que vale.
 * - z.object descarta qualquer campo desconhecido (impede gravar card_id, id, etc.)
 * - Todo texto tem tamanho máximo
 */
const { z } = require("zod");

const UF_CODES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
  "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

const onlyDigits = (value) => value.replace(/\D/g, "");

const text = (max) =>
  z.preprocess((v) => (v === null || v === undefined ? "" : String(v)), z.string().trim().max(max, `Máximo de ${max} caracteres`));

const requiredText = (message, max = 200) => text(max).refine((v) => v !== "", message);

const digits = (message, lengths, lengthMessage) =>
  requiredText(message, 30).refine((v) => lengths.includes(onlyDigits(v).length), lengthMessage);

const terminalCount = (message) =>
  requiredText(message, 4).refine((v) => /^\d+$/.test(v) && Number(v) <= 500, "Informe um número inteiro entre 0 e 500");

const bool = z.preprocess((v) => v === true || v === "true", z.boolean());

const publicFormSchema = z
  .object({
    // 1. Dados da Loja
    cnpj: digits("Informe o CNPJ", [14], "O CNPJ deve ter 14 dígitos"),
    razao_social: requiredText("Informe a razão social"),
    responsavel: requiredText("Informe o nome do responsável", 120),
    telefone: digits("Informe o telefone", [10, 11], "Telefone deve ter 10 ou 11 dígitos"),
    email_unidade: requiredText("Informe o e-mail da unidade", 160).pipe(z.email("E-mail inválido")),
    endereco: requiredText("Informe o endereço", 250),
    cep: digits("Informe o CEP", [8], "O CEP deve ter 8 dígitos"),
    cidade: requiredText("Informe a cidade", 120),
    uf: requiredText("Selecione o estado", 2).refine((v) => UF_CODES.includes(v.toUpperCase()), "UF inválida"),

    // 2. Dados do Adquirente
    adquirente_banco: requiredText("Selecione a adquirente", 80),
    adquirente_outro_nome: text(80),
    numero_logico_adquirente: requiredText("Informe o número lógico da adquirente", 60),
    qtd_pdvs_tef: terminalCount("Informe a quantidade de PDVs"),
    qtd_totems_tef: terminalCount("Informe a quantidade de TOTEMs"),
    foto_maquininha_ok: bool,

    // 3. Credenciamento Pix (opcional)
    pix_psp_banco: text(80),
    pix_vinculacao_fiserv_ok: bool,
    pix_chave: text(140),
    pix_nao_se_aplica: bool,
  })
  .transform((data) => ({ ...data, uf: data.uf.toUpperCase() }));

/** Valida o payload. Retorna { data } ou { error } com a primeira mensagem legível. */
const parsePublicForm = (payload) => {
  const result = publicFormSchema.safeParse(payload ?? {});
  if (result.success) return { data: result.data };

  const issue = result.error.issues[0];
  return { error: `${issue.path.join(".") || "formulário"}: ${issue.message}` };
};

module.exports = { parsePublicForm };
