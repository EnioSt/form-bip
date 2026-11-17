import { QrCode } from 'lucide-react';
import { FormSection } from '../FormSection';
import { FormField } from '../FormField';
import { FormInput } from '../FormInput';
import { Checkbox } from '../Checkbox';

const NotApplicableToggle = ({ register }) => (
  <Checkbox
    name="pix_nao_se_aplica"
    register={register}
    inputClassName="w-4 h-4 rounded text-slate-600 border-slate-300"
    className="flex items-center space-x-2 cursor-pointer bg-slate-100 dark:bg-darkSurface-cardHover px-3 py-1.5 rounded-lg border border-slate-200 dark:border-darkSurface-border text-xs font-semibold text-slate-700 dark:text-slate-300"
  >
    Não se aplica (N/A)
  </Checkbox>
);

const NotApplicableNotice = () => (
  <p className="p-4 rounded-xl bg-slate-50 dark:bg-darkSurface-bg border border-dashed border-slate-300 dark:border-darkSurface-border text-center text-xs text-slate-500">
    Seção marcada como <strong>Não se aplica (N/A)</strong> para esta loja. Não contabilizada no progresso.
  </p>
);

/**
 * Seção 3: Credenciamento Pix.
 * Os campos 15–17 só aparecem quando a opção "Não se aplica" não está marcada.
 */
export const PixSection = ({ register, errors = {}, status = {}, isNotApplicable }) => {
  return (
    <FormSection
      id="pix"
      icon={QrCode}
      title="3. CREDENCIAMENTO PIX"
      note="ⓘ Caso deseje operar com Pix, a chave Pix precisa ser habilitada para uso no TEF"
      action={<NotApplicableToggle register={register} />}
    >
      {isNotApplicable ? (
        <NotApplicableNotice />
      ) : (
        <div className="space-y-4">
          <FormInput
            name="pix_psp_banco"
            label="#15. Identificação do PSP (Banco) *"
            register={register}
            error={errors.pix_psp_banco}
            status={status[15]}
            placeholder="Ex: Itaú, Bradesco, Santander, Banco do Brasil..."
            hint="Exemplo / orientação: Banco do cliente onde está a chave Pix"
          />

          <FormField
            label="#16. Vinculação com a integração FISERV no Banco *"
            status={status[16]}
            headerClassName="mb-2"
          >
            <p className="text-xs text-slate-500 dark:text-darkSurface-muted mb-2">
              Exemplo / orientação: Realizar no banco e marcar como OK quando concluído
            </p>
            <Checkbox
              name="pix_vinculacao_fiserv_ok"
              register={register}
              className="flex items-center space-x-2 cursor-pointer bg-white dark:bg-darkSurface-card p-2.5 rounded-lg border border-slate-200 dark:border-darkSurface-border text-xs text-slate-700 dark:text-slate-300"
            >
              <span className="font-semibold">Vinculação com FISERV realizada no internet banking / app do banco</span>
            </Checkbox>
          </FormField>

          <FormInput
            name="pix_chave"
            label="#17. Chave Pix que será utilizada na operação *"
            register={register}
            error={errors.pix_chave}
            status={status[17]}
            placeholder="CNPJ, e-mail, telefone ou chave aleatória"
            hint={'Exemplo / orientação: "CNPJ, e-mail, telefone ou chave aleatória"'}
          />
        </div>
      )}
    </FormSection>
  );
};
