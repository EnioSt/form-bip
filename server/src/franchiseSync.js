/**
 * Sincronização com a API de franquias ativas (ITF Gestor).
 *
 * O vínculo card ↔ loja é SEMPRE pelo código (`id` na API = `external_id` no card), nunca pelo nome.
 *  - Código sumiu da API           → card inativado (inactive_reason = "franchise_api")
 *  - Código voltou para a API      → card reativado automaticamente (só se foi o sync que inativou)
 *  - Código novo na API            → card novo criado em Triagem, com link de formulário aberto
 *    (ex.: loja recriada com o mesmo nome e outro código → card novo; o antigo fica inativo com o histórico)
 *  - Nome mudou na API             → título do card atualizado (nome anterior guardado em title_history)
 *  - Inativação manual (inactive_reason = "manual") nunca é alterada pelo sync
 *
 * Configuração (variáveis de ambiente, todas opcionais):
 *  - FRANCHISE_API_URL            URL da API (padrão: ITF Gestor frnFranquia; "off" desliga o sync)
 *  - FRANCHISE_API_TOKEN          token Bearer, caso a API passe a exigir autenticação
 *  - FRANCHISE_SYNC_INTERVAL_MIN  intervalo entre verificações em minutos (padrão 15)
 *  - FRANCHISE_SYNC_MAX_INACTIVATE_PCT  % máximo de cards inativados de uma vez (padrão 10)
 *
 * Formato da resposta: [{ id: 1100, nome: "Abaetetuba 01 (PA)", ativo: "S", ... }]
 */

const crypto = require("crypto");
const db = require("./db");

const DEFAULT_API_URL = "https://itfgestor.com.br/ITFWebServicePdv2.0/frnFranquia";
const RAW_API_URL = process.env.FRANCHISE_API_URL ?? DEFAULT_API_URL;
const FRANCHISE_API_URL = RAW_API_URL === "off" ? null : RAW_API_URL;
const FRANCHISE_API_TOKEN = process.env.FRANCHISE_API_TOKEN;
const INTERVAL_MIN = Number(process.env.FRANCHISE_SYNC_INTERVAL_MIN) || 15;
const MAX_INACTIVATE_PCT = Number(process.env.FRANCHISE_SYNC_MAX_INACTIVATE_PCT) || 10;
const UPDATE_CONCURRENCY = 10;

const emptyResult = () => ({ inactivated: [], reactivated: [], created: [], renamed: [] });

// Último resultado, exposto em GET /api/franchise-sync/status
let lastRun = { status: "never", at: null, message: null, ...emptyResult() };

/**
 * Normaliza a resposta da API: só franquias com ativo = "S", no formato { id, nome }.
 * Resposta fora do formato esperado gera erro (o sync não altera nada nesse caso).
 */
const parseActiveFranchises = (json) => {
  if (!Array.isArray(json)) throw new Error("Resposta da API de franquias fora do formato esperado (não é uma lista)");

  return json
    .filter((f) => f && String(f.ativo ?? "S").toUpperCase() === "S")
    .map((f) => ({ id: Number(f.id), nome: String(f.nome ?? "").trim().slice(0, 200) }))
    .filter((f) => Number.isInteger(f.id));
};

const fetchActiveFranchises = async () => {
  const headers = { Accept: "application/json" };
  if (FRANCHISE_API_TOKEN) headers.Authorization = `Bearer ${FRANCHISE_API_TOKEN}`;

  const res = await fetch(FRANCHISE_API_URL, { headers, signal: AbortSignal.timeout(20000) });
  if (!res.ok) throw new Error(`API de franquias respondeu HTTP ${res.status}`);
  return parseActiveFranchises(await res.json());
};

const buildNewCard = (franchise, existingIds, now) => {
  // id legível e único (um código recriado nunca colide, mas garantimos mesmo assim)
  let id = `card-frn-${franchise.id}`;
  while (existingIds.has(id)) id = `card-frn-${franchise.id}-${crypto.randomBytes(2).toString("hex")}`;
  existingIds.add(id);

  return {
    id,
    external_id: franchise.id,
    title: franchise.nome || `Franquia ${franchise.id}`,
    status: "triagem",
    unique_token: crypto.randomUUID(), // token do link público: aleatório e impossível de adivinhar
    is_form_open: true,
    is_active: true,
    created_at: now,
    created_by: "franchise_sync",
  };
};

/** Proteção contra resposta parcial da API: aborta se fosse inativar cards demais de uma vez. */
const assertSafeInactivation = (cards, activeIds, maxInactivatePct) => {
  const linkedActive = cards.filter((c) => c.external_id != null && c.is_active !== false);
  const toInactivate = linkedActive.filter((c) => !activeIds.has(Number(c.external_id))).length;
  const limit = Math.max(1, Math.floor((linkedActive.length * maxInactivatePct) / 100));
  if (toInactivate > limit) {
    throw new Error(`Sincronização inativaria ${toInactivate} lojas de uma vez (limite ${limit}); ignorada por segurança`);
  }
};

