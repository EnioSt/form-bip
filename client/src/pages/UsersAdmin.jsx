import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useConfirmDialog } from '../hooks/useConfirmDialog';
import { useUsersAdmin } from '../hooks/useUsersAdmin';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { UserForm } from '../components/UserForm';
import { UsersTable } from '../components/UsersTable';

// Admin fixo do sistema: não pode ter função alterada, ser inativado ou excluído
const isProtectedUser = (u) => u.email === 'suporte@bip360.com.br' || u.id === 'usr-admin-1';

export const UsersAdmin = () => {
  const { user: currentUser } = useAuth();
  const [passwordTarget, setPasswordTarget] = useState(null);

  const { openConfirm, closeConfirm, dialogProps } = useConfirmDialog();
  const admin = useUsersAdmin({ openConfirm, closeConfirm });

  return (
    <div className="space-y-8">
      <hgroup>
        <h1 className="text-2xl font-bold font-heading text-slate-900 dark:text-white">
          Gestão de Usuários
        </h1>
        <p className="text-sm text-slate-500 dark:text-darkSurface-muted">
          Área administrativa para cadastro, redefinição de senhas e controle de operadores e administradores
        </p>
      </hgroup>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <UserForm
          values={admin.form}
          feedback={admin.feedback}
          onChange={admin.setFormField}
          onSubmit={admin.createUser}
        />

        <UsersTable
          users={admin.users}
          currentUserId={currentUser?.id}
          isProtected={isProtectedUser}
          onRoleChange={admin.changeRole}
          onResetPassword={setPasswordTarget}
          onToggleActive={admin.toggleActive}
          onDelete={admin.deleteUser}
        />
      </div>

      <ChangePasswordModal
        isOpen={!!passwordTarget}
        targetUser={passwordTarget}
        currentUser={currentUser}
        onClose={() => setPasswordTarget(null)}
        onSuccess={admin.notifyPasswordChanged}
      />

      <ConfirmModal {...dialogProps} />
    </div>
  );
};
