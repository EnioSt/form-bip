/**
 * BIP360 Design Tokens & Theme Configuration
 * 
 * Todas as cores e configurações de tipografia do sistema estão centralizadas aqui.
 * Para mudar a identidade visual, temas, cores de status ou fontes, edite este arquivo.
 */

export const themeConfig = {
  // Configuração de Fontes
  typography: {
    // Fonte primária do sistema. Atualmente usando Inter / Sans-serif padrão do sistema.
    // Para usar uma fonte customizada local (ex: Poppins, Montserrat, Roboto), coloque os arquivos .woff2/.ttf
    // em 'client/src/assets/fonts/' e adicione a diretiva @font-face no 'client/src/theme/theme.css'.
    fontFamily: {
      sans: ['"Inter"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      heading: ['"Inter"', 'system-ui', 'sans-serif'],
      mono: ['"Fira Code"', 'Consolas', 'Monaco', 'monospace'],
    },
  },

  // Paleta de Cores
  colors: {
    // Cor de destaque / Marca principal (BIP360)
    brand: {
      50: '#eef6ff',
      100: '#d9ebff',
      200: '#bcddfe',
      300: '#8ec7fc',
      400: '#59a6f8',
      500: '#3283f3', // Azul principal BIP360
      600: '#1d64e7',
      700: '#174ecc',
      800: '#1941a5',
      900: '#193982',
      950: '#132450',
    },

    // Cores de Apoio / Fundo Claro
    surface: {
      light: '#f8fafc',
      cardLight: '#ffffff',
      borderLight: '#e2e8f0',
      textLight: '#0f172a',
      mutedLight: '#64748b',
    },

    // Cores Dark Mode
    darkSurface: {
      bg: '#090d16',
      card: '#111827',
      cardHover: '#172033',
      border: '#1f293d',
      text: '#f8fafc',
      muted: '#94a3b8',
    },

    // Status do Kanban (Triagem, Preenchido, Implantação, Concluído)
    status: {
      triagem: {
        bg: 'rgba(234, 88, 12, 0.12)',
        border: '#ea580c',
        text: '#c2410c',
        darkBg: 'rgba(249, 115, 22, 0.2)',
        darkText: '#fb923c',
        label: 'Triagem',
      },
      preenchido: {
        bg: 'rgba(59, 130, 246, 0.12)',
        border: '#3b82f6',
        text: '#1d4ed8',
        darkBg: 'rgba(59, 130, 246, 0.2)',
        darkText: '#60a5fa',
        label: 'Preenchido',
      },
      implantacao: {
        bg: 'rgba(168, 85, 247, 0.12)',
        border: '#a855f7',
        text: '#7e22ce',
        darkBg: 'rgba(168, 85, 247, 0.2)',
        darkText: '#c084fc',
        label: 'Em Implantação',
      },
      concluido: {
        bg: 'rgba(34, 197, 94, 0.12)',
        border: '#22c55e',
        text: '#15803d',
        darkBg: 'rgba(34, 197, 94, 0.2)',
        darkText: '#4ade80',
        label: 'Concluído',
      },
    },

    // Estados e Alertas
    feedback: {
      success: '#22c55e',
      warning: '#f59e0b',
      danger: '#ef4444',
      info: '#3b82f6',
    }
  }
};

