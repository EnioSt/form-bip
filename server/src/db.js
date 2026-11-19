/**
 * Acesso ao banco (Supabase/Postgres).
 * As rotas só usam as funções deste arquivo; nenhuma rota monta consulta diretamente.
 * Os objetos devolvidos mantêm o formato que o front já conhece (card.formData, card.notes...).
 */
const { supabase, unwrap } = require("./supabase");
const { getPhotoUrls } = require("./storage/photoStorage");

const PAGE_SIZE = 1000; // limite padrão de linhas por consulta do Supabase
const CARD_SELECT = "*, form_data(*), card_notes(*)";

/** Busca todas as linhas, página por página (o Supabase devolve no máximo 1000 por vez). */
const fetchAll = async (buildQuery, context) => {
  const rows = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const page = unwrap(await buildQuery().range(from, from + PAGE_SIZE - 1), context);
    rows.push(...page);
    if (page.length < PAGE_SIZE) return rows;
  }
};

// ---------- Usuários ----------

/** Usuário sem o hash da senha (o que pode sair para o front). */
const toSafeUser = ({ password_hash, ...user }) => user;

const listUsers = async () =>
  unwrap(await supabase.from("users").select("*").order("created_at"), "listar usuários").map(toSafeUser);

/** Com hash da senha: uso interno (login, troca de senha). */
const findUserById = async (id) =>
  unwrap(await supabase.from("users").select("*").eq("id", id).maybeSingle(), "buscar usuário");

const findUserByEmail = async (email) =>
  unwrap(await supabase.from("users").select("*").eq("email", email.toLowerCase()).maybeSingle(), "buscar usuário");

const insertUser = async (user) =>
  toSafeUser(unwrap(await supabase.from("users").insert(user).select().single(), "criar usuário"));

const updateUser = async (id, patch) =>
  toSafeUser(unwrap(await supabase.from("users").update(patch).eq("id", id).select().single(), "atualizar usuário"));

const deleteUser = async (id) => unwrap(await supabase.from("users").delete().eq("id", id), "excluir usuário");

/** Quantos cards e observações estão ligados ao usuário (bloqueia a exclusão). */
const countUserLinks = async (id) => {
  const [cards, notes] = await Promise.all([
    supabase.from("cards").select("id", { count: "exact", head: true }).eq("operator_id", id),
    supabase.from("card_notes").select("id", { count: "exact", head: true }).eq("author_id", id),
  ]);
  unwrap(cards, "contar cards do usuário");
  unwrap(notes, "contar observações do usuário");
  return { cards: cards.count ?? 0, notes: notes.count ?? 0 };
};

// ---------- Cards ----------

const single = (value) => (Array.isArray(value) ? (value[0] ?? null) : (value ?? null));

/** Linha do banco → formato da API (formData, notes ordenadas, link temporário da foto). */
const toApiCard = (row, photoUrls) => {
  const { form_data, card_notes, pending_photo_file, ...card } = row;
  const formData = single(form_data);

  return {
    ...card,
    notes: [...(card_notes ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    formData: formData && { ...formData, photo_url: photoUrls.get(formData.photo_file) ?? "" },
  };
};

const toApiCards = async (rows) => {
  const photoUrls = await getPhotoUrls(rows.map((r) => single(r.form_data)?.photo_file));
  return rows.map((row) => toApiCard(row, photoUrls));
};

const listCards = async () =>
  toApiCards(
    await fetchAll(() => supabase.from("cards").select(CARD_SELECT).order("created_at").order("id"), "listar cards"),
  );

/** Card completo no formato da API, ou null. */
const getCard = async (id) => {
  const row = unwrap(await supabase.from("cards").select(CARD_SELECT).eq("id", id).maybeSingle(), "buscar card");
  return row ? (await toApiCards([row]))[0] : null;
};

/** Linha crua do card (uso interno: inclui pending_photo_file). */
const getCardRow = async (id) =>
  unwrap(await supabase.from("cards").select("*").eq("id", id).maybeSingle(), "buscar card");

const getCardRowByToken = async (token) =>
  unwrap(await supabase.from("cards").select("*").eq("unique_token", token).maybeSingle(), "buscar card pelo token");

/** Versão da lista de cards: muda quando qualquer card, formulário ou observação muda. */
const getCardsVersion = async () => unwrap(await supabase.rpc("cards_version"), "versão dos cards");

const insertCards = async (cards) => {
  if (cards.length === 0) return;
  unwrap(await supabase.from("cards").insert(cards), "criar cards");
};

/** Atualiza o card e devolve a linha crua atualizada (ou null se não existir). */
const updateCardRow = async (id, patch) =>
  unwrap(await supabase.from("cards").update(patch).eq("id", id).select().maybeSingle(), "atualizar card");

const deleteCard = async (id) => unwrap(await supabase.from("cards").delete().eq("id", id), "excluir card");

/** Campos mínimos de todos os cards, para a sincronização com a API de franquias. */
const listCardsForSync = async () =>
  fetchAll(
    () =>
      supabase
        .from("cards")
        .select("id, external_id, title, is_active, inactive_reason, title_history")
        .order("id"),
    "listar cards para sync",
  );

// ---------- Formulário ----------

const getFormData = async (cardId) =>
  unwrap(await supabase.from("form_data").select("*").eq("card_id", cardId).maybeSingle(), "buscar formulário");

const upsertFormData = async (formData) =>
  unwrap(await supabase.from("form_data").upsert(formData, { onConflict: "card_id" }), "salvar formulário");

// ---------- Observações ----------

const insertNote = async (note) =>
  unwrap(await supabase.from("card_notes").insert(note).select().single(), "criar observação");

const getNote = async (cardId, noteId) =>
  unwrap(
    await supabase.from("card_notes").select("*").eq("card_id", cardId).eq("id", noteId).maybeSingle(),
    "buscar observação",
  );

const deleteNote = async (noteId) =>
  unwrap(await supabase.from("card_notes").delete().eq("id", noteId), "excluir observação");

// ---------- Adquirentes ----------

const listCustomAcquirers = async () =>
  unwrap(await supabase.from("acquirers").select("name"), "listar adquirentes").map((a) => a.name);

const insertAcquirer = async (name) =>
  unwrap(await supabase.from("acquirers").insert({ name }), "cadastrar adquirente");

module.exports = {
  toSafeUser,
  listUsers,
  findUserById,
  findUserByEmail,
  insertUser,
  updateUser,
  deleteUser,
  countUserLinks,
  listCards,
  getCard,
  getCardRow,
  getCardRowByToken,
  getCardsVersion,
  insertCards,
  updateCardRow,
  deleteCard,
  listCardsForSync,
  getFormData,
  upsertFormData,
  insertNote,
  getNote,
  deleteNote,
  listCustomAcquirers,
  insertAcquirer,
};
