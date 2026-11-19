const config = require("./config"); // carrega o .env e valida antes de tudo
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");

const { requireAuth, requireAdmin } = require("./security/auth");
const { apiLimiter } = require("./security/rateLimits");
const { runFranchiseSync, startFranchiseSync, getFranchiseSyncStatus } = require("./franchiseSync");

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const cardRoutes = require("./routes/cards");
const publicFormRoutes = require("./routes/publicForm");
const acquirerRoutes = require("./routes/acquirers");

const app = express();
app.set("trust proxy", config.trustProxy);

// ---------- Segurança HTTP ----------

// Cabeçalhos de segurança
app.use(helmet());

// CORS: só os domínios do sistema podem chamar a API pelo navegador
app.use(
  cors({
    origin: (origin, callback) => {
      // Sem origin = chamada fora do navegador (curl, servidor, health check)
      if (!origin || config.corsOrigins.includes(origin)) return callback(null, true);
      callback(Object.assign(new Error("Origem não autorizada pelo CORS"), { status: 403 }));
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 600,
  }),
);

app.use(express.json({ limit: "50kb" }));

// ---------- Rotas públicas ----------

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/form", publicFormRoutes);
app.use("/api/acquirers", acquirerRoutes);

// ---------- Rotas privadas (exigem login) ----------

app.use("/api", apiLimiter, requireAuth);
app.use("/api/users", userRoutes);
app.use("/api/cards", cardRoutes);

app.get("/api/franchise-sync/status", (req, res) => res.json(getFranchiseSyncStatus()));
app.post("/api/franchise-sync/run", requireAdmin, async (req, res) => {
  const result = await runFranchiseSync();
  res.status(result.status === "error" ? 502 : 200).json(result);
});

// ---------- Erros ----------

app.use("/api", (req, res) => res.status(404).json({ error: "Rota não encontrada" }));

// Nunca devolve stack trace nem detalhes internos ao cliente
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? `A imagem deve ter no máximo ${config.maxPhotoBytes / 1024 / 1024}MB`
        : "Envio de arquivo inválido";
    return res.status(400).json({ error: message });
  }
  if (err.type === "entity.too.large") return res.status(413).json({ error: "Requisição muito grande" });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "JSON inválido" });

  const status = err.status || 500;
  if (status >= 500) console.error("[erro]", err);
  res.status(status).json({ error: status >= 500 ? "Erro interno do servidor" : err.message });
});

// ---------- Inicialização ----------

app.listen(config.port, () => {
  console.log(`Backend BIP360 rodando na porta ${config.port} (${config.isProduction ? "produção" : "desenvolvimento"})`);
  startFranchiseSync();
});
