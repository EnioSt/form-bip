const formatDate = (iso) => new Date(iso).toLocaleDateString("pt-BR");

/**
 * Descreve a situação de inatividade de uma loja (card).
 * - byFranchise: inativada automaticamente por não constar mais na API de franquias ativas
 *   (não pode ser reativada manualmente; volta sozinha se reaparecer na API)
 */
export const getInactiveInfo = (card) => {
  const isInactive = card.is_active === false;
  const byFranchise = isInactive && card.inactive_reason === "franchise_api";

  return {
    isInactive,
    byFranchise,
    badgeLabel: byFranchise ? "Inativada pela Franqueadora" : "Loja Inativa",
    since: isInactive && card.inactivated_at ? formatDate(card.inactivated_at) : null,
  };
};
