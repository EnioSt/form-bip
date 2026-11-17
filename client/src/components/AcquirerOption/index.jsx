import { Check } from "lucide-react";

const VARIANTS = {
  default: {
    selected: "bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 font-semibold",
    idle: "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover",
    check: "text-brand-600 dark:text-brand-400",
  },
  other: {
    selected: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-semibold",
    idle: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-darkSurface-cardHover",
    check: "text-amber-600",
  },
};

/**
 * Opção do dropdown de adquirentes.
 * - variant "other": destaque âmbar usado na opção fixa "Outro"
 */
export const AcquirerOption = ({ label, isSelected, onSelect, variant = "default" }) => {
  const styles = VARIANTS[variant];

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between font-medium transition ${
        isSelected ? styles.selected : styles.idle
      }`}
    >
      <span>{label}</span>
      {isSelected && <Check size={14} className={styles.check} />}
    </button>
  );
};
