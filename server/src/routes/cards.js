const express = require("express");
const crypto = require("crypto");
const db = require("../db");
const { requireAdmin } = require("../security/auth");
const { deletePhotos } = require("../storage/photoStorage");

const router = express.Router();

const VALID_STATUSES = ["triagem", "preenchido", "implantacao", "concluido"];
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_NOTE_LENGTH = 150;

const notFound = (res) => res.status(404).json({ error: "Card não encontrado" });

/** Data opcional no formato YYYY-MM-DD. Retorna { value } ou { error }. */
const parseOptionalDate = (value) => {
  if (value === undefined) return { value: undefined };
  if (value === null || value === "") return { value: null };
  if (typeof value !== "string" || !ISO_DATE.test(value) || Number.isNaN(Date.parse(value))) {
    return { error: "Data inválida (use AAAA-MM-DD)." };
  }
  return { value };
};

/** Atualiza o card e responde com ele completo (ou 404). */
const updateAndRespond = async (res, id, patch) => {
  const updated = await db.updateCardRow(id, patch);
  if (!updated) return notFound(res);
  res.json(await db.getCard(id));
};

router.get("/", async (req, res) => {
  res.json(await db.listCards());
});

// Versão da lista: o front só baixa os cards de novo quando ela muda (economiza tráfego)
router.get("/version", async (req, res) => {
  res.json({ version: await db.getCardsVersion() });
});

router.get("/:id", async (req, res) => {
  const card = await db.getCard(req.params.id);
  if (!card) return notFound(res);
  res.json(card);
});

// Criação manual (desativada na interface: os cards vêm da API de franquias)
router.post("/", requireAdmin, async (req, res) => {
  const title = String(req.body?.title ?? "").trim();
  if (!title) return res.status(400).json({ error: "Título do card é obrigatório" });
  if (title.length > 150) return res.status(400).json({ error: "Título muito longo (máximo 150 caracteres)." });

  const id = `card-${crypto.randomUUID()}`;
  await db.insertCards([
    {
      id,
      title,
      status: "triagem",
      unique_token: crypto.randomUUID(),
      is_form_open: true,
      is_active: true,
      created_by: req.user.id,
    },
  ]);
  res.status(201).json(await db.getCard(id));
});

router.put("/:id/status", async (req, res) => {
  const { status } = req.body ?? {};
  if (!VALID_STATUSES.includes(status)) return res.status(400).json({ error: "Status inválido" });

  const date = parseOptionalDate(req.body?.scheduled_date);
  if (date.error) return res.status(400).json({ error: date.error });

  const patch = { status };
  if (date.value !== undefined) patch.scheduled_date = date.value;
  await updateAndRespond(res, req.params.id, patch);
});

/**
 * Vincular operador ao card.
 * - Operador: só pode assumir o card para si mesmo
 * - Admin: pode atribuir a qualquer operador ativo (ou remover com null)
 */
router.put("/:id/assume", async (req, res) => {
  const operatorId = req.body?.operator_id ?? null;
  const isAdmin = req.user.role === "admin";

  if (!isAdmin && operatorId !== req.user.id) {
    return res.status(403).json({ error: "Você só pode assumir cards para você mesmo." });
  }

  if (operatorId !== null) {
    const operator = typeof operatorId === "string" ? await db.findUserById(operatorId) : null;
    if (!operator || !operator.is_active) {
      return res.status(400).json({ error: "Operador inválido ou inativo." });
    }
  }

  await updateAndRespond(res, req.params.id, { operator_id: operatorId });
});

router.put("/:id/schedule", async (req, res) => {
  const date = parseOptionalDate(req.body?.scheduled_date ?? null);
  if (date.error) return res.status(400).json({ error: date.error });

  await updateAndRespond(res, req.params.id, { scheduled_date: date.value });
});

// Reabre o formulário para o cliente corrigir (dados preservados; card volta para Triagem)
router.put("/:id/reopen", async (req, res) => {
  await updateAndRespond(res, req.params.id, { status: "triagem", is_form_open: true });
});

// Interruptor Ativo / Inativo da loja
router.put("/:id/toggle-active", async (req, res) => {
  const card = await db.getCardRow(req.params.id);
  if (!card) return notFound(res);

  // Loja inativada pela franqueadora só volta quando reaparecer na API de franquias ativas
  if (!card.is_active && card.inactive_reason === "franchise_api") {
    return res.status(409).json({
      error: "Esta loja foi inativada porque não consta mais na API de franquias ativas. Ela será reativada automaticamente quando voltar a constar.",
    });
  }

  const willBeActive = !card.is_active;
  await updateAndRespond(res, card.id, {
    is_active: willBeActive,
    inactive_reason: willBeActive ? null : "manual",
    inactivated_at: willBeActive ? null : new Date().toISOString(),
  });
});

// Exclusão definitiva (somente admin), incluindo dados do formulário, observações e fotos
router.delete("/:id", requireAdmin, async (req, res) => {
  const card = await db.getCard(req.params.id);
  if (!card) return notFound(res);

  const row = await db.getCardRow(card.id);
  await db.deleteCard(card.id); // formulário e observações saem junto (on delete cascade)
  await deletePhotos([card.formData?.photo_file, row?.pending_photo_file]);

  res.json({ message: "Card excluído com sucesso", deletedCard: card });
});

// Observação interna: o autor é sempre o usuário do token (não dá para se passar por outro)
router.post("/:id/notes", async (req, res) => {
  const text = String(req.body?.text ?? "").trim();
  if (!text) return res.status(400).json({ error: "O texto da observação não pode estar vazio." });
  if (text.length > MAX_NOTE_LENGTH) {
    return res.status(400).json({ error: `A observação deve ter no máximo ${MAX_NOTE_LENGTH} caracteres.` });
  }

  if (!(await db.getCardRow(req.params.id))) return notFound(res);

  const note = await db.insertNote({
    id: `note-${crypto.randomUUID()}`,
    card_id: req.params.id,
    text,
    author_id: req.user.id,
    author_name: req.user.name,
  });
  res.status(201).json({ note, card: await db.getCard(req.params.id) });
});

// Excluir observação: somente o autor ou um admin
router.delete("/:cardId/notes/:noteId", async (req, res) => {
  const note = await db.getNote(req.params.cardId, req.params.noteId);
  if (!note) return res.status(404).json({ error: "Observação não encontrada." });

  const isAuthor = note.author_id && note.author_id === req.user.id;
  if (!isAuthor && req.user.role !== "admin") {
    return res.status(403).json({ error: "Você só pode excluir suas próprias observações." });
  }

  await db.deleteNote(note.id);
  res.json({ message: "Observação excluída com sucesso.", card: await db.getCard(req.params.cardId) });
});

module.exports = router;
