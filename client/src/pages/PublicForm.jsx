import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle, Lock } from 'lucide-react';
import { usePublicForm } from '../hooks/usePublicForm';
import { LoadingScreen } from '../components/LoadingScreen';
import { StatusScreen } from '../components/StatusScreen';
import { PublicFormHeader } from '../components/PublicFormHeader';
import { StoreDataSection } from '../components/StoreDataSection';
import { AcquirerSection } from '../components/AcquirerSection';
import { PixSection } from '../components/PixSection';

export const PublicForm = () => {
  const { token } = useParams();
  const form = usePublicForm(token);
  const { card, progress, formValues, register, errors } = form;

  if (form.status === 'loading') {
    return <LoadingScreen message="Carregando formulário SiTEF..." />;
  }

  if (form.status === 'error') {
    return (
      <StatusScreen
        icon={<AlertTriangle size={28} />}
        iconClassName="w-14 h-14 bg-rose-100 text-rose-600"
        title="Link Não Disponível"
      >
        <p className="text-sm text-slate-500 dark:text-darkSurface-muted">
          {form.error || 'Este formulário não foi encontrado ou expirou.'}
        </p>
      </StatusScreen>
    );
  }

  if (form.status === 'closed') {
    return (
      <StatusScreen
        icon={<Lock size={28} />}
        iconClassName="w-14 h-14 bg-amber-100 text-amber-600"
        title="Formulário Finalizado"
      >
        <p className="text-sm text-slate-500 dark:text-darkSurface-muted mb-2">
          Os dados para ativação de <strong className="text-slate-700 dark:text-slate-300">{card.title}</strong> já foram recebidos com sucesso.
        </p>
        <p className="text-xs text-slate-400">
          Se precisar fazer qualquer alteração cadastral ou técnica, solicite a reabertura à equipe BIP360.
        </p>
      </StatusScreen>
    );
  }

  if (form.status === 'submitted') {
    return (
      <StatusScreen
        icon={<CheckCircle size={36} />}
        iconClassName="w-16 h-16 bg-emerald-100 text-emerald-600"
        title="Formulário Enviado com Sucesso!"
        titleClassName="text-2xl"
      >
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
          Os dados de credenciamento TEF / Pix para a loja <strong>{card.title}</strong> foram salvos e enviados para a fila do SiTef.
        </p>
        <p className="p-3 bg-slate-50 dark:bg-darkSurface-bg rounded-lg text-xs text-slate-500 border border-slate-200 dark:border-darkSurface-border">
          Status do Ticket: <strong>Preenchido</strong>
        </p>
      </StatusScreen>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100 dark:bg-darkSurface-bg text-slate-800 dark:text-darkSurface-text py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        <PublicFormHeader storeName={card.title} progress={progress} />

        <form onSubmit={form.submit} noValidate className="space-y-6">
          <StoreDataSection register={register} errors={errors} status={progress.s1Status} />

          <AcquirerSection
            register={register}
            errors={errors}
            status={progress.s2Status}
            acquirerOptions={form.acquirerOptions}
            acquirer={formValues.adquirente_banco}
            customAcquirer={formValues.adquirente_outro_nome}
            onChangeAcquirer={form.changeAcquirer}
            onChangeCustomAcquirer={form.changeCustomAcquirer}
            uploading={form.uploading}
            previewPhoto={form.previewPhoto}
            onPhotoUpload={form.uploadPhoto}
          />

          <PixSection
            register={register}
            errors={errors}
            status={progress.s3Status}
            isNotApplicable={formValues.pix_nao_se_aplica}
          />

          <footer className="pt-2">
            {Object.keys(errors).length > 0 && (
              <p role="alert" className="mb-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-xs text-center font-medium">
                Existem campos com pendências. Revise os itens destacados em vermelho acima.
              </p>
            )}
            <button
              type="submit"
              disabled={form.isSubmitting}
              className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold rounded-xl shadow-lg shadow-brand-600/25 flex items-center justify-center space-x-2 transition text-base disabled:opacity-50"
            >
              <CheckCircle size={20} />
              <span>{form.isSubmitting ? 'Gravando e Ativando SiTef...' : 'Salvar e Finalizar Formulário SiTef'}</span>
            </button>
            <p className="text-center text-xs text-slate-400 mt-2">
              Ao concluir, os dados serão validados e o card passará para o status "Preenchido" no painel operacional.
            </p>
          </footer>
        </form>
      </div>
    </main>
  );
};
