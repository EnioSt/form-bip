import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Users, UserPlus, Shield, User, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('operator');
  const [feedback, setFeedback] = useState(null);

  const fetchUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFeedback(null);
    try {
      await api.createUser({ name, email, password, role });
      setFeedback({ type: 'success', message: 'Usuário cadastrado com sucesso!' });
      setName('');
      setEmail('');
      setPassword('');
      setRole('operator');
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.updateUserRole(userId, newRole);
      setFeedback({ type: 'success', message: 'Função do usuário atualizada com sucesso!' });
      fetchUsers();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Gestão de Usuários
        </h1>
        <p className="text-sm text-slate-500 dark:text-darkSurface-muted">
          Área administrativa para cadastro e controle de operadores e administradores
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Formulário de Novo Usuário */}
        <div className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 border border-slate-200 dark:border-darkSurface-border shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <UserPlus className="text-brand-500" size={20} />
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading">
              Novo Usuário
            </h2>
          </div>

          {feedback && (
            <div
              className={`mb-4 p-3 rounded-lg text-sm flex items-center gap-2 border ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900'
              }`}
            >
              {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{feedback.message}</span>
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Amanda Silva"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="amanda@bip360.com.br"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Senha Provisória
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                Função (Role)
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-darkSurface-bg border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              >
                <option value="operator">Operador (Atendimento e Movimentação)</option>
                <option value="admin">Administrador (Acesso Completo)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white font-medium rounded-lg shadow-sm text-sm transition"
            >
              Cadastrar Usuário
            </button>
          </form>
        </div>

        {/* Tabela de Usuários */}
        <div className="lg:col-span-2 bg-white dark:bg-darkSurface-card rounded-2xl p-6 border border-slate-200 dark:border-darkSurface-border shadow-sm">
          <div className="flex items-center space-x-2 mb-4">
            <Users className="text-slate-500" size={20} />
            <h2 className="text-base font-bold text-slate-800 dark:text-white font-heading">
              Usuários Registrados ({users.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-darkSurface-bg/50 border-b border-slate-200 dark:border-darkSurface-border text-xs uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Função Atual</th>
                  <th className="px-4 py-3 text-right">Alterar Função</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-darkSurface-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-darkSurface-cardHover/50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-white flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-4 py-3">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                          <Shield size={12} />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-400 border border-brand-200 dark:border-brand-900">
                          <User size={12} />
                          <span>Operador</span>
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.email === 'suporte@bip360.com.br' ? (
                        <span className="text-[11px] text-slate-400 dark:text-darkSurface-muted italic font-medium px-2 py-1 bg-slate-100 dark:bg-darkSurface-cardHover rounded-lg border border-slate-200 dark:border-darkSurface-border">
                          Protegido (Fixo)
                        </span>
                      ) : (
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-darkSurface-border bg-slate-50 dark:bg-darkSurface-bg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition font-medium"
                        >
                          <option value="operator">Operador</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

