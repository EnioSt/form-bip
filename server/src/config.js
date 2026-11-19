/**
 * Configuração central do backend, lida das variáveis de ambiente (arquivo .env).
 * Em produção (NODE_ENV=production) as variáveis críticas são obrigatórias:
 * o servidor se recusa a subir sem elas, em vez de rodar inseguro.
 */
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

const DEV_JWT_SECRET = "dev-only-secret-troque-em-producao-0000000000";
const DEV_CORS_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

const parseList = (value) =>
  (value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const config = {
  isProduction,
  port: Number(process.env.PORT) || 3001,

  // JWT
  jwtSecret: process.env.JWT_SECRET || (isProduction ? null : DEV_JWT_SECRET),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",

  // CORS: domínios do front autorizados a chamar a API
  corsOrigins: parseList(process.env.CORS_ORIGINS).length
    ? parseList(process.env.CORS_ORIGINS)
    : isProduction
      ? []
      : DEV_CORS_ORIGINS,

  // Atrás de proxy/load balancer (Render, Railway, Nginx...) o IP real vem do proxy
  trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY : false,

  // Upload de foto da maquininha
  maxPhotoBytes: (Number(process.env.MAX_PHOTO_MB) || 2) * 1024 * 1024,

  // Supabase (banco + fotos). A chave secreta só existe no servidor: nunca vai para o front.
  // Aceita a URL com ou sem sufixo (ex.: ".../rest/v1/"): só a base do projeto interessa
  supabaseUrl: (process.env.SUPABASE_URL || "").replace(/\/(rest|auth|storage)\/v1\/?.*$/, "").replace(/\/+$/, ""),
  supabaseSecretKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  photoBucket: process.env.SUPABASE_PHOTO_BUCKET || "photos",
  // Validade dos links temporários das fotos (o Kanban busca a lista de novo antes disso)
  photoUrlTtlSeconds: 2 * 60 * 60,

  bcryptRounds: 12,
  minPasswordLength: 8,
};

const problems = [];
if (!config.jwtSecret) problems.push("JWT_SECRET é obrigatório em produção");
if (config.jwtSecret && config.jwtSecret.length < 32) problems.push("JWT_SECRET deve ter pelo menos 32 caracteres");
if (isProduction && config.corsOrigins.length === 0) problems.push("CORS_ORIGINS é obrigatório em produção");
if (!config.supabaseUrl || !config.supabaseSecretKey) problems.push("SUPABASE_URL e SUPABASE_SECRET_KEY são obrigatórios");
if (config.supabaseSecretKey.startsWith("sb_publishable_")) {
  problems.push("SUPABASE_SECRET_KEY recebeu a chave PÚBLICA (sb_publishable_). Use a Secret key do painel.");
}

if (problems.length) {
  console.error(`Configuração inválida:\n - ${problems.join("\n - ")}`);
  process.exit(1);
}

if (!isProduction && config.jwtSecret === DEV_JWT_SECRET) {
  console.warn("[config] usando JWT_SECRET de desenvolvimento. Defina JWT_SECRET no .env antes de publicar.");
}

module.exports = config;
