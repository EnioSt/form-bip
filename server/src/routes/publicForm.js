/**
 * Rotas PÚBLICAS do formulário (sem login). O acesso é controlado pelo token do link.
 * Expõem somente o mínimo necessário: título/status do card e os dados do próprio formulário.
 */
const express = require("express");
const multer = require("multer");
const config = require("../config");
const db = require("../db");
const { publicFormLimiter, uploadLimiter } = require("../security/rateLimits");
const { parsePublicForm } = require("../validation/publicFormSchema");
const { savePhoto, deletePhoto, getPhotoUrl } = require("../storage/photoStorage");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxPhotoBytes, files: 1, fields: 5 },
});

const TOKEN_FORMAT = /^[A-Za-z0-9-]{8,100}$/;

// Loja inativa não aceita envio: o link se comporta como formulário fechado
const isAcceptingSubmissions = (card) => card.is_form_open && card.is_active;

/** Carrega o card do token ou responde 404 (mensagem genérica, sem revelar detalhes). */
const loadCardByToken = async (req, res, next) => {
  const { token } = req.params;
  const card = TOKEN_FORMAT.test(token) ? await db.getCardRowByToken(token) : null;
  if (!card) return res.status(404).json({ error: "Link de formulário inválido ou não encontrado" });

  req.card = card;
  next();
};

const ensureFormOpen = (req, res, next) => {
  if (!isAcceptingSubmissions(req.card)) {
    return res.status(403).json({ error: "Este formulário já foi finalizado e está fechado." });
  }
  next();
};

router.get("/:token", publicFormLimiter, loadCardByToken, async (req, res) => {
  const { card } = req;
  const formData = await db.getFormData(card.id);

  // Campos internos (nome do arquivo da foto, vínculo com o card) não saem para o público
  let publicFormData = null;
  if (formData) {
    const { photo_file, card_id, ...rest } = formData;
    publicFormData = { ...rest, photo_url: photo_file ? await getPhotoUrl(photo_file) : "" };
  }

  res.json({
    card: {
      id: card.id,
      title: card.title,
      status: card.status,
      is_form_open: isAcceptingSubmissions(card),
    },
    formData: publicFormData,
  });
});

// Upload da foto da maquininha (vinculado ao token; substitui a foto pendente anterior)
router.post(
  "/:token/photo",
  uploadLimiter,
  loadCardByToken,
  ensureFormOpen,
  upload.single("photo"),
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });

    const { card } = req;
    const fileName = await savePhoto(req.file.buffer);

    await db.updateCardRow(card.id, { pending_photo_file: fileName });
    await deletePhoto(card.pending_photo_file);

    res.status(201).json({ photo_url: await getPhotoUrl(fileName) });
  },
);

router.post("/:token", publicFormLimiter, loadCardByToken, ensureFormOpen, async (req, res) => {
  const { data, error } = parsePublicForm(req.body);
  if (error) return res.status(400).json({ error });

  const { card } = req;
  const existing = await db.getFormData(card.id);
  const now = new Date().toISOString();

  // A foto é definida pelo servidor (nunca por uma URL enviada pelo navegador)
  const newPhoto = card.pending_photo_file;

  await db.upsertFormData({
    card_id: card.id,
    ...data,
    ...(newPhoto ? { photo_file: newPhoto } : {}),
    ...(existing ? { updated_at: now } : { created_at: now }),
  });

  await db.updateCardRow(card.id, { status: "preenchido", is_form_open: false, pending_photo_file: null });
  if (newPhoto && existing?.photo_file) await deletePhoto(existing.photo_file);

  res.json({ message: "Formulário enviado com sucesso!" });
});

module.exports = router;
