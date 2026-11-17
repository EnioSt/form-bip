/**
 * Linha da tabela de produtividade com os números de um operador.
 */
export const OperatorStatsRow = ({ operator }) => {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-darkSurface-cardHover/50 transition">
      <th scope="row" className="px-4 py-3.5 font-medium text-slate-800 dark:text-white flex items-center space-x-2.5 text-left">
        <span aria-hidden="true" className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-300 flex items-center justify-center font-bold text-xs">
          {operator.name.charAt(0)}
        </span>
        <span>
          <span className="block font-semibold text-sm">{operator.name}</span>
          <span className="block text-[11px] text-slate-400">{operator.email}</span>
        </span>
      </th>

      <td className="px-4 py-3.5 text-center font-bold text-slate-700 dark:text-slate-200">
        {operator.totalVinculados}
      </td>

      <td className="px-4 py-3.5 text-center font-bold text-purple-600 dark:text-purple-400">
        {operator.emImplantacao}
      </td>

      <td className="px-4 py-3.5 text-center font-bold text-emerald-600 dark:text-emerald-400">
        {operator.concluidos}
      </td>

      <td className="px-4 py-3.5 text-center">
        <span className="inline-flex items-center space-x-2">
          <span aria-hidden="true" className="w-16 bg-slate-200 dark:bg-darkSurface-bg rounded-full h-2 overflow-hidden">
            <span className="block bg-emerald-500 h-2 rounded-full" style={{ width: `${operator.taxaConclusao}%` }} />
          </span>
          <span className="font-bold text-xs text-slate-700 dark:text-slate-300">{operator.taxaConclusao}%</span>
        </span>
      </td>
    </tr>
  );
};
