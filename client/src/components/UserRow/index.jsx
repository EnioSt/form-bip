import { Shield } from "lucide-react";
import { UserStatusBadge } from "../UserStatusBadge";
import { UserActions } from "../UserActions";

const RoleCell = ({ user, isProtected, onRoleChange }) =>
  isProtected ? (
    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
      <Shield size={12} />
      <span>Admin Fixo</span>
    </span>
  ) : (
    <select
      value={user.role}
      onChange={(e) => onRoleChange(e.target.value)}
      aria-label={`Função de ${user.name}`}
      className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-darkSurface-border bg-slate-50 dark:bg-darkSurface-bg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none transition font-medium"
    >
      <option value="operator">Operador</option>
      <option value="admin">Admin</option>
    </select>
  );

/**
 * Linha da tabela de usuários.
 */
export const UserRow = ({
  user,
  isCurrentUser,
  isProtected,
  onRoleChange,
  onResetPassword,
  onToggleActive,
  onDelete,
}) => {
  const isInactive = user.is_active === false;

  return (
    <tr
      className={`hover:bg-slate-50 dark:hover:bg-darkSurface-cardHover/50 transition ${
        isInactive ? "opacity-60 bg-slate-50/50 dark:bg-darkSurface-bg/30" : ""
      }`}
    >
      <th scope="row" className="px-4 py-3 font-medium text-slate-800 dark:text-white flex items-center space-x-2 text-left">
        <span
          aria-hidden="true"
          className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
            isInactive
              ? "bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
              : "bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300"
          }`}
        >
          {user.name.charAt(0)}
        </span>
        <span className="flex flex-col">
          <span className={isInactive ? "line-through text-slate-400" : ""}>{user.name}</span>
          {isCurrentUser && <span className="text-[10px] text-brand-500 font-semibold">(Você)</span>}
        </span>
      </th>
      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{user.email}</td>
      <td className="px-4 py-3">
        <UserStatusBadge isActive={!isInactive} />
      </td>
      <td className="px-4 py-3">
        <RoleCell user={user} isProtected={isProtected} onRoleChange={onRoleChange} />
      </td>
      <td className="px-4 py-3 text-right">
        <UserActions
          isProtected={isProtected}
          isInactive={isInactive}
          onResetPassword={onResetPassword}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
};
