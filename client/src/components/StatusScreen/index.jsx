/**
 * Tela cheia com mensagem centralizada usada nos estados do formulário público
 * (link indisponível, formulário finalizado, envio concluído).
 * - iconClassName: tamanho e cores do círculo do ícone (ex: "w-14 h-14 bg-rose-100 text-rose-600")
 * - titleClassName: tamanho do título (ex: "text-xl")
 */
export const StatusScreen = ({ icon, iconClassName, title, titleClassName = 'text-xl', children }) => {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-darkSurface-bg flex items-center justify-center p-4">
      <article className="max-w-md w-full bg-white dark:bg-darkSurface-card p-8 rounded-2xl border border-slate-200 dark:border-darkSurface-border text-center shadow-lg">
        <figure className={`${iconClassName} rounded-full flex items-center justify-center mx-auto mb-4`}>
          {icon}
        </figure>
        <h2 className={`${titleClassName} font-bold font-heading text-slate-800 dark:text-white mb-2`}>
          {title}
        </h2>
        {children}
      </article>
    </main>
  );
};
