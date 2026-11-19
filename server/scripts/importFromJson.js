/**
 * Importa o banco antigo (src/data/database.json) para o Supabase.
 *
 *   npm run db:import              -> importa (só se as tabelas estiverem vazias)
 *   npm run db:import -- --replace -> APAGA tudo no Supabase e importa de novo
 *
 * Durante a importação:
 *  - senhas em texto puro viram hash bcrypt (o login continua com a mesma senha)
 *  - tokens previsíveis de link (ex.: "token-frn-1100") são trocados por UUID
 *  - fotos de teste com URL falsa são descartadas
 */
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { supabase, unwrap } = require("../src/supabase");
const { isBcryptHash, hashPassword } = require("../src/security/auth");

const JSON_PATH = process.env.DATABASE_FILE || path.join(__dirname, "..", "src", "data", "database.json");
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const BATCH = 500;
const replace = process.argv.includes("--replace");

const FORM_FIELDS = [
  "cnpj", "razao_social", "responsavel", "telefone", "email_unidade", "endereco", "cep", "cidade", "uf",
  "adquirente_banco", "adquirente_outro_nome", "numero_logico_adquirente", "qtd_pdvs_tef", "qtd_totems_tef",
  "pix_psp_banco", "pix_chave",
];
const FORM_FLAGS = ["foto_maquininha_ok", "pix_vinculacao_fiserv_ok", "pix_nao_se_aplica"];

const insertInBatches = async (table, rows) => {
  for (let i = 0; i < rows.length; i += BATCH) {
    unwrap(await supabase.from(table).insert(rows.slice(i, i + BATCH)), `importar ${table}`);
  }
  console.log(`  ${table}: ${rows.length}`);
};

const countRows = async (table) => {
  const { count, error } = await supabase.from(table).select("*", { count: "exact" }).limit(1);
  if (error) throw new Error(`Tabela "${table}" não encontrada. Rodou o supabase/schema.sql no SQL Editor? (${error.message})`);
  return count ?? 0;
};

const main = async () => {
  const json = JSON.parse(fs.readFileSync(JSON_PATH, "utf-8"));
  const tables = ["card_notes", "form_data", "cards", "acquirers", "users"];

  const counts = await Promise.all(tables.map(countRows));
  if (counts.some((c) => c > 0)) {
    if (!replace) {
      console.error("O Supabase já tem dados. Para apagar tudo e importar de novo: npm run db:import -- --replace");
      process.exit(1);
    }
    console.log("Apagando os dados atuais do Supabase...");
    for (const table of tables) {
      const key = table === "acquirers" ? "name" : table === "form_data" ? "card_id" : "id";
      unwrap(await supabase.from(table).delete().not(key, "is", null), `limpar ${table}`);
    }
  }

  const users = [];
  for (const u of json.users ?? []) {
    users.push({
      id: u.id,
      name: u.name,
      email: String(u.email).trim().toLowerCase(),
      password_hash: isBcryptHash(u.password) ? u.password : await hashPassword(u.password),
      role: u.role === "admin" ? "admin" : "operator",
      is_active: u.is_active !== false,
    });
  }
  const userIds = new Set(users.map((u) => u.id));

  let rotated = 0;
  const cards = (json.cards ?? []).map((c) => {
    const token = UUID.test(c.unique_token ?? "") ? c.unique_token : crypto.randomUUID();
    if (token !== c.unique_token) rotated += 1;
    return {
      id: c.id,
      external_id: c.external_id ?? null,
      title: c.title,
      status: c.status,
      unique_token: token,
      is_form_open: c.is_form_open !== false,
      is_active: c.is_active !== false,
      inactive_reason: c.is_active === false ? (c.inactive_reason ?? "manual") : null,
      inactivated_at: c.is_active === false ? (c.inactivated_at ?? null) : null,
      operator_id: userIds.has(c.operator_id) ? c.operator_id : null,
      scheduled_date: c.scheduled_date || null,
      title_history: c.title_history ?? [],
      created_by: c.created_by ?? null,
      created_at: c.created_at ?? new Date().toISOString(),
    };
  });
  const cardIds = new Set(cards.map((c) => c.id));

  const notes = (json.cards ?? []).flatMap((c) =>
    (c.notes ?? []).map((n) => ({
      id: n.id,
      card_id: c.id,
      text: String(n.text).slice(0, 150),
      author_id: userIds.has(n.author_id) ? n.author_id : null,
      author_name: n.author_name ?? null,
      created_at: n.created_at ?? new Date().toISOString(),
    })),
  );

  const formData = (json.formData ?? [])
    .filter((f) => cardIds.has(f.card_id))
    .map((f) => {
      const row = { card_id: f.card_id, created_at: f.created_at ?? new Date().toISOString(), updated_at: f.updated_at ?? null };
      FORM_FIELDS.forEach((key) => (row[key] = f[key] != null ? String(f[key]) : null));
      FORM_FLAGS.forEach((key) => (row[key] = !!f[key]));
      if (!row.qtd_totems_tef && f.totem_count != null) row.qtd_totems_tef = String(f.totem_count);
      return row; // fotos antigas eram URLs falsas de teste: não há arquivo para migrar
    });

  const acquirers = [...new Set(json.acquirers ?? [])].map((name) => ({ name }));

  console.log("Importando:");
  await insertInBatches("users", users);
  await insertInBatches("cards", cards);
  await insertInBatches("form_data", formData);
  await insertInBatches("card_notes", notes);
  await insertInBatches("acquirers", acquirers);
  console.log(`\nPronto. ${rotated} token(s) de link trocado(s) por UUID.`);
};

main().catch((err) => {
  console.error("Falha na importação:", err.message);
  process.exit(1);
});
