import { CreditCard } from 'lucide-react';
import { AcquirerSelect } from '../AcquirerSelect';
import { FormSection } from '../FormSection';
import { FormField } from '../FormField';
import { FormInput } from '../FormInput';
import { PhotoUpload } from '../PhotoUpload';

/**
 * Seção 2: Dados do Adquirente (campos 10–14).
 * - acquirer / customAcquirer: valores atuais (watch) do select de adquirente
 * - onChangeAcquirer / onChangeCustomAcquirer: atualizam o form via setValue na página
 */
export const AcquirerSection = ({
  register,
  errors = {},
  status = {},
  acquirerOptions,
  acquirer,
  customAcquirer,
  onChangeAcquirer,
  onChangeCustomAcquirer,
  uploading,
  previewPhoto,
  onPhotoUpload
}) => {
  return (
    <FormSection
      id="acquirer"
      icon={CreditCard}
      title="2. DADOS DO ADQUIRENTE"
      note="ⓘ Solicitar ao adquirente contratado para transacionar no SiTEF"
    >
      <div className="space-y-4">
        <FormField
          label="#10. Adquirente / Empresa TEF *"
          status={status[10]}
          error={errors.adquirente_banco}
          errorId="adquirente_banco-error"
          headerClassName="mb-1.5"
        >
          <AcquirerSelect
            options={acquirerOptions}
            value={acquirer}
            customValue={customAcquirer}
            customError={errors.adquirente_outro_nome}
            required
            onChangeSelect={onChangeAcquirer}
            onChangeCustomValue={onChangeCustomAcquirer}
          />
          <small className="text-[11px] text-slate-400 block mt-1">
            Selecione sua empresa de maquininha/TEF. Se não encontrar na lista, escolha "Outro" e digite o nome.
          </small>
        </FormField>

        <FormInput
          name="numero_logico_adquirente"
          label="#11. Número Lógico da Adquirente *"
          register={register}
          error={errors.numero_logico_adquirente}
          status={status[11]}
          required
          placeholder="Ex: 12345678"
          hint="Exemplo / orientação: Informado pela adquirente"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            name="qtd_pdvs_tef"
            label="#12. Quantidade de PDVs com TEF (terminais) *"
            register={register}
            error={errors.qtd_pdvs_tef}
            status={status[12]}
            type="number"
            min="0"
            required
            placeholder="1"
            hint="Exemplo / orientação: 1"
          />
          <FormInput
            name="qtd_totems_tef"
            label="#13. Quantidade de TOTEMs com TEF (terminais) *"
            register={register}
            error={errors.qtd_totems_tef}
            status={status[13]}
            type="number"
            min="0"
            required
            placeholder="0"
            hint="Exemplo / orientação: 0"
          />
        </div>

        <PhotoUpload
          register={register}
          status={status[14]}
          uploading={uploading}
          previewPhoto={previewPhoto}
          onUpload={onPhotoUpload}
        />
      </div>
    </FormSection>
  );
};
