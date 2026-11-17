import { Building2, CreditCard, QrCode, Image as ImageIcon } from "lucide-react";
import { DetailSection } from "../DetailSection";
import { DetailItem } from "../DetailItem";

const PANEL = "bg-slate-50 dark:bg-darkSurface-bg/60 p-4 rounded-xl border border-slate-200 dark:border-darkSurface-border";
const STATUS_VALUE = "font-semibold text-emerald-600 dark:text-emerald-400 text-xs";

const StoreSummary = ({ data }) => (
  <DetailSection icon={Building2} title="1. DADOS DA LOJA">
    <dl className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${PANEL}`}>
      <DetailItem label="#1. CNPJ">{data.cnpj || "—"}</DetailItem>
      <DetailItem label="#2. Razão Social">{data.razao_social || "—"}</DetailItem>
      <DetailItem label="#3. Responsável">{data.responsavel || "—"}</DetailItem>
      <DetailItem label="#4. Telefone">{data.telefone || "—"}</DetailItem>
      <DetailItem label="#5. Email da Unidade" className="sm:col-span-2">{data.email_unidade || "—"}</DetailItem>
      <DetailItem label="#6. Endereço" className="sm:col-span-2">{data.endereco || "—"}</DetailItem>
      <DetailItem label="#7. CEP">{data.cep || "—"}</DetailItem>
      <DetailItem label="#8 e #9. Cidade / UF">
        {data.cidade || "—"} / {data.uf || "—"}
      </DetailItem>
    </dl>
  </DetailSection>
);

const AcquirerSummary = ({ data }) => (
  <DetailSection icon={CreditCard} title="2. DADOS DO ADQUIRENTE (SiTEF)">
    <dl className={`grid grid-cols-1 sm:grid-cols-3 gap-3 ${PANEL}`}>
      <DetailItem label="#10. Número Lógico">{data.numero_logico_adquirente || "—"}</DetailItem>
      <DetailItem label="#11. Quantidade de PDVs">{data.qtd_pdvs_tef || "0"}</DetailItem>
      <DetailItem label="#12. Quantidade de TOTEMs">{data.qtd_totems_tef || "0"}</DetailItem>

      <div className="sm:col-span-3 pt-2 border-t border-slate-200/60 dark:border-darkSurface-border/60 flex items-center justify-between">
        <DetailItem label="#13. Foto da Maquininha" valueClassName={STATUS_VALUE}>
          {data.foto_maquininha_ok ? "✓ Marcada como OK" : "Não confirmada"}
        </DetailItem>
        {data.photo_url && (
          <a
            href={data.photo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 bg-white dark:bg-darkSurface-card hover:bg-slate-100 rounded-lg border border-slate-200 dark:border-darkSurface-border text-brand-600 dark:text-brand-400 font-medium transition"
          >
            <ImageIcon size={14} />
            <span>Ver Foto Registrada</span>
          </a>
        )}
      </div>
    </dl>
  </DetailSection>
);

const PixSummary = ({ data }) => (
  <DetailSection icon={QrCode} title="3. CREDENCIAMENTO PIX">
    {data.pix_nao_se_aplica ? (
      <p className="p-3 bg-slate-50 dark:bg-darkSurface-bg/60 rounded-xl border border-slate-200 dark:border-darkSurface-border text-xs text-slate-500">
        Loja optou por <strong>Não se aplica (N/A)</strong> para recebimento com Pix.
      </p>
    ) : (
      <dl className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${PANEL}`}>
        <DetailItem label="#14. Identificação do PSP (Banco)">{data.pix_psp_banco || "—"}</DetailItem>
        <DetailItem label="#15. Integração FISERV no Banco" valueClassName={STATUS_VALUE}>
          {data.pix_vinculacao_fiserv_ok ? "✓ Vinculada e Confirmada" : "Pendente"}
        </DetailItem>
        <DetailItem
          label="#16. Chave Pix Utilizada"
          className="sm:col-span-2"
          valueClassName="font-mono font-semibold text-slate-800 dark:text-white"
        >
          {data.pix_chave || "—"}
        </DetailItem>
      </dl>
    )}
  </DetailSection>
);

/**
 * Resumo somente leitura dos dados preenchidos pelo cliente no formulário SiTEF.
 */
export const FormDataSummary = ({ formData }) => {
  return (
    <>
      <StoreSummary data={formData} />
      <AcquirerSummary data={formData} />
      <PixSummary data={formData} />
    </>
  );
};
