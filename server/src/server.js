const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, 'data', 'database.json');

app.use(cors());
app.use(express.json());

// Upload mock com Multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas!'));
    }
  }
});

// Leitura e Escrita do JSON Mock
function readDatabase() {
  try {
    const raw = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro lendo database.json:', err);
    return { users: [], cards: [], formData: [] };
  }
}

function writeDatabase(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Erro gravando database.json:', err);
    return false;
  }
}

// 1. Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const db = readDatabase();
  const user = db.users.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  const { password: _, ...userWithoutPass } = user;
  res.json({ user: userWithoutPass, token: `mock-jwt-token-for-${user.id}` });
});

// 2. Admin: Gestão de Usuários
app.get('/api/users', (req, res) => {
  const db = readDatabase();
  const safeUsers = db.users.map(({ password, ...u }) => u);
  res.json(safeUsers);
});

app.post('/api/users', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
  }

  const db = readDatabase();
  if (db.users.some(u => u.email === email)) {
    return res.status(400).json({ error: 'Email já cadastrado' });
  }

  const newUser = {
    id: `usr-${Date.now()}`,
    name,
    email,
    password,
    role: role === 'admin' ? 'admin' : 'operator'
  };

  db.users.push(newUser);
  writeDatabase(db);

  const { password: _, ...userSafe } = newUser;
  res.status(201).json(userSafe);
});

// Alterar função / perfil do usuário (Admin pode mudar a qualquer momento)
app.put('/api/users/:id/role', (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['admin', 'operator'].includes(role)) {
    return res.status(400).json({ error: 'Função inválida. Escolha admin ou operator.' });
  }

  const db = readDatabase();
  const user = db.users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  // Proteção: O usuário suporte padrão nunca pode ter a função alterada
  if (user.email === 'suporte@bip360.com.br' || user.id === 'usr-admin-1') {
    return res.status(403).json({ error: 'A função do usuário Suporte BIP360 é protegida e não pode ser alterada.' });
  }

  user.role = role;
  writeDatabase(db);

  const { password: _, ...userSafe } = user;
  res.json(userSafe);
});

// 3. Cards: Kanban
app.get('/api/cards', (req, res) => {
  const db = readDatabase();
  // Inclui os dados do formulário associados a cada card se existirem
  const cardsWithData = db.cards.map(card => {
    const formData = db.formData.find(f => f.card_id === card.id) || null;
    return {
      ...card,
      formData
    };
  });
  res.json(cardsWithData);
});

// Buscar detalhes de um card e seu formData diretamente por ID
app.get('/api/cards/:id', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const card = db.cards.find(c => c.id === id);

  if (!card) {
    return res.status(404).json({ error: 'Card não encontrado' });
  }

  const formData = db.formData.find(f => f.card_id === card.id) || null;
  res.json({
    ...card,
    formData
  });
});

