import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Link, useRouter } from "@tanstack/react-router";
import { BottomSheet } from "~/components/ui/BottomSheet";
import { Button } from "~/components/ui/Button";
import { CategoryIcon } from "~/components/icons";
import { AppIcon } from "~/components/icons";
import { CATEGORIES, PAYMENT_METHODS } from "~/lib/constants";
import { cn } from "~/lib/format";
import { haptic } from "~/lib/haptics";
import { getPaymentIcon, Icons } from "~/lib/icons";
import { getCategoryShortName, getPaymentLabel, useTranslation } from "~/lib/i18n";
import { getCurrencyConfig } from "~/lib/settings";
import { useSettingsStore } from "~/lib/store";
import { showToast, showErrorToast } from "~/lib/toast";
import { saveTransaction } from "~/lib/transactions-client";
import { useUIStore } from "~/lib/ui-store";
import type { PaymentMethod, TransactionType } from "~/lib/types";

const QUICK_CATEGORIES = 8;

export function QuickAddSheet() {
  const open = useUIStore((s) => s.quickAddOpen);
  const closeQuickAdd = useUIStore((s) => s.closeQuickAdd);
  const lastQuickAdd = useSettingsStore((s) => s.lastQuickAdd);
  const setLastQuickAdd = useSettingsStore((s) => s.setLastQuickAdd);
  const currency = useSettingsStore((s) => s.currency);
  const currencySymbol = getCurrencyConfig(currency).symbol;
  const { t, language } = useTranslation();
  const router = useRouter();
  const amountRef = useRef<HTMLInputElement>(null);

  const [type, setType] = useState<TransactionType>(lastQuickAdd?.type ?? "expense");
  const [amount, setAmount] = useState(lastQuickAdd?.amount ?? "");
  const [categoryId, setCategoryId] = useState(lastQuickAdd?.categoryId ?? "food");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(lastQuickAdd?.paymentMethod ?? "cash");
  const [saving, setSaving] = useState(false);
  const [amountError, setAmountError] = useState("");

  const visibleCategories = useMemo(
    () => CATEGORIES.filter((c) => c.type === type).slice(0, QUICK_CATEGORIES),
    [type],
  );

  useEffect(() => {
    if (!open) return;
    setType(lastQuickAdd?.type ?? "expense");
    setCategoryId(lastQuickAdd?.categoryId ?? (lastQuickAdd?.type === "income" ? "salary" : "food"));
    setPaymentMethod(lastQuickAdd?.paymentMethod ?? "cash");
    setAmount(lastQuickAdd?.amount ?? "");
    setAmountError("");
    const timer = window.setTimeout(() => amountRef.current?.focus(), 280);
    return () => window.clearTimeout(timer);
  }, [open, lastQuickAdd]);

  const handleTypeChange = (next: TransactionType) => {
    setType(next);
    setCategoryId(next === "expense" ? "food" : "salary");
  };

  const handleAmountInput = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setAmount(cleaned);
    if (amountError) setAmountError("");
  };

  const applyLast = () => {
    if (!lastQuickAdd) return;
    setType(lastQuickAdd.type);
    setCategoryId(lastQuickAdd.categoryId);
    setPaymentMethod(lastQuickAdd.paymentMethod);
    if (lastQuickAdd.amount) setAmount(lastQuickAdd.amount);
    haptic("selection");
  };

  const handleSave = async () => {
    const parsed = parseFloat(amount.replace(/,/g, ""));
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setAmountError(t("form.amountError"));
      amountRef.current?.focus();
      return;
    }

    setSaving(true);
    try {
      const title = getCategoryShortName(categoryId, language);
      const result = await saveTransaction({
        type,
        title,
        amount: parsed,
        categoryId,
        paymentMethod,
        transactionDate: format(new Date(), "yyyy-MM-dd"),
      });
      setLastQuickAdd({ type, categoryId, paymentMethod, amount });
      await router.invalidate();
      haptic("success");
      showToast(result.offline ? t("toast.savedOffline") : t("toast.saved"));
      closeQuickAdd();
    } catch (err) {
      showErrorToast(err instanceof Error ? err.message : t("transaction.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const accentColor = type === "expense" ? "text-coral-400" : "text-income";

  return (
    <BottomSheet
      open={open}
      onClose={() => !saving && closeQuickAdd()}
      title={t("quickAdd.title")}
      description={t("quickAdd.desc")}
    >
      <div className="flex flex-col gap-4 pb-2">
        <div className="flex rounded-xl border border-app bg-surface-muted p-1">
          {(["expense", "income"] as TransactionType[]).map((txType) => (
            <button
              key={txType}
              type="button"
              disabled={saving}
              onClick={() => handleTypeChange(txType)}
              className={cn(
                "flex-1 min-h-[44px] rounded-xl py-2.5 text-caption font-semibold transition-all duration-200 disabled:opacity-50",
                type === txType
                  ? txType === "expense"
                    ? "bg-coral-400 text-white shadow-sm"
                    : "bg-income text-white shadow-sm"
                  : "text-fg-muted",
              )}
            >
              {txType === "expense" ? t("form.expense") : t("form.income")}
            </button>
          ))}
        </div>

        <div className={cn("quick-add-amount card-surface-elevated p-4", amountError && "field-error")}>
          <label className="block text-label text-fg-muted mb-2" htmlFor="quick-amount">
            {t("form.amount", { symbol: currencySymbol })}
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-app bg-card px-3 py-2 min-h-[52px]">
            <span className={cn("text-headline font-bold tabular-nums", accentColor)} aria-hidden>
              {type === "expense" ? "−" : "+"}
            </span>
            <input
              id="quick-amount"
              ref={amountRef}
              type="text"
              inputMode="decimal"
              placeholder={t("form.amountPlaceholder")}
              value={amount}
              disabled={saving}
              onChange={(e) => handleAmountInput(e.target.value)}
              className="min-w-0 flex-1 bg-transparent text-display font-bold tabular-nums text-fg outline-none placeholder:text-fg-subtle"
            />
          </div>
          {amountError && (
            <p className="mt-2 text-caption text-coral-400 font-medium" role="alert">{amountError}</p>
          )}
        </div>

        <div>
          <p className="text-label text-fg-muted mb-2">{t("form.category")}</p>
          <div className="grid grid-cols-4 gap-2">
            {visibleCategories.map((cat) => {
              const selected = categoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={saving}
                  onClick={() => { setCategoryId(cat.id); haptic("selection"); }}
                  className={cn(
                    "flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-xl border px-1 py-2 transition-colors disabled:opacity-50",
                    selected
                      ? "border-mint-500/35 bg-mint-500/10"
                      : "border-app bg-card active:bg-surface-muted",
                  )}
                >
                  <CategoryIcon categoryId={cat.id} size="sm" />
                  <span className="text-micro text-center leading-tight text-fg line-clamp-2">
                    {getCategoryShortName(cat.id, language)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-label text-fg-muted mb-2">{t("form.payment")}</p>
          <div className="flex gap-2">
            {PAYMENT_METHODS.map(({ value }) => {
              const Icon = getPaymentIcon(value);
              const selected = paymentMethod === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={saving}
                  onClick={() => { setPaymentMethod(value); haptic("selection"); }}
                  className={cn(
                    "flex min-h-[44px] flex-1 items-center justify-center gap-1.5 rounded-xl border px-2 text-caption font-semibold transition-colors disabled:opacity-50",
                    selected
                      ? "border-mint-500/35 bg-mint-500/10 text-fg"
                      : "border-app bg-card text-fg-muted active:bg-surface-muted",
                  )}
                >
                  <AppIcon icon={Icon} size="sm" />
                  {getPaymentLabel(value, language)}
                </button>
              );
            })}
          </div>
        </div>

        {lastQuickAdd && (
          <button
            type="button"
            disabled={saving}
            onClick={applyLast}
            className="flex min-h-[44px] items-center justify-center gap-2 rounded-xl border border-dashed border-app bg-card px-3 text-caption font-semibold text-fg-muted active:bg-surface-muted disabled:opacity-50"
          >
            <AppIcon icon={Icons.action.hand} size="sm" />
            {t("quickAdd.repeatLast")}
          </button>
        )}

        <div className="flex flex-col gap-2 pt-1">
          <Button
            size="lg"
            fullWidth
            loading={saving}
            disabled={saving}
            onClick={() => { void handleSave(); }}
          >
            {type === "expense" ? t("form.addExpense") : t("form.addIncome")}
          </Button>
          <Link
            to="/add"
            onClick={() => closeQuickAdd()}
            className="flex min-h-[44px] items-center justify-center rounded-xl text-caption font-semibold text-primary active:opacity-80"
          >
            {t("quickAdd.openFullForm")}
          </Link>
        </div>
      </div>
    </BottomSheet>
  );
}
