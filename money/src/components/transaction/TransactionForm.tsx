import { useRef, useState } from "react";
import type React from "react";
import { format } from "date-fns";
import { DatePicker } from "~/components/ui/DatePicker";
import { MobileHeader } from "~/components/app/MobileHeader";
import { PageLayout } from "~/components/app/PageLayout";
import { Button } from "~/components/ui/Button";
import { CategoryIcon } from "~/components/icons";
import { AppIcon } from "~/components/icons";
import { CATEGORIES, PAYMENT_METHODS } from "~/lib/constants";
import { cn } from "~/lib/format";
import { getPaymentIcon, Icons } from "~/lib/icons";
import { getCurrencyConfig } from "~/lib/settings";
import { useSettingsStore } from "~/lib/store";
import { getCategoryShortName, getPaymentLabel, useTranslation } from "~/lib/i18n";
import type { CreateTransactionInput } from "~/lib/validation";
import type { PaymentMethod, Transaction, TransactionType } from "~/lib/types";
import type { LucideIcon } from "lucide-react";

function AmountStepButton({
  icon,
  label,
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className="flex h-11 w-11 shrink-0 items-center justify-center self-center rounded-xl border border-app bg-surface-muted text-fg-muted transition-colors active:bg-card active:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40 disabled:opacity-40"
    >
      <AppIcon icon={icon} size="sm" strokeWidth={2.5} />
    </button>
  );
}

interface Props {
  mode?:       "create" | "edit";
  initial?:    Transaction;
  onSubmit:    (data: CreateTransactionInput) => Promise<void>;
  onCancel:    () => void;
  onDelete?:   () => void;
  saving?:     boolean;
  deleting?:   boolean;
  error?:      string;
}

type FieldErrors = {
  amount?: string;
  title?:  string;
};

function FormSection({
  label,
  children,
  error,
  fieldRef,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
  fieldRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={fieldRef} className="card-surface p-4 form-field-anchor">
      <label className="block text-label text-fg-muted mb-3">{label}</label>
      {children}
      {error && <p className="mt-2 text-caption text-coral-400 font-medium" role="alert">{error}</p>}
    </div>
  );
}

function buildInitialState(initial?: Transaction) {
  if (!initial) {
    return {
      type:          "expense" as TransactionType,
      amount:        "",
      title:         "",
      categoryId:    "food",
      paymentMethod: "cash" as PaymentMethod,
      date:          format(new Date(), "yyyy-MM-dd"),
      note:          "",
    };
  }
  return {
    type:          initial.type,
    amount:        String(initial.amount),
    title:         initial.title,
    categoryId:    initial.categoryId,
    paymentMethod: initial.paymentMethod,
    date:          initial.transactionDate,
    note:          initial.note ?? "",
  };
}

