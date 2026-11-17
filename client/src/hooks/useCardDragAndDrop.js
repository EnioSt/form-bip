import { useState } from "react";

/**
 * Drag and drop nativo dos cards entre colunas.
 * - onDrop(card, targetColumnId): chamado ao soltar um card em outra coluna
 */
export const useCardDragAndDrop = (onDrop) => {
  const [draggedCard, setDraggedCard] = useState(null);

  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.setData("text/plain", card.id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => setDraggedCard(null);

  const handleDropCard = (targetColumnId) => {
    if (!draggedCard) return;
    const card = draggedCard;
    setDraggedCard(null);

    // Se já estiver na mesma coluna, não faz nada
    if (card.status === targetColumnId) return;

    onDrop(card, targetColumnId);
  };

  return { draggedCard, handleDragStart, handleDragEnd, handleDropCard };
};
