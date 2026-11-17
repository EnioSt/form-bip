import { KeyRound, Power, Trash2 } from "lucide-react";

/**
 * Ações da linha de usuário: redefinir senha, ativar/inativar e excluir.
 * Usuários protegidos (admin fixo) só permitem redefinir senha.
 */
export const UserActions = ({ isProtected, isInactive, onResetPassword, onToggleActive, onDelete }) => {
  return (
    <div className="flex items-center justify-end space-x-1.5">
      <button
        type="button"
        onClick={onResetPassword}
        className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover rounded-lg transition"
        title="Redefinir Senha deste usuário"
      >
        <KeyRound size={15} />
      </button>

      {!isProtected && (
        <>
          <button
            type="button"
            onClick={onToggleActive}
            className={`p-1.5 rounded-lg transition ${
              isInactive
                ? "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                : "text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
            }`}
            title={isInactive ? "Ativar usuário" : "Inativar usuário (impede login e novas vinculações)"}
          >
            <Power size={15} />
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
            title="Excluir usuário permanentemente"
          >
            <Trash2 size={15} />
          </button>
        </>
      )}
    </div>
  );
};