app.post('/api/cards', (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Título do card é obrigatório' });
  }

  const db = readDatabase();
  const newCard = {
    id: `card-${Date.now()}`,
    title,
    status: 'triagem',
    unique_token: `token-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    is_form_open: true,
    operator_id: null,
    created_at: new Date().toISOString()
  };

  db.cards.push(newCard);
  writeDatabase(db);
  res.status(201).json(newCard);
});

app.put('/api/cards/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, scheduled_date } = req.body;
  const validStatuses = ['triagem', 'preenchido', 'implantacao', 'concluido'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }

  const db = readDatabase();
  const card = db.cards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ error: 'Card não encontrado' });
  }

  card.status = status;
  if (scheduled_date !== undefined) {
    card.scheduled_date = scheduled_date;
  }

  writeDatabase(db);
  res.json(card);
});

// Assumir card pelo operador
app.put('/api/cards/:id/assume', (req, res) => {
  const { id } = req.params;
  const { operator_id } = req.body;

  const db = readDatabase();
  const card = db.cards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ error: 'Card não encontrado' });
  }

  card.operator_id = operator_id;
  writeDatabase(db);
  res.json(card);
});

// Alterar apenas a data prevista de implantação
app.put('/api/cards/:id/schedule', (req, res) => {
  const { id } = req.params;
  const { scheduled_date } = req.body;

  const db = readDatabase();
  const card = db.cards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ error: 'Card não encontrado' });
  }

  card.scheduled_date = scheduled_date || null;
  writeDatabase(db);
  res.json(card);
});

// Reabrir formulário do card
app.put('/api/cards/:id/reopen', (req, res) => {
  const { id } = req.params;
  const db = readDatabase();
  const card = db.cards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ error: 'Card não encontrado' });
  }

  card.status = 'triagem';
  card.is_form_open = true;
  writeDatabase(db);
  res.json(card);
});

// Adicionar observação interna no card (qualquer usuário autenticado)
app.post('/api/cards/:id/notes', (req, res) => {
  const { id } = req.params;
  const { text, author_id, author_name } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'O texto da observação não pode estar vazio.' });
  }

  const cleanText = text.trim();
  if (cleanText.length > 150) {
    return res.status(400).json({ error: 'A observação deve ter no máximo 150 caracteres.' });
  }

  const db = readDatabase();
  const card = db.cards.find(c => c.id === id);
  if (!card) {
    return res.status(404).json({ error: 'Card não encontrado.' });
  }

  if (!Array.isArray(card.notes)) {
    card.notes = [];
  }

  const newNote = {
    id: `note-${Date.now()}`,
    text: cleanText,
    author_id: author_id || null,
    author_name: author_name || 'Operador',
    created_at: new Date().toISOString()
  };

  card.notes.push(newNote);
  writeDatabase(db);

  res.status(201).json({ note: newNote, card });
});

// Excluir observação interna (Autor ou Administrador)
app.delete('/api/cards/:cardId/notes/:noteId', (req, res) => {
  const { cardId, noteId } = req.params;
  const { user_id, user_role } = req.body;

  const db = readDatabase();
  const card = db.cards.find(c => c.id === cardId);
  if (!card) {
    return res.status(404).json({ error: 'Card não encontrado.' });
  }

  if (!Array.isArray(card.notes)) {
    return res.status(404).json({ error: 'Nenhuma observação encontrada.' });
  }

  const noteIndex = card.notes.findIndex(n => n.id === noteId);
  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Observação não encontrada.' });
  }

  const targetNote = card.notes[noteIndex];

  // Permissão: Apenas o próprio autor ou Admin podem excluir
  const isAuthor = targetNote.author_id && targetNote.author_id === user_id;
  const isAdmin = user_role === 'admin';

  if (!isAuthor && !isAdmin) {
    return res.status(403).json({ error: 'Você só pode excluir suas próprias observações.' });
  }

  card.notes.splice(noteIndex, 1);
  writeDatabase(db);

  res.json({ message: 'Observação excluída com sucesso.', card });
});

// 4. Formulário Público e Upload Mock
app.post('/api/upload', upload.single('photo'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado' });
  }
  // Simulação de caminho de imagem
  const mockUrl = `https://storage.mock-bip360.local/uploads/${Date.now()}-${req.file.originalname}`;
  res.json({ photo_url: mockUrl });
});

// Buscar dados do formulário pelo token público
app.get('/api/form/:token', (req, res) => {
  const { token } = req.params;
  const db = readDatabase();
  const card = db.cards.find(c => c.unique_token === token);

  if (!card) {
    return res.status(404).json({ error: 'Link de formulário inválido ou não encontrado' });
  }

  const formData = db.formData.find(f => f.card_id === card.id) || null;
  res.json({
    card: {
      id: card.id,
      title: card.title,
      status: card.status,
      is_form_open: card.is_form_open
    },
    formData
  });
});

// Envio / Atualização do formulário público
app.post('/api/form/:token', (req, res) => {
  const { token } = req.params;
  const db = readDatabase();
  const card = db.cards.find(c => c.unique_token === token);

  if (!card) {
    return res.status(404).json({ error: 'Card não encontrado' });
  }

  if (!card.is_form_open) {
    return res.status(403).json({ error: 'Este formulário já foi finalizado e está fechado.' });
  }

  const payload = req.body;
  const existingIndex = db.formData.findIndex(f => f.card_id === card.id);

  if (existingIndex >= 0) {
    // Atualiza mantendo id original
    db.formData[existingIndex] = {
      ...db.formData[existingIndex],
      ...payload,
      card_id: card.id,
      updated_at: new Date().toISOString()
    };
  } else {
    // Insere novo
    db.formData.push({
      id: `form-data-${Date.now()}`,
      card_id: card.id,
      ...payload,
      created_at: new Date().toISOString()
    });
  }

  // Atualiza estado do card para 'preenchido' e fecha formulário
  card.status = 'preenchido';
  card.is_form_open = false;

  writeDatabase(db);
  res.json({ message: 'Formulário enviado com sucesso!', card });
});

app.listen(PORT, () => {
  console.log(`Backend BIP360 (Mock JSON) rodando na porta ${PORT}`);
});

