import { z } from "zod";

const onlyDigits = (value) => value.replace(/\D/g, "");

/** Converte valores vindos da API (número, null, undefined) para string. */
const asString = (schema) => z.preprocess((v) => (v === null || v === undefined ? "" : String(v)), schema);

const requiredText = (message) => asString(z.string().refine((v) => v.trim() !== "", message));

const requiredDigits = (requiredMessage, length, lengthMessage) =>
  requiredText(requiredMessage).refine((v) => length.includes(onlyDigits(v).length), lengthMessage);

const terminalCount = (message) =>
  requiredText(message).refine((v) => Number.isInteger(Number(v)) && Number(v) >= 0, "Informe um número inteiro maior ou igual a zero");

/**
 * Validação do formulário público de credenciamento TEF / Pix.
 * - Seções 1 e 2: campos obrigatórios (o adquirente "Outro" exige o nome digitado)
 * - Seção 3 (Pix): opcional, como no fluxo original — o progresso indica o que falta
 */
export const publicFormSchema = z
  .object({
    // 1. Dados da Loja
    cnpj: requiredDigits("Informe o CNPJ", [14], "O CNPJ deve ter 14 dígitos"),
    razao_social: requiredText("Informe a razão social"),
    responsavel: requiredText("Informe o nome do responsável"),
    telefone: requiredDigits("Informe o telefone", [10, 11], "Informe o telefone com DDD (10 ou 11 dígitos)"),
    email_unidade: asString(z.string().refine((v) => v.trim() !== "", "Informe o e-mail da unidade").pipe(z.email("E-mail inválido"))),
    endereco: requiredText("Informe o endereço"),
    cep: requiredDigits("Informe o CEP", [8], "O CEP deve ter 8 dígitos"),
    cidade: requiredText("Informe a cidade"),
    uf: requiredText("Informe a UF").refine((v) => /^[A-Za-z]{2}$/.test(v.trim()), "A UF deve ter 2 letras"),

    // 2. Dados do Adquirente
    adquirente_banco: requiredText("Selecione a adquirente"),
    adquirente_outro_nome: asString(z.string()),
    numero_logico_adquirente: requiredText("Informe o número lógico da adquirente"),
    qtd_pdvs_tef: terminalCount("Informe a quantidade de PDVs"),
    qtd_totems_tef: terminalCount("Informe a quantidade de TOTEMs"),
    foto_maquininha_ok: z.boolean(),
    photo_url: asString(z.string()),

    // 3. Credenciamento Pix
    pix_psp_banco: asString(z.string()),
    pix_vinculacao_fiserv_ok: z.boolean(),
    pix_chave: asString(z.string()),
    pix_nao_se_aplica: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.adquirente_banco === "Outro" && !data.adquirente_outro_nome.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["adquirente_outro_nome"],
        message: "Informe o nome do adquirente",
      });
    }
  });

export const publicFormDefaultValues = {
  cnpj: "",
  razao_social: "",
  responsavel: "",
  telefone: "",
  email_unidade: "",
  endereco: "",
  cep: "",
  cidade: "",
  uf: "",
  adquirente_banco: "",
  adquirente_outro_nome: "",
  numero_logico_adquirente: "",
  qtd_pdvs_tef: "1",
  qtd_totems_tef: "0",
  foto_maquininha_ok: false,
  photo_url: "",
  pix_psp_banco: "",
  pix_vinculacao_fiserv_ok: false,
  pix_chave: "",
  pix_nao_se_aplica: false,
};
