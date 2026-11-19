const express = require("express");
const db = require("../db");
const { verifyPassword, signToken, requireAuth } = require("../security/auth");
const { loginLimiter } = require("../security/rateLimits");

const router = express.Router();

const INVALID_CREDENTIALS = "E-mail ou senha inválidos";

router.post("/login", loginLimiter, async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase().slice(0, 160);
  const password = String(req.body?.password ?? "").slice(0, 200);

  const user = email ? await db.findUserByEmail(email) : null;

  // Sempre compara (mesmo sem usuário) para o tempo de resposta não revelar e-mails cadastrados
  const passwordOk = await verifyPassword(password, user?.password_hash);
  if (!user || !passwordOk) {
    return res.status(401).json({ error: INVALID_CREDENTIALS });
  }

  if (!user.is_active) {
    return res.status(403).json({ error: "Usuário inativo. Entre em contato com o administrador do sistema." });
  }

  res.json({ user: db.toSafeUser(user), token: signToken(user) });
});

// Valida a sessão atual e devolve o usuário atualizado (usado ao abrir o sistema)
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
