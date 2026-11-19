import { useEffect, useRef } from "react";

/**
 * Executa `callback` periodicamente para manter a tela sincronizada com o servidor.
 * - Pausa enquanto a aba está em segundo plano (economiza requisições)
 * - Atualiza na hora quando o usuário volta para a aba
 * - intervalMs: intervalo entre atualizações (padrão 30s)
 */
export const useAutoRefresh = (callback, intervalMs = 30000) => {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const refresh = () => {
      if (!document.hidden) callbackRef.current();
    };

    const intervalId = setInterval(refresh, intervalMs);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [intervalMs]);
};
