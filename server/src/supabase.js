/**
 * Cliente do Supabase usado pelo servidor (chave secreta: ignora o RLS).
 * Nunca exponha este cliente nem a chave ao navegador.
 */
const { createClient } = require("@supabase/supabase-js");
const config = require("./config");

const supabase = createClient(config.supabaseUrl, config.supabaseSecretKey, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
});

/** Erro de banco: registra o detalhe no log e devolve 500 genérico ao cliente. */
class DatabaseError extends Error {
  constructor(error, context) {
    super(`[db] ${context}: ${error.message}`);
    this.status = 500;
    this.code = error.code;
  }
}

/** Desembrulha { data, error } do supabase-js, lançando erro quando houver. */
const unwrap = ({ data, error }, context = "consulta") => {
  if (error) throw new DatabaseError(error, context);
  return data;
};

module.exports = { supabase, unwrap, DatabaseError };
