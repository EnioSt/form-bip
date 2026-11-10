const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const api = {
  // Auth
  login: async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao autenticar');
    }
    return res.json();
  },

  // Users
  getUsers: async () => {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error('Falha ao listar usuários');
    return res.json();
  },

  createUser: async (userData) => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao criar usuário');
    }
    return res.json();
  },

  updateUserRole: async (id, role) => {
    const res = await fetch(`${API_URL}/users/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao atualizar função do usuário');
    }
    return res.json();
  },

  // Cards
  getCards: async () => {
    const res = await fetch(`${API_URL}/cards?_t=${Date.now()}`);
    if (!res.ok) throw new Error('Falha ao buscar cards');
    return res.json();
  },

  getCardDetails: async (id) => {
    const res = await fetch(`${API_URL}/cards/${id}?_t=${Date.now()}`);
    if (!res.ok) throw new Error('Falha ao buscar detalhes do card');
    return res.json();
  },

  createCard: async (title) => {
    const res = await fetch(`${API_URL}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao criar card');
    }
    return res.json();
  },

  updateCardStatus: async (id, status, scheduled_date) => {
    const res = await fetch(`${API_URL}/cards/${id}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, scheduled_date })
    });
    if (!res.ok) throw new Error('Falha ao atualizar status');
    return res.json();
  },

  assumeCard: async (id, operator_id) => {
    const res = await fetch(`${API_URL}/cards/${id}/assume`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ operator_id })
    });
    if (!res.ok) throw new Error('Falha ao assumir card');
    return res.json();
  },

  updateCardSchedule: async (id, scheduled_date) => {
    const res = await fetch(`${API_URL}/cards/${id}/schedule`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_date })
    });
    if (!res.ok) throw new Error('Falha ao atualizar data prevista');
    return res.json();
  },

  reopenCard: async (id) => {
    const res = await fetch(`${API_URL}/cards/${id}/reopen`, {
      method: 'PUT'
    });
    if (!res.ok) throw new Error('Falha ao reabrir formulário');
    return res.json();
  },

  addCardNote: async (cardId, text, author_id, author_name) => {
    const res = await fetch(`${API_URL}/cards/${cardId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, author_id, author_name })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao salvar observação');
    }
    return res.json();
  },

  deleteCardNote: async (cardId, noteId, user_id, user_role) => {
    const res = await fetch(`${API_URL}/cards/${cardId}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, user_role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao excluir observação');
    }
    return res.json();
  },

  // Form Público
  getFormByToken: async (token) => {
    const res = await fetch(`${API_URL}/form/${token}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Link inválido');
    }
    return res.json();
  },

  submitForm: async (token, formData) => {
    const res = await fetch(`${API_URL}/form/${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Falha ao enviar formulário');
    }
    return res.json();
  },

  uploadPhoto: async (file) => {
    const data = new FormData();
    data.append('photo', file);
    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      body: data
    });
    if (!res.ok) throw new Error('Erro ao fazer upload da imagem');
    return res.json();
  }
};

