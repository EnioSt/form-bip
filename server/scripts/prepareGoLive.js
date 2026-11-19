/**
 * Limpeza dos dados de teste antes de ir para produção (direto no Supabase).
 *
 *   npm run golive:prepare            -> só MOSTRA o que vai mudar (nada é gravado)
 *   npm run golive:prepare -- --apply -> aplica as mudanças
 *
 * O que faz:
 *  1. Zera o formulário do card de testes (Abaetetuba 01 - #1100) e devolve para Triagem.
 *  2. Remove os usuários de teste (serão recriados em produção).
 *     Os cards ligados a eles ficam sem responsável; o resto do card
 *     (status, datas, formulário, observações) continua igual.
 */
const { supabase, unwrap } = require("../src/supabase");
const { deletePhotos } = require("../src/storage/photoStorage");

const TEST_CARD_EXTERNAL_IDS = [1100];
const TEST_USER_IDS = ["usr-op-1"]; // Enio: criado de novo em produção

const apply = process.argv.includes("--apply");
const log = (msg) => console.log(`${apply ? "" : "[simulação] "}${msg}`);

const main = async () => {
  // 1. Card de testes
  for (const externalId of TEST_CARD_EXTERNAL_IDS) {
    const card = unwrap(
      await supabase.from("cards").select("*, form_data(*)").eq("external_id", externalId).maybeSingle(),
      "buscar card de teste",
    );
    if (!card) {
      log(`Card #${externalId} não encontrado`);
      continue;
    }

    const formData = Array.isArray(card.form_data) ? card.form_data[0] : card.form_data;
    if (apply) {
      unwrap(await supabase.from("form_data").delete().eq("card_id", card.id), "apagar formulário");
      unwrap(await supabase.from("card_notes").delete().eq("card_id", card.id), "apagar observações");
      unwrap(
        await supabase
          .from("cards")
          .update({ status: "triagem", is_form_open: true, scheduled_date: null, operator_id: null, pending_photo_file: null })
          .eq("id", card.id),
        "zerar card",
      );
      await deletePhotos([formData?.photo_file, card.pending_photo_file]);
    }
    log(`Card "${card.title}" zerado (formulário ${formData ? "removido" : "já estava vazio"})`);
  }

  // 2. Usuários de teste (o banco deixa os cards deles sem responsável automaticamente)
  const { count } = await supabase
    .from("cards")
    .select("id", { count: "exact", head: true })
    .in("operator_id", TEST_USER_IDS);
  log(`${count ?? 0} card(s) ficarão sem responsável`);

  const users = unwrap(await supabase.from("users").select("id, name, email").in("id", TEST_USER_IDS), "buscar usuários");
  if (apply && users.length) unwrap(await supabase.from("users").delete().in("id", TEST_USER_IDS), "remover usuários");
  users.forEach((u) => log(`Usuário removido: ${u.name} (${u.email})`));

  console.log(apply ? "\nPronto." : "\nNada foi gravado. Para aplicar: npm run golive:prepare -- --apply");
};

main().catch((err) => {
  console.error("Falha:", err.message);
  process.exit(1);
});
