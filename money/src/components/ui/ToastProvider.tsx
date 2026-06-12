import { useToastStore } from "~/lib/toast";
import { cn } from "~/lib/format";
import { useTranslation } from "~/lib/i18n";

const KIND_ICON: Record<string, string> = {
  success: "✓",
  error:   "!",
  info:    "i",
};

export function ToastProvider() {
  const { t } = useTranslation();
  const toasts = useToastStore((s) => s.toasts);
  const dismiss = useToastStore((s) => s.dismiss);

  if (toasts.length === 0) return null;

  return (
    <div
      className="toast-stack safe-top pointer-events-none"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          className={cn("toast-bubble pointer-events-auto animate-toast-in", `toast-${toast.kind}`)}
        >
          <span className="toast-icon" aria-hidden>
            {KIND_ICON[toast.kind]}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            type="button"
            className="toast-dismiss"
            aria-label={t("toast.dismiss")}
            onClick={() => dismiss(toast.id)}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
