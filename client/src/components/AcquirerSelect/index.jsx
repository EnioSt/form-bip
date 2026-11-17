import { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { AcquirerOption } from "../AcquirerOption";
import { CustomAcquirerInput } from "../CustomAcquirerInput";

const OTHER = "Outro";
const OTHER_LABEL = "Outro (Informe o nome do Adquirente)";

const normalizeText = (text = "") =>
  text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const SearchBox = ({ inputRef, value, onChange }) => (
  <div role="search" className="p-2 border-b border-slate-100 dark:border-darkSurface-border bg-slate-50 dark:bg-darkSurface-bg/70 flex items-center gap-2">
    <Search size={14} aria-hidden="true" className="text-slate-400 shrink-0 ml-1" />
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label="Pesquisar adquirente"
      placeholder="Pesquisar adquirente..."
      className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 py-1"
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        aria-label="Limpar pesquisa"
        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
      >
        <X size={13} />
      </button>
    )}
  </div>
);

/**
 * Select customizado de adquirente com busca embutida e opção "Outro" (campo livre).
 */
export const AcquirerSelect = ({
  options = [],
  value = "",
  customValue = "",
  onChangeSelect,
  onChangeCustomValue,
  required = false,
  customError,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Foca o input de pesquisa ao abrir
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    } else {
      setSearchTerm("");
    }
  }, [isOpen]);

  const isOther = value === OTHER;

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const norm = normalizeText(searchTerm);
    return options.filter((opt) => normalizeText(opt).includes(norm));
  }, [options, searchTerm]);

  const handleSelect = (opt) => {
    onChangeSelect(opt);
    setIsOpen(false);
  };

  return (
    <div className="space-y-3" ref={dropdownRef}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className="w-full px-3.5 py-2.5 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-left flex items-center justify-between shadow-2xs hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
        >
          <span className={value ? "text-slate-900 dark:text-white font-medium" : "text-slate-400"}>
            {isOther ? OTHER_LABEL : value || "Selecione a adquirente..."}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <SearchBox inputRef={searchInputRef} value={searchTerm} onChange={setSearchTerm} />

            <div role="listbox" className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar text-xs">
              {filteredOptions.map((opt) => (
                <AcquirerOption
                  key={opt}
                  label={opt}
                  isSelected={value === opt}
                  onSelect={() => handleSelect(opt)}
                />
              ))}

              {filteredOptions.length === 0 && (
                <p className="p-3 text-center text-slate-400 text-xs italic">
                  Nenhum adquirente encontrado com "{searchTerm}"
                </p>
              )}

              {/* Opção Fixa: Outro */}
              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-darkSurface-border">
                <AcquirerOption
                  label={OTHER_LABEL}
                  variant="other"
                  isSelected={isOther}
                  onSelect={() => handleSelect(OTHER)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {isOther && (
        <CustomAcquirerInput
          value={customValue}
          onChange={onChangeCustomValue}
          required={required}
          error={customError}
        />
      )}
    </div>
  );
};
