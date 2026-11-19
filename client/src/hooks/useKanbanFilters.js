import { useState, useMemo } from "react";
import { normalizeText } from "../utils/text";

/**
 * Filtros do Kanban: busca por texto (unidade, razão social, cidade) e por operador.
 */
export const useKanbanFilters = (cards, getOperatorName) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [operatorFilter, setOperatorFilter] = useState("all");

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // 1. Filtro por Operador vinculado
      if (operatorFilter !== "all") {
        if (operatorFilter === "unassigned") {
          if (card.operator_id) return false;
        } else if (card.operator_id !== operatorFilter) {
          return false;
        }
      }

      // 2. Filtro por termo de pesquisa (Unidade / Código / Razão Social / Cidade)
      if (searchTerm.trim()) {
        const normalizedSearch = normalizeText(searchTerm);
        const matchCode =
          card.external_id != null &&
          String(card.external_id) === normalizedSearch.replace(/^#/, "");
        const matchTitle = normalizeText(card.title).includes(normalizedSearch);
        const matchRazao =
          card.formData?.razao_social &&
          normalizeText(card.formData.razao_social).includes(normalizedSearch);
        const matchCidade =
          card.formData?.cidade &&
          normalizeText(card.formData.cidade).includes(normalizedSearch);
        if (!matchTitle && !matchCode && !matchRazao && !matchCidade) return false;
      }

      return true;
    });
  }, [cards, searchTerm, operatorFilter]);

  let operatorLabel = null;
  if (operatorFilter === "unassigned") operatorLabel = "Sem Operador";
  else if (operatorFilter !== "all") operatorLabel = getOperatorName(operatorFilter) || "Operador";

  const clearFilters = () => {
    setSearchTerm("");
    setOperatorFilter("all");
  };

  return {
    searchTerm,
    setSearchTerm,
    operatorFilter,
    setOperatorFilter,
    operatorLabel,
    filteredCards,
    clearFilters,
  };
};
