import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { StatusScreen } from "../components/StatusScreen";

/**
 * Página 404. O link de volta ao painel só aparece para usuários logados,
 * para não expor o caminho do sistema interno a quem acessa um link público errado.
 */
export const NotFound = () => {
  const { user } = useAuth();

  return (
    <StatusScreen
      icon={<Compass size={30} />}
      iconClassName="w-16 h-16 bg-brand-100 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400"
      title="Página não encontrada"
      titleClassName="text-2xl"
    >
      <p className="text-6xl font-extrabold font-heading text-slate-200 dark:text-darkSurface-border mb-3 select-none" aria-hidden="true">
        404
      </p>

      {user ? (
        <>
          <p className="text-sm text-slate-500 dark:text-darkSurface-muted mb-6">
            O endereço acessado não existe ou foi removido.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-sm transition"
          >
            <ArrowLeft size={15} />
            <span>Voltar ao painel</span>
          </Link>
        </>
      ) : (
        <p className="text-sm text-slate-500 dark:text-darkSurface-muted">
          O endereço acessado não existe. Se você recebeu um link de formulário,
          confira se ele foi copiado por completo ou solicite um novo link ao responsável pela sua implantação.
        </p>
      )}
    </StatusScreen>
  );
};
