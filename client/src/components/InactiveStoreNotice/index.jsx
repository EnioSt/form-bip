import { Ban } from "lucide-react";
import { getInactiveInfo } from "../../utils/storeStatus";

/**
 * Aviso no modal de detalhes quando a loja está inativa: motivo, desde quando
 * e o impacto nos relatórios (os dados ficam preservados no histórico do card).
 */
export const InactiveStoreNotice = ({ card }) => {
  const { isInactive, byFranchise, since } = getInactiveInfo(card);
  if (!isInactive) return null;

  const pdvs = card.formData?.qtd_pdvs_tef || 0;
  const totems = card.formData?.qtd_totems_tef || 0;

  return (
    <aside
      role="note"
      className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3"
    >
      <Ban size={18} className="text-rose-500 shrink-0 mt-0.5" />
      <div className="space-y-1 text-xs text-rose-800 dark:text-rose-200">
        <p className="font-bold text-sm">
          {byFranchise ? "Loja inativada pela franqueadora" : "Loja inativada manualmente"}
          {since && <span className="font-medium"> em {since}</span>}
        </p>
        <p>
          {byFranchise
            ? "Esta unidade não consta mais na API de franquias ativas. Se ela voltar a constar, o card é reativado automaticamente."
            : "Esta unidade foi inativada por um operador. Use o interruptor no topo para reativá-la."}
        </p>
        <p>
          Os <strong>{pdvs} PDV(s)</strong> e <strong>{totems} TOTEM(s)</strong> desta loja não são
          contabilizados nos relatórios. Os dados abaixo ficam preservados no histórico do card.
        </p>
      </div>
    </aside>
  );
};
