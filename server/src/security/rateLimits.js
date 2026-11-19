/**
 * Limites de requisições por IP (proteção contra força bruta e abuso dos endpoints públicos).
 */
const rateLimit = require("express-rate-limit");

const build = (windowMinutes, limit, message) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: message },
  });

module.exports = {
  // Login: 10 tentativas a cada 15 min (só as que falham contam)
  loginLimiter: rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: "Muitas tentativas de login. Aguarde 15 minutos e tente novamente." },
  }),

  // Formulário público: leitura/envio
  publicFormLimiter: build(15, 120, "Muitas requisições. Aguarde alguns minutos e tente novamente."),

  // Upload de foto pelo formulário público
  uploadLimiter: build(15, 15, "Limite de envios de foto atingido. Aguarde alguns minutos."),

  // API interna (usuários logados), folgado por causa da atualização automática do Kanban
  apiLimiter: build(15, 1500, "Muitas requisições. Aguarde alguns minutos."),
};