export function TransactionForm({
  mode = "create",
  initial,
  onSubmit,
  onCancel,
  onDelete,
  saving = false,
  deleting = false,
  error,
}: Props) {
  const currency = useSettingsStore((s) => s.currency);
  const currencySymbol = getCurrencyConfig(currency).symbol;
  const { t, language } = useTranslation();

  const init = buildInitialState(initial);
  const [type,          setType]          = useState<TransactionType>(init.type);
  const [amount,        setAmount]        = useState(init.amount);
  const [title,         setTitle]         = useState(init.title);
  const [categoryId,    setCategoryId]    = useState(init.categoryId);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(init.paymentMethod);
  const [date,          setDate]          = useState(init.date);
  const [note,          setNote]          = useState(init.note);
  const [fieldErrors,   setFieldErrors]   = useState<FieldErrors>({});

  const amountRef = useRef<HTMLDivElement>(null);
  const titleRef  = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  const isEdit = mode === "edit";
  const isBusy = saving || deleting;
  const visibleCategories = CATEGORIES.filter((c) => c.type === type || c.type === "both");

  const handleTypeChange = (t: TransactionType) => {
    setType(t);
    if (!isEdit) setCategoryId(t === "expense" ? "food" : "salary");
  };

  const handleAmountInput = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const parts   = cleaned.split(".");
    if (parts.length > 2) return;
    const decimal = parts[1];
    if (decimal && decimal.length > 2) return;
    setAmount(cleaned);
    if (fieldErrors.amount) setFieldErrors((e) => ({ ...e, amount: undefined }));
  };

  const formatSteppedAmount = (value: number): string => {
    if (value <= 0) return "";
    return String(Math.round(value * 100) / 100);
  };

  const adjustAmount = (delta: number) => {
    if (isBusy) return;
    const parsed = parseFloat(amount);
    const base   = Number.isFinite(parsed) ? parsed : 0;
    const next   = Math.max(0, Math.round((base + delta) * 100) / 100);
    setAmount(formatSteppedAmount(next));
    if (fieldErrors.amount) setFieldErrors((e) => ({ ...e, amount: undefined }));
  };

  const parsedAmountValue = parseFloat(amount);
  const canDecrease = Number.isFinite(parsedAmountValue) && parsedAmountValue > 0;

  const scrollToField = (ref: React.RefObject<HTMLDivElement | null>, inputRef?: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    inputRef?.current?.focus();
  };

  const handleSubmit = async () => {
    if (isBusy) return;

    const errors: FieldErrors = {};
    const parsedAmount = parseFloat(amount.replace(/,/g, ""));

    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      errors.amount = t("form.amountError");
    }
    if (!title.trim()) {
      errors.title = t("form.titleError");
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      if (errors.amount) scrollToField(amountRef, amountInputRef);
      else if (errors.title) scrollToField(titleRef);
      return;
    }

    setFieldErrors({});
    await onSubmit({
      type,
      title:           title.trim(),
      amount:          parsedAmount,
      categoryId,
      paymentMethod,
      transactionDate: date,
      note:            note.trim() || undefined,
    });
  };

  const accentColor = type === "expense" ? "text-coral-400" : "text-income";

  return (
    <PageLayout
      withNav={false}
      isForm
      header={
        <MobileHeader
          title={isEdit ? t("form.editTitle") : t("form.addTitle")}
          right={
            <button type="button" onClick={onCancel} disabled={isBusy} className="text-fg-muted hover:text-fg text-caption font-medium px-2 py-1 rounded-lg active:bg-surface-muted transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40">
              {t("common.cancel")}
            </button>
          }
        />
      }
    >
      <div className="px-4 pt-4 space-y-3 sm:space-y-4">
        <div className="flex rounded-xl border border-app bg-surface-muted p-1">
          {(["expense", "income"] as TransactionType[]).map((txType) => (
            <button
              key={txType}
              type="button"
              disabled={isBusy}
              onClick={() => handleTypeChange(txType)}
              className={cn(
                "flex-1 min-h-[44px] rounded-xl py-2.5 text-caption font-semibold transition-all duration-200 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40",
                type === txType
                  ? txType === "expense"
                    ? "bg-coral-400 text-white shadow-sm shadow-coral-400/25"
                    : "bg-income text-white shadow-sm shadow-income/25"
                  : "text-fg-muted"
              )}
            >
              {txType === "expense" ? t("form.expense") : t("form.income")}
            </button>
          ))}
        </div>

        <div
          ref={amountRef}
          className={cn("banking-form-amount card-surface-elevated p-5 animate-scale-in form-field-anchor", fieldErrors.amount && "field-error")}
        >
          <label className="block text-label text-fg-muted mb-3" htmlFor="tx-amount">{t("form.amount", { symbol: currencySymbol })}</label>
          <div className="flex items-stretch gap-2">
            <AmountStepButton
              icon={Icons.action.minus}
              label={t("form.amountDecrease")}
              disabled={isBusy || !canDecrease}
              onClick={() => adjustAmount(-1)}
            />
            <div className="flex min-w-0 flex-1 items-center gap-1 rounded-xl border border-app bg-card px-3 py-2 min-h-[44px]">
              <span className={cn("shrink-0 text-headline font-bold tabular-nums", accentColor)} aria-hidden>
                {type === "expense" ? "−" : "+"}
              </span>
              <input
                id="tx-amount"
                ref={amountInputRef}
                type="text"
                inputMode="decimal"
                placeholder={t("form.amountPlaceholder")}
                value={amount}
                disabled={isBusy}
                onChange={(e) => handleAmountInput(e.target.value)}
                className={cn(
                  "amount-input min-w-0 flex-1 bg-transparent text-display font-bold outline-none placeholder:text-fg-subtle tabular-nums",
                  accentColor
                )}
                autoFocus={!isEdit}
                aria-invalid={!!fieldErrors.amount}
                aria-describedby={fieldErrors.amount ? "amount-error" : undefined}
              />
            </div>
            <AmountStepButton
              icon={Icons.action.plus}
              label={t("form.amountIncrease")}
              disabled={isBusy}
              onClick={() => adjustAmount(1)}
            />
          </div>
          {fieldErrors.amount && (
            <p id="amount-error" className="mt-2 text-caption text-coral-400 font-medium" role="alert">{fieldErrors.amount}</p>
          )}
        </div>

        <div className="space-y-3">
          <FormSection label={t("form.description")} error={fieldErrors.title} fieldRef={titleRef}>
            <input
              id="tx-title"
              type="text"
              placeholder={t("form.descriptionPlaceholder")}
              value={title}
              disabled={isBusy}
              onChange={(e) => {
                setTitle(e.target.value);
                if (fieldErrors.title) setFieldErrors((err) => ({ ...err, title: undefined }));
              }}
              className={cn(
                "w-full text-body font-medium text-fg outline-none placeholder:text-fg-subtle bg-transparent",
                fieldErrors.title && "field-error rounded-xl px-2 py-1 -mx-2"
              )}
              aria-invalid={!!fieldErrors.title}
            />
          </FormSection>

          <FormSection label={t("form.category")}>
            <div className="grid grid-cols-5 gap-1.5">
              {visibleCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  disabled={isBusy}
                  onClick={() => setCategoryId(cat.id)}
                  aria-pressed={categoryId === cat.id}
                  aria-label={getCategoryShortName(cat.id, language)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl py-2.5 transition-all duration-150 min-h-[44px] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40",
                    categoryId === cat.id ? "ring-2 ring-offset-1 opacity-100" : "opacity-60 active:opacity-80"
                  )}
                  style={categoryId === cat.id
                    ? { backgroundColor: cat.color + "20", "--tw-ring-color": cat.color } as React.CSSProperties
                    : {}}
                >
                  <CategoryIcon categoryId={cat.id} size="md" color={cat.color} />
                  <span className="text-micro normal-case tracking-normal text-fg-muted leading-tight text-center px-0.5 truncate w-full">
                    {getCategoryShortName(cat.id, language)}
                  </span>
                </button>
              ))}
            </div>
          </FormSection>

          <FormSection label={t("form.payment")}>
            <div className="flex gap-2">
              {PAYMENT_METHODS.map(({ value }) => {
                const PayIcon = getPaymentIcon(value);
                return (
                  <button
                    key={value}
                    type="button"
                    disabled={isBusy}
                    onClick={() => setPaymentMethod(value)}
                    aria-pressed={paymentMethod === value}
                    className={cn(
                      "flex-1 flex min-h-[52px] flex-col items-center justify-center gap-1.5 rounded-2xl py-3 transition-all duration-150 text-caption font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mint-500/40",
                      paymentMethod === value
                        ? "bg-mint-500/10 text-mint-600 dark:text-mint-400 ring-1.5 ring-mint-500/30"
                        : "border border-app bg-card text-fg-muted active:bg-surface-muted"
                    )}
                  >
                    <AppIcon icon={PayIcon} size="md" />
                    {getPaymentLabel(value, language)}
                  </button>
                );
              })}
            </div>
          </FormSection>

          <FormSection label={t("form.date")}>
            <DatePicker
              value={date}
              onChange={setDate}
              disabled={isBusy}
              label={t("form.date")}
            />
          </FormSection>

          <FormSection label={t("form.note")}>
            <textarea
              id="tx-note"
              placeholder={t("form.notePlaceholder")}
              value={note}
              disabled={isBusy}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              className="w-full text-body text-fg outline-none bg-transparent resize-none placeholder:text-fg-subtle"
            />
          </FormSection>
        </div>

        {error && (
          <p className="text-caption text-coral-400 font-medium" role="alert">{error}</p>
        )}

        <Button
          variant={type === "expense" ? "secondary" : "primary"}
          size="lg"
          fullWidth
          loading={saving}
          disabled={isBusy}
          onClick={() => { void handleSubmit(); }}
        >
          {isEdit ? t("form.saveChanges") : type === "expense" ? t("form.addExpense") : t("form.addIncome")}
        </Button>

        {isEdit && onDelete && (
          <Button
            variant="ghost"
            size="lg"
            fullWidth
            loading={deleting}
            disabled={isBusy}
            onClick={onDelete}
            className="text-coral-400"
          >
            {t("form.delete")}
          </Button>
        )}
      </div>
    </PageLayout>
  );
}
