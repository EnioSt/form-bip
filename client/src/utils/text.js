/**
 * Normaliza texto para comparação: remove acentos, converte para minúsculas e apara espaços.
 */
export const normalizeText = (text) => {
  if (!text) return "";
  return text
    .toString()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
};
