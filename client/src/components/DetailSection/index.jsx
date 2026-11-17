/**
 * Bloco titulado do modal de detalhes (título em caixa alta com ícone + conteúdo).
 * - aside: elemento opcional à direita do título
 */
export const DetailSection = ({ icon: Icon, title, aside, className = "space-y-3", children }) => {
  const heading = (
    <h4 className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider">
      <Icon size={16} />
      <span>{title}</span>
    </h4>
  );

  return (
    <section className={className}>
      {aside ? (
        <header className="flex items-center justify-between">
          {heading}
          {aside}
        </header>
      ) : (
        heading
      )}
      {children}
    </section>
  );
};
