/**
 * Tela cheia de carregamento com spinner.
 */
export const LoadingScreen = ({ message }) => {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkSurface-bg flex items-center justify-center p-4">
      <div role="status" className="text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm text-slate-500 dark:text-darkSurface-muted font-medium">{message}</p>
      </div>
    </main>
  );
};
