import { Info } from 'lucide-react';
import logoBip360 from '../../assets/images/logo-bip360.png';
import { FormProgress } from '../FormProgress';

const FillingGuide = () => (
  <aside className="mt-4 p-3.5 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-xl text-xs text-amber-900 dark:text-amber-300 flex items-start gap-2.5">
    <Info size={18} className="shrink-0 text-amber-600 mt-0.5" />
    <div className="space-y-1">
      <strong className="font-bold block">Como preencher este formulário:</strong>
      <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800 dark:text-amber-400">
        <li>Preencha os campos com os dados oficiais da loja. O status muda automaticamente para <strong>OK</strong> ao preencher.</li>
        <li>As orientações e exemplos abaixo dos campos servem como referência de formato.</li>
        <li>Caso a loja não vá operar com Pix, selecione a opção <em>"Não se aplica (N/A)"</em> na seção 3 para não contar no progresso.</li>
      </ul>
    </div>
  </aside>
);

/**
 * Banner superior do formulário público: logo, título, loja, progresso e guia de preenchimento.
 */
export const PublicFormHeader = ({ storeName, progress }) => {
  return (
    <header className="bg-white dark:bg-darkSurface-card rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 dark:border-darkSurface-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-darkSurface-border">
        <hgroup>
          <div className="flex items-center gap-3 mb-2">
            <img
              src={logoBip360}
              alt="BIP360 Sistemas"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[11px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2.5 py-1 rounded-md border border-brand-200 dark:border-brand-900/40">
              ATIVAÇÃO SITEF
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white mt-2">
            Formulário de credenciamento TEF / Pix para ativação da loja no SiTef
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-darkSurface-muted mt-1">
            Loja / Unidade: <strong className="text-slate-700 dark:text-slate-300">{storeName}</strong>
          </p>
        </hgroup>

        <FormProgress
          percentage={progress.percentage}
          completedCount={progress.completedCount}
          totalCount={progress.totalCount}
        />
      </div>

      <FillingGuide />
    </header>
  );
};
