/**
 * Autenticação: hash de senha (bcrypt), emissão/validação de JWT e middlewares de acesso.
 */
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("../config");
const db = require("../db");

const isBcryptHash = (value) => typeof value === "string" && /^\$2[aby]\$\d{2}\$/.test(value);

const hashPassword = (plain) => bcrypt.hash(plain, config.bcryptRounds);

// Hash fixo usado quando o e-mail não existe: o tempo de resposta fica igual
// e não dá para descobrir quais e-mails estão cadastrados medindo a demora
const DUMMY_HASH = bcrypt.hashSync("dummy-password-for-timing", config.bcryptRounds);

const verifyPassword = (plain, hash) => bcrypt.compare(String(plain ?? ""), isBcryptHash(hash) ? hash : DUMMY_HASH);

const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
    algorithm: "HS256",
  });

/**
 * Exige um JWT válido. O usuário é recarregado do banco a cada requisição:
 * se foi inativado, excluído ou mudou de função, isso vale na hora (não espera o token expirar).
 */
const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Sessão não encontrada. Faça login novamente." });
  }

  let payload;
  try {
    payload = jwt.verify(token, config.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    return res.status(401).json({ error: "Sessão expirada ou inválida. Faça login novamente." });
  }

  const user = typeof payload.sub === "string" ? await db.findUserById(payload.sub) : null;
  if (!user || !user.is_active) {
    return res.status(401).json({ error: "Usuário inativo ou removido. Faça login novamente." });
  }

  req.user = db.toSafeUser(user);
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Apenas administradores podem realizar esta ação." });
  }
  next();
};

module.exports = { isBcryptHash, hashPassword, verifyPassword, signToken, requireAuth, requireAdmin };
