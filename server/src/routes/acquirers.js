const express = require("express");
const db = require("../db");
const { requireAuth } = require("../security/auth");
const { publicFormLimiter } = require("../security/rateLimits");

const router = express.Router();

const DEFAULT_ACQUIRERS = [
  "Bin",
  "Cielo",
  "Getnet",
  "PagSeguro (PagBank)",
  "Rede",
  "Sicredi",
  "Sipag (Sicoob)",
  "Stone",
];

const listAcquirers = async () =>
  [...new Set([...DEFAULT_ACQUIRERS, ...(await db.listCustomAcquirers())])].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );

// Público: o formulário do franqueado precisa da lista
router.get("/", publicFormLimiter, async (req, res) => {
  res.json(await listAcquirers());
});

// Cadastro de nova adquirente: somente usuários logados
router.post("/", requireAuth, async (req, res) => {
  const name = String(req.body?.name ?? "").trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 60) {
    return res.status(400).json({ error: "O nome da adquirente deve ter entre 2 e 60 caracteres." });
  }

  const exists = (await listAcquirers()).some((a) => a.toLowerCase() === name.toLowerCase());
  if (exists) return res.status(400).json({ error: `A adquirente "${name}" já está cadastrada.` });

  await db.insertAcquirer(name);
  res.status(201).json({ acquirers: await listAcquirers(), added: name });
});

module.exports = router;
