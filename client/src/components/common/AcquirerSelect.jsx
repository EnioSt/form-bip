import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, X, AlertCircle } from "lucide-react";

function normalizeText(text = "") {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function AcquirerSelect({
  options = [],
  value = "",
  customValue = "",
  onChangeSelect,
  onChangeCustomValue,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Fecha o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
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

  const isOther = value === "Outro";

  // Filtra opções com base na busca
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
      {/* Botão Seletor Customizado com Dropdown e Busca */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3.5 py-2.5 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-lg text-sm text-left flex items-center justify-between shadow-2xs hover:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition"
        >
          <span
            className={
              value
                ? "text-slate-900 dark:text-white font-medium"
                : "text-slate-400"
            }
          >
            {value === "Outro"
              ? "Outro (Informe o nome do Adquirente)"
              : value || "Selecione a adquirente..."}
          </span>
          <ChevronDown
            size={16}
            className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        {/* Menu Dropdown com Busca Embutida */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-darkSurface-card border border-slate-200 dark:border-darkSurface-border rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Input de Pesquisa Rápida */}
            <div className="p-2 border-b border-slate-100 dark:border-darkSurface-border bg-slate-50 dark:bg-darkSurface-bg/70 flex items-center gap-2">
              <Search size={14} className="text-slate-400 shrink-0 ml-1" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar adquirente..."
                className="w-full bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400 py-1"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Lista de Opções Rolável */}
            <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 custom-scrollbar text-xs">
              {filteredOptions.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelect(opt)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between font-medium transition ${
                      isSelected
                        ? "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold"
                        : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && (
                      <Check
                        size={14}
                        className="text-brand-600 dark:text-brand-400"
                      />
                    )}
                  </button>
                );
              })}

              {filteredOptions.length === 0 && (
                <div className="p-3 text-center text-slate-400 text-xs italic">
                  Nenhum adquirente encontrado com "{searchTerm}"
                </div>
              )}

              {/* Opção Fixa: Outro */}
              <div className="pt-1 mt-1 border-t border-slate-100 dark:border-darkSurface-border">
                <button
                  type="button"
                  onClick={() => handleSelect("Outro")}
                  className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between font-medium transition ${
                    value === "Outro"
                      ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-semibold"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover"
                  }`}
                >
                  <span>Outro (Informe o nome do Adquirente)</span>
                  {value === "Outro" && (
                    <Check size={14} className="text-amber-600" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Campo digitável condicional se "Outro" for selecionado */}
      {isOther && (
        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/90 dark:border-amber-900/50 rounded-xl space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <label className="block text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <AlertCircle
              size={14}
              className="text-amber-600 dark:text-amber-400"
            />
            <span>Nome do Adquirente Não Listado *</span>
          </label>
          <input
            type="text"
            required={required}
            value={customValue}
            onChange={(e) => onChangeCustomValue(e.target.value)}
            placeholder="Ex: C6 Bank, SafraPay, Vero Banrisul, Mercado Pago..."
            className="w-full px-3 py-2 bg-white dark:bg-darkSurface-card border border-amber-300 dark:border-amber-800 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
          />
          <span className="text-[11px] text-amber-800/80 dark:text-amber-300/80 block">
            Informe a razão ou nome comercial da empresa adquirente onde você
            possui credenciamento ativo.
          </span>
        </div>
      )}
    </div>
  );
}
