import { Users } from "lucide-react";
import { UserRow } from "../UserRow";

/**
 * Tabela de usuários registrados.
 * - isProtected: (user) => boolean — define quem é o admin fixo (regra fica na página)
 */
export const UsersTable = ({
  users,
  currentUserId,
  isProtected,
  onRoleChange,
  onResetPassword,
  onToggleActive,
  onDelete,
}) => {
  return (
    <section aria-labelledby="users-table-title" className="lg:col-span-2 bg-white dark:bg-darkSurface-card rounded-2xl p-6 border border-slate-200 dark:border-darkSurface-border shadow-sm">
      <header className="flex items-center space-x-2 mb-4">
        <Users className="text-slate-500" size={20} />
        <h2 id="users-table-title" className="text-base font-bold text-slate-800 dark:text-white font-heading">
          Usuários Registrados ({users.length})
        </h2>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-darkSurface-bg/50 border-b border-slate-200 dark:border-darkSurface-border text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-4 py-3">Nome</th>
              <th scope="col" className="px-4 py-3">Email</th>
              <th scope="col" className="px-4 py-3">Status</th>
              <th scope="col" className="px-4 py-3">Função</th>
              <th scope="col" className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-darkSurface-border">
            {users.map((u) => (
              <UserRow
                key={u.id}
                user={u}
                isCurrentUser={currentUserId === u.id}
                isProtected={isProtected(u)}
                onRoleChange={(role) => onRoleChange(u.id, role)}
                onResetPassword={() => onResetPassword(u)}
                onToggleActive={() => onToggleActive(u)}
                onDelete={() => onDelete(u)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};
