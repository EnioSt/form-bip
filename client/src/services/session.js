/**
 * Sessão do usuário logado (token JWT + dados do usuário) no navegador.
 * Quando a API responde 401 (token expirado/inválido ou usuário inativado),
 * o evento SESSION_EXPIRED_EVENT avisa o AuthProvider para deslogar.
 */
const TOKEN_KEY = "bip360_token";
const USER_KEY = "bip360_user";

export const SESSION_EXPIRED_EVENT = "bip360:session-expired";

const safeRead = (key) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const getToken = () => safeRead(TOKEN_KEY);

export const getStoredUser = () => {
  const raw = safeRead(USER_KEY);
  if (!raw || !getToken()) return null; // sessão antiga (sem token) é descartada
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const saveSession = (user, token) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
};

export const clearSession = () => {
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(TOKEN_KEY);
};

export const notifySessionExpired = () => {
  window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
};
