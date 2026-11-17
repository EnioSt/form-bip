import { useState, useEffect } from "react";

/**
 * Acompanha o estado de tela cheia do documento (F11 / Modo Apresentação).
 */
export const useFullscreen = () => {
  const [isFullscreen, setIsFullscreen] = useState(() => !!document.fullscreenElement);

  useEffect(() => {
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Erro ao ativar tela cheia:", err);
      });
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return { isFullscreen, toggleFullscreen };
};
