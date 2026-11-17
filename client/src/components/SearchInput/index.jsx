import { Search, X } from 'lucide-react';

export const SearchInput = ({ value, onChange, placeholder, label = placeholder }) => {
  return (
    <div role="search" className="relative flex-1 sm:w-64">
      <Search
        size={15}
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={label}
        className="w-full pl-9 pr-8 py-1.5 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-xs sm:text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-brand-500 shadow-2xs [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition"
          title="Limpar pesquisa"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
};
