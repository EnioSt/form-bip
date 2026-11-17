/**
 * Par rótulo/valor de uma lista de descrição (<dl>).
 * - className: classes do wrapper (ex: "sm:col-span-2")
 * - valueClassName: estilo do valor (padrão: texto forte)
 */
export const DetailItem = ({
  label,
  className,
  valueClassName = "font-semibold text-slate-800 dark:text-white",
  children,
}) => {
  return (
    <div className={className}>
      <dt className="text-xs text-slate-400 block font-medium">{label}</dt>
      <dd className={valueClassName}>{children}</dd>
    </div>
  );
};