/**
 * Compara os cards com a lista de franquias ativas (função pura, não grava nada).
 * Devolve o resumo, as alterações por card ({ id, patch }) e os cards novos.
 */
const planFranchiseSync = (cards, franchises, { maxInactivatePct = 100 } = {}) => {
  const byId = new Map(franchises.map((f) => [f.id, f]));
  assertSafeInactivation(cards, byId, maxInactivatePct);

  const now = new Date().toISOString();
  const result = emptyResult();
  const updates = [];
  const linkedIds = new Set();

  cards.forEach((card) => {
    if (card.external_id == null) return; // card sem vínculo com a API
    const code = Number(card.external_id);
    linkedIds.add(code);

    const franchise = byId.get(code);
    const isActive = card.is_active !== false;
    const patch = {};

    if (!franchise) {
      if (isActive) {
        Object.assign(patch, { is_active: false, inactive_reason: "franchise_api", inactivated_at: now });
        result.inactivated.push(card.title);
      }
    } else {
      if (!isActive && card.inactive_reason === "franchise_api") {
        Object.assign(patch, { is_active: true, inactive_reason: null, inactivated_at: null });
        result.reactivated.push(card.title);
      }
      if (franchise.nome && franchise.nome !== card.title) {
        patch.title = franchise.nome;
        patch.title_history = [...(card.title_history ?? []), { title: card.title, changed_at: now }];
        result.renamed.push(`${card.title} → ${franchise.nome}`);
      }
    }

    if (Object.keys(patch).length > 0) updates.push({ id: card.id, patch });
  });

  // Códigos que ainda não têm card (lojas novas ou recriadas com outro código)
  const existingCardIds = new Set(cards.map((c) => c.id));
  const inserts = franchises
    .filter((f) => !linkedIds.has(f.id))
    .map((f) => {
      const card = buildNewCard(f, existingCardIds, now);
      result.created.push(`${card.title} (#${f.id})`);
      return card;
    });

  return { result, updates, inserts };
};

/** Grava as alterações em pequenos lotes paralelos (normalmente são poucas por execução). */
const applyPlan = async ({ updates, inserts }) => {
  await db.insertCards(inserts);
  for (let i = 0; i < updates.length; i += UPDATE_CONCURRENCY) {
    await Promise.all(updates.slice(i, i + UPDATE_CONCURRENCY).map(({ id, patch }) => db.updateCardRow(id, patch)));
  }
};

/**
 * Executa uma verificação completa.
 * Proteções: se a API falhar, vier fora do formato, vazia ou inativando lojas demais, nada é alterado.
 */
const runFranchiseSync = async () => {
  if (!FRANCHISE_API_URL) {
    lastRun = { status: "disabled", at: new Date().toISOString(), message: "sync desligado (FRANCHISE_API_URL=off)", ...emptyResult() };
    return lastRun;
  }

  try {
    const franchises = await fetchActiveFranchises();
    if (franchises.length === 0) {
      throw new Error("API de franquias devolveu lista vazia; sincronização ignorada por segurança");
    }

    const cards = await db.listCardsForSync();
    const plan = planFranchiseSync(cards, franchises, { maxInactivatePct: MAX_INACTIVATE_PCT });
    await applyPlan(plan);

    const { result } = plan;
    lastRun = { status: "ok", at: new Date().toISOString(), message: `${franchises.length} franquias ativas na API`, ...result };
    console.log(
      `[franchise-sync] ok: ${result.inactivated.length} inativado(s), ${result.reactivated.length} reativado(s), ` +
        `${result.created.length} criado(s), ${result.renamed.length} renomeado(s)`,
    );
  } catch (err) {
    lastRun = { status: "error", at: new Date().toISOString(), message: err.message, ...emptyResult() };
    console.error("[franchise-sync] erro:", err.message);
  }

  return lastRun;
};

const startFranchiseSync = () => {
  if (!FRANCHISE_API_URL) {
    console.warn("[franchise-sync] desligado (FRANCHISE_API_URL=off)");
    lastRun = { ...lastRun, status: "disabled", message: "sync desligado (FRANCHISE_API_URL=off)" };
    return;
  }
  runFranchiseSync();
  setInterval(runFranchiseSync, INTERVAL_MIN * 60 * 1000);
  console.log(`[franchise-sync] ativo: verificação a cada ${INTERVAL_MIN} min`);
};

const getFranchiseSyncStatus = () => lastRun;

module.exports = { planFranchiseSync, runFranchiseSync, startFranchiseSync, getFranchiseSyncStatus };
