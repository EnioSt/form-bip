import { Building2 } from 'lucide-react';
import { FormSection } from '../FormSection';
import { FormInput } from '../FormInput';
import { FormSelect } from '../FormSelect';
import { BRAZILIAN_STATES } from '../../utils/brazilianStates';

/**
 * Seção 1: Dados da Loja (campos 1–9).
 */
export const StoreDataSection = ({ register, errors = {}, status = {} }) => {
  const field = (name, id) => ({ name, register, error: errors[name], status: status[id], required: true });

  return (
    <FormSection id="store" icon={Building2} title="1. DADOS DA LOJA">
      <div className="space-y-4">
        <FormInput
          {...field('cnpj', 1)}
          label="#1. CNPJ *"
          placeholder="12.345.678/0001-90"
          hint="Exemplo / orientação: 12.345.678/0001-90"
        />

        <FormInput
          {...field('razao_social', 2)}
          label="#2. Razão Social *"
          placeholder="Exemplo Comércio de Alimentos Ltda"
          hint="Exemplo / orientação: Exemplo Comércio de Alimentos Ltda"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            {...field('responsavel', 3)}
            label="#3. Responsável *"
            placeholder="Maria Souza"
            hint="Exemplo / orientação: Maria Souza"
          />
          <FormInput
            {...field('telefone', 4)}
            type="tel"
            label="#4. Telefone *"
            placeholder="(17) 99999-0000"
            hint="Exemplo / orientação: (17) 99999-0000"
          />
        </div>

        <FormInput
          {...field('email_unidade', 5)}
          type="email"
          label="#5. Email da Unidade *"
          placeholder="loja1@chiquinho.com.br"
          hint="Exemplo / orientação: loja1@chiquinho.com.br"
        />

        <FormInput
          {...field('endereco', 6)}
          label="#6. Endereço *"
          placeholder="Rua das Flores, 123 - Centro"
          hint={'Exemplo / orientação: "Rua das Flores, 123 - Centro"'}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            {...field('cep', 7)}
            label="#7. CEP *"
            placeholder="15000-000"
            hint="Exemplo: 15000-000"
          />
          <FormInput
            {...field('cidade', 8)}
            label="#8. Cidade *"
            placeholder="São José do Rio Preto"
            hint="Exemplo: São José do Rio Preto"
          />
          <FormSelect
            {...field('uf', 9)}
            label="#9. UF *"
            options={BRAZILIAN_STATES}
            placeholder="Selecione o estado"
            hint="Selecione o estado da loja"
          />
        </div>
      </div>
    </FormSection>
  );
};
