import { getToken, notifySessionExpired } from "./session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * Requisição padrão à API.
 * - Envia o token JWT quando houver sessão
 * - 401 em rota privada → avisa o AuthProvider para deslogar
 * - Erros viram Error com a mensagem do servidor (ou a mensagem padrão informada)
 */
const request = async (path, { method = "GET", body, formData, fallbackError = "Falha na comunicação com o servidor" } = {}) => {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: formData ?? (body !== undefined ? JSON.stringify(body) : undefined),
      cache: "no-store",
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Verifique sua conexão.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && token && !path.startsWith("/auth/login")) notifySessionExpired();
    throw new Error(data.error || fallbackError);
  }
  return data;
};

/**
 * Cache da lista de cards: a atualização automática pergunta primeiro a "versão" (resposta minúscula)
 * e só baixa a lista inteira quando algo mudou. Economiza tráfego no Supabase gratuito.
 * A cada 30 min a lista é baixada mesmo assim, para renovar os links temporários das fotos.
 */
const CARDS_CACHE_MAX_AGE_MS = 30 * 60 * 1000;
let cardsCache = null; // { version, cards, at }

const getCardsCached = async () => {
  const { version } = await request("/cards/version", { fallbackError: "Falha ao buscar cards" });
  const isFresh = cardsCache && Date.now() - cardsCache.at < CARDS_CACHE_MAX_AGE_MS;
  if (isFresh && cardsCache.version === version) return cardsCache.cards;

  const cards = await request("/cards", { fallbackError: "Falha ao buscar cards" });
  cardsCache = { version, cards, at: Date.now() };
  return cards;
};

export const api = {
  // Auth
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password }, fallbackError: "Falha ao autenticar" }),

  getMe: () => request("/auth/me", { fallbackError: "Sessão inválida" }),

  // Users
  getUsers: () => request("/users", { fallbackError: "Falha ao listar usuários" }),

  createUser: (userData) =>
    request("/users", { method: "POST", body: userData, fallbackError: "Falha ao criar usuário" }),

  updateUserRole: (id, role) =>
    request(`/users/${id}/role`, { method: "PUT", body: { role }, fallbackError: "Falha ao atualizar função do usuário" }),

  toggleUserActive: (id) =>
    request(`/users/${id}/toggle-active`, { method: "PUT", fallbackError: "Falha ao alterar status do usuário" }),

  /** passwordData: { newPassword, currentPassword? } (o servidor identifica quem pede pelo token) */
  updateUserPassword: (id, passwordData) =>
    request(`/users/${id}/password`, { method: "PUT", body: passwordData, fallbackError: "Falha ao alterar senha" }),

  deleteUser: (id) => request(`/users/${id}`, { method: "DELETE", fallbackError: "Falha ao excluir usuário" }),

  // Cards
  getCards: getCardsCached,

  getCardDetails: (id) => request(`/cards/${id}`, { fallbackError: "Falha ao buscar detalhes do card" }),

  createCard: (title) => request("/cards", { method: "POST", body: { title }, fallbackError: "Falha ao criar card" }),

  updateCardStatus: (id, status, scheduled_date) =>
    request(`/cards/${id}/status`, { method: "PUT", body: { status, scheduled_date }, fallbackError: "Falha ao atualizar status" }),

  assumeCard: (id, operator_id) =>
    request(`/cards/${id}/assume`, { method: "PUT", body: { operator_id }, fallbackError: "Falha ao assumir card" }),

  updateCardSchedule: (id, scheduled_date) =>
    request(`/cards/${id}/schedule`, { method: "PUT", body: { scheduled_date }, fallbackError: "Falha ao atualizar data prevista" }),

  reopenCard: (id) => request(`/cards/${id}/reopen`, { method: "PUT", fallbackError: "Falha ao reabrir formulário" }),

  toggleCardActive: (id) =>
    request(`/cards/${id}/toggle-active`, { method: "PUT", fallbackError: "Falha ao alternar status da loja" }),

  deleteCard: (id) => request(`/cards/${id}`, { method: "DELETE", fallbackError: "Falha ao excluir card" }),

  /** O autor da observação é o usuário logado (definido pelo servidor). */
  addCardNote: (cardId, text) =>
    request(`/cards/${cardId}/notes`, { method: "POST", body: { text }, fallbackError: "Falha ao salvar observação" }),

  deleteCardNote: (cardId, noteId) =>
    request(`/cards/${cardId}/notes/${noteId}`, { method: "DELETE", fallbackError: "Falha ao excluir observação" }),

  // Formulário público (sem login: acesso pelo token do link)
  getFormByToken: (token) => request(`/form/${encodeURIComponent(token)}`, { fallbackError: "Link inválido" }),

  submitForm: (token, formData) =>
    request(`/form/${encodeURIComponent(token)}`, { method: "POST", body: formData, fallbackError: "Falha ao enviar formulário" }),

  uploadFormPhoto: (token, file) => {
    const data = new FormData();
    data.append("photo", file);
    return request(`/form/${encodeURIComponent(token)}/photo`, {
      method: "POST",
      formData: data,
      fallbackError: "Erro ao fazer upload da imagem",
    });
  },

  // Adquirentes
  getAcquirers: () => request("/acquirers", { fallbackError: "Falha ao buscar adquirentes" }),

  addAcquirer: (name) =>
    request("/acquirers", { method: "POST", body: { name }, fallbackError: "Falha ao adicionar adquirente" }),
};
