import { CheckCircle2, AlertCircle } from "lucide-react";

const SIZES = {
  sm: { box: "text-xs items-center", iconSize: 15, iconClass: undefined },
  md: { box: "text-sm items-start", iconSize: 16, iconClass: "shrink-0 mt-0.5" },
};

/**
 * Mensagem de retorno de uma ação (sucesso ou erro).
 * - feedback: { type: 'success' | 'error', message } ou null
 * - size: 'sm' (modais) | 'md' (formulários de página)
 */
export const FeedbackAlert = ({ feedback, size = "sm" }) => {
  if (!feedback) return null;

  const isSuccess = feedback.type === "success";
  const { box, iconSize, iconClass } = SIZES[size];
  const Icon = isSuccess ? CheckCircle2 : AlertCircle;

  return (
    <p
      role={isSuccess ? "status" : "alert"}
      className={`mb-4 p-3 rounded-lg ${box} flex gap-2 border ${
        isSuccess
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
          : "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-900"
      }`}
    >
      <Icon size={iconSize} className={iconClass} />
      <span>{feedback.message}</span>
    </p>
  );
};
