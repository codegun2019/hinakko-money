import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { BottomSheet } from "~/components/ui/BottomSheet";
import { Button } from "~/components/ui/Button";
import { CategoryIcon } from "~/components/icons";
import { CATEGORIES } from "~/lib/constants";
import {
  deleteRecurringRule,
  listRecurringRules,
  markRecurringApplied,
  upsertRecurringRule,
} from "~/db/queries/recurring";
import { saveTransaction } from "~/lib/transactions-client";
import { getCategoryName, useTranslation } from "~/lib/i18n";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import { showToast, showErrorToast } from "~/lib/toast";
import type { RecurringRule } from "~/lib/types";

interface Props {
  open:       boolean;
  onClose:    () => void;
  onChanged?: () => void;
}

export function RecurringSheet({ open, onClose, onChanged }: Props) {
  const { t, language } = useTranslation();
  const fmt = useFormatCurrency();
  const [rules, setRules] = useState<RecurringRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState("food");
  const [dayOfMonth, setDayOfMonth] = useState(String(new Date().getDate()));

  const expenseCategories = useMemo(
    () => CATEGORIES.filter((c) => c.type === "expense"),
    [],
  );

  const load = async () => {
    setLoading(true);
    try {
      setRules(await listRecurringRules());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open]);

  const handleSave = async () => {
    const parsed = Number(amount);
    const day = Number(dayOfMonth);
    if (!title.trim() || !Number.isFinite(parsed) || parsed <= 0 || day < 1 || day > 31) return;
    setSaving(true);
    try {
      await upsertRecurringRule({
        data: {
          type: "expense",
          title: title.trim(),
          amount: parsed,
          categoryId,
          paymentMethod: "cash",
          dayOfMonth: day,
        },
      });
      showToast(t("recurring.saved"));
      setTitle("");
      setAmount("");
      await load();
      onChanged?.();
    } catch {
      showErrorToast(t("recurring.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleApply = async (rule: RecurringRule) => {
    const today = format(new Date(), "yyyy-MM-dd");
    const month = today.slice(0, 7);
    try {
      await saveTransaction({
        type: rule.type,
        title: rule.title,
        amount: rule.amount,
        categoryId: rule.categoryId,
        paymentMethod: rule.paymentMethod,
        transactionDate: today,
        note: rule.note ?? undefined,
      });
      await markRecurringApplied({ data: { id: rule.id, month } });
      showToast(t("recurring.applied"));
      await load();
      onChanged?.();
    } catch {
      showErrorToast(t("recurring.applyFailed"));
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRecurringRule({ data: { id } });
      showToast(t("recurring.deleted"));
      await load();
      onChanged?.();
    } catch {
      showErrorToast(t("recurring.deleteFailed"));
    }
  };

  const todayDay = new Date().getDate();
  const todayMonth = format(new Date(), "yyyy-MM");

  return (
    <BottomSheet open={open} onClose={onClose} title={t("recurring.sheetTitle")} description={t("recurring.sheetDesc")}>
      <div className="flex flex-col gap-4 pb-2">
        {loading ? (
          <p className="text-caption text-fg-muted px-1">{t("common.loading")}</p>
        ) : rules.length === 0 ? (
          <p className="text-caption text-fg-muted px-1">{t("recurring.empty")}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {rules.map((rule) => {
              const dueToday = rule.active
                && rule.dayOfMonth === todayDay
                && rule.lastAppliedMonth !== todayMonth;
              return (
                <div key={rule.id} className="rounded-xl border border-app bg-card p-3">
                  <div className="flex items-start gap-3">
                    <CategoryIcon categoryId={rule.categoryId} size="md" />
                    <div className="min-w-0 flex-1">
                      <p className="text-body font-semibold text-fg truncate">{rule.title}</p>
                      <p className="text-caption text-fg-muted">
                        {fmt(rule.amount)} · {t("recurring.dayLabel", { day: rule.dayOfMonth })}
                      </p>
                      <p className="text-micro text-fg-muted">{getCategoryName(rule.categoryId, language)}</p>
                    </div>
                    <button type="button" className="text-caption text-coral-400" onClick={() => { void handleDelete(rule.id); }}>
                      {t("common.delete")}
                    </button>
                  </div>
                  {dueToday && (
                    <Button size="sm" fullWidth className="mt-3" onClick={() => { void handleApply(rule); }}>
                      {t("recurring.applyToday")}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="rounded-xl border border-app bg-surface-muted p-3 space-y-2">
          <p className="text-label text-fg-muted">{t("recurring.add")}</p>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("recurring.titlePlaceholder")}
            className="w-full rounded-xl border border-app bg-card px-3 py-2.5 text-body text-fg outline-none"
          />
          <div className="flex gap-2">
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder={t("budget.amountPlaceholder")}
              className="min-w-0 flex-1 rounded-xl border border-app bg-card px-3 py-2.5 text-body text-fg outline-none"
            />
            <input
              value={dayOfMonth}
              onChange={(e) => setDayOfMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
              inputMode="numeric"
              placeholder={t("recurring.dayPlaceholder")}
              className="w-16 rounded-xl border border-app bg-card px-2 py-2.5 text-body text-fg text-center outline-none"
            />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {expenseCategories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`rounded-lg border px-2 py-1 text-micro font-semibold ${
                  categoryId === cat.id ? "border-mint-500/35 bg-mint-500/10 text-fg" : "border-app bg-card text-fg-muted"
                }`}
              >
                {getCategoryName(cat.id, language)}
              </button>
            ))}
          </div>
          <Button fullWidth loading={saving} disabled={saving} onClick={() => { void handleSave(); }}>
            {t("recurring.save")}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
