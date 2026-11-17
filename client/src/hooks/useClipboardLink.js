import { useState } from "react";

const FEEDBACK_DURATION_MS = 2500;

/**
 * Copia o link público do formulário de um card e mantém o token "copiado"
 * por alguns segundos para feedback visual.
 */
export const useClipboardLink = () => {
  const [copiedToken, setCopiedToken] = useState(null);

  const copyFormLink = (uniqueToken, e) => {
    if (e) e.stopPropagation();
    const url = `${window.location.origin}/form/${uniqueToken}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(uniqueToken);
    setTimeout(() => setCopiedToken(null), FEEDBACK_DURATION_MS);
  };

  return { copiedToken, copyFormLink };
};
