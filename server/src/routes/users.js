const express = require("express");
const crypto = require("crypto");
const config = require("../config");
const db = require("../db");
const { hashPassword, verifyPassword, requireAdmin } = require("../security/auth");

const router = express.Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RULE = `A senha deve ter no mínimo ${config.minPasswordLength} caracteres.`;

// O usuário Suporte BIP360 é protegido: não pode ser rebaixado, inativado nem excluído
const isProtectedUser = (user) => user.email === "suporte@bip360.com.br" || user.id === "usr-admin-1";

const findUserOr404 = async (id, res) => {
  const user = await db.findUserById(id);
  if (!user) res.status(404).json({ error: "Usuário não encontrado." });
  return user;
};

// Lista (qualquer usuário logado: o Kanban precisa dos nomes dos operadores)
router.get("/", async (req, res) => {
  res.json(await db.listUsers());
});

router.post("/", requireAdmin, async (req, res) => {
  const name = String(req.body?.name ?? "").trim();
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = String(req.body?.password ?? "");
  const role = req.body?.role === "admin" ? "admin" : "operator";

  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nome, email e senha são obrigatórios" });
  }
  if (name.length > 100) return res.status(400).json({ error: "Nome muito longo (máximo 100 caracteres)." });
  if (!EMAIL_REGEX.test(email) || email.length > 160) return res.status(400).json({ error: "E-mail inválido." });
  if (password.length < config.minPasswordLength) return res.status(400).json({ error: PASSWORD_RULE });
  if (password.length > 200) return res.status(400).json({ error: "Senha muito longa (máximo 200 caracteres)." });

  if (await db.findUserByEmail(email)) {
    return res.status(400).json({ error: "Email já cadastrado" });
  }

  const newUser = await db.insertUser({
    id: `usr-${crypto.randomUUID()}`,
    name,
    email,
    password_hash: await hashPassword(password),
    role,
    is_active: true,
  });
  res.status(201).json(newUser);
});

router.put("/:id/role", requireAdmin, async (req, res) => {
  const { role } = req.body ?? {};
  if (!["admin", "operator"].includes(role)) {
    return res.status(400).json({ error: "Função inválida. Escolha admin ou operator." });
  }

  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  if (isProtectedUser(user)) {
    return res.status(403).json({ error: "A função do usuário Suporte BIP360 é protegida e não pode ser alterada." });
  }
  if (user.id === req.user.id) {
    return res.status(400).json({ error: "Você não pode alterar a sua própria função." });
  }

  res.json(await db.updateUser(user.id, { role }));
});

router.put("/:id/toggle-active", requireAdmin, async (req, res) => {
  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  if (isProtectedUser(user)) {
    return res.status(403).json({ error: "O usuário principal Suporte BIP360 não pode ser inativado." });
  }
  if (user.id === req.user.id) {
    return res.status(400).json({ error: "Você não pode inativar o seu próprio usuário." });
  }

  res.json(await db.updateUser(user.id, { is_active: !user.is_active }));
});

/**
 * Alterar senha.
 * - Próprio usuário: precisa informar a senha atual (vale também para admin)
 * - Admin redefinindo a senha de outra pessoa: não precisa da senha dela
 */
router.put("/:id/password", async (req, res) => {
  const newPassword = String(req.body?.newPassword ?? "").trim();
  const currentPassword = String(req.body?.currentPassword ?? "");

  if (newPassword.length < config.minPasswordLength) return res.status(400).json({ error: PASSWORD_RULE });
  if (newPassword.length > 200) return res.status(400).json({ error: "Senha muito longa (máximo 200 caracteres)." });

  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  const isSelf = req.user.id === user.id;
  const isAdmin = req.user.role === "admin";

  if (!isSelf && !isAdmin) {
    return res.status(403).json({ error: "Você não tem permissão para alterar a senha deste usuário." });
  }
  if (isSelf && !(await verifyPassword(currentPassword, user.password_hash))) {
    return res.status(400).json({ error: "Senha atual incorreta." });
  }

  await db.updateUser(user.id, { password_hash: await hashPassword(newPassword) });
  res.json({ message: "Senha alterada com sucesso!" });
});

// Exclusão: bloqueada se o usuário tiver vínculos (orienta inativar para preservar o histórico)
router.delete("/:id", requireAdmin, async (req, res) => {
  const user = await findUserOr404(req.params.id, res);
  if (!user) return;

  if (isProtectedUser(user)) {
    return res.status(403).json({ error: "O usuário principal Suporte BIP360 é protegido e não pode ser excluído." });
  }
  if (user.id === req.user.id) {
    return res.status(400).json({ error: "Você não pode excluir o seu próprio usuário." });
  }

  const links = await db.countUserLinks(user.id);
  if (links.cards > 0 || links.notes > 0) {
    return res.status(409).json({
      error: `Não é possível excluir o usuário "${user.name}" porque ele possui vínculo com ${links.cards} card(s) e/ou observações no histórico. Para preservar a rastreabilidade e histórico dos atendimentos, você deve apenas INATIVAR este usuário.`,
      canDeactivateInstead: true,
    });
  }

  await db.deleteUser(user.id);
  res.json({ message: "Usuário excluído com sucesso!" });
});

module.exports = router;
