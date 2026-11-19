import { UserPlus, User, Mail, Lock } from "lucide-react";
import { FeedbackAlert } from "../FeedbackAlert";
import { IconInput } from "../IconInput";

/**
 * Formulário de cadastro de novo usuário (campos controlados pela página).
 * - values: { name, email, password, role }
 * - onChange: (campo, valor) => void
 */
export const UserForm = ({ values, feedback, onChange, onSubmit }) => {
  return (
    <section aria-labelledby="user-form-title" className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 border border-slate-200 dark:border-darkSurface-border shadow-sm">
      <header className="flex items-center space-x-2 mb-4">
        <UserPlus className="text-brand-500" size={20} />
        <h2 id="user-form-title" className="text-base font-bold text-slate-800 dark:text-white font-heading">
          Novo Usuário
        </h2>
      </header>

      <FeedbackAlert feedback={feedback} size="md" />

      <form onSubmit={onSubmit} className="space-y-4">
        <IconInput
          id="user-name"
          label="Nome Completo"
          icon={User}
          type="text"
          required
          value={values.name}
          onChange={(v) => onChange("name", v)}
          placeholder="Ex: Amanda Silva"
        />

        <IconInput
          id="user-email"
          label="E-mail"
          icon={Mail}
          type="email"
          required
          value={values.email}
          onChange={(v) => onChange("email", v)}
          placeholder="amanda@bip360.com.br"
        />

        <IconInput
          id="user-password"
          label="Senha Provisória"
          icon={Lock}
          type="password"
          required
          autoComplete="new-password"
          minLength={8}
          value={values.password}
          onChange={(v) => onChange("password", v)}
          placeholder="Mínimo 8 caracteres"
        />

        <div>
          <label htmlFor="user-role" className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
            Função (Role)
          </label>
          <select
            id="user-role"
            value={values.role}
            onChange={(e) => onChange("role", e.target.value)}
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
    </section>
  );
};
