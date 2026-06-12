import { useEffect, useMemo, useState } from "react";
import { BottomSheet } from "~/components/ui/BottomSheet";
import { Button } from "~/components/ui/Button";
import { CategoryIcon } from "~/components/icons";
import { CATEGORIES } from "~/lib/constants";
import { getCurrentMonth } from "~/lib/format";
import { getCategoryName, useTranslation } from "~/lib/i18n";
import { useFormatCurrency } from "~/lib/useFormatCurrency";
import { showToast, showErrorToast } from "~/lib/toast";
import {
  deleteBudget,
  listBudgetsWithSpent,
  upsertBudget,
} from "~/db/queries/budgets";
import type { BudgetWithSpent } from "~/lib/types";

interface Props {
  open:      boolean;
  onClose:   () => void;
  month?:    string;
  onChanged?: () => void;
}

export function BudgetSheet({ open, onClose, month, onChanged }: Props) {
  const { t, language } = useTranslation();
  const fmt = useFormatCurrency();
  const targetMonth = month ?? getCurrentMonth();
  const [budgets, setBudgets] = useState<BudgetWithSpent[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pickCategory, setPickCategory] = useState<string | null>(null);
  const [amountInput, setAmountInput] = useState("");

  const expenseCategories = useMemo(
    () => CATEGORIES.filter((c) => c.type === "expense" || c.type === "both"),
    [],
  );

  const usedCategoryIds = useMemo(() => new Set(budgets.map((b) => b.categoryId)), [budgets]);
  const availableCategories = expenseCategories.filter((c) => !usedCategoryIds.has(c.id));

  const load = async () => {
    setLoading(true);
    try {
      const rows = await listBudgetsWithSpent({ data: { month: targetMonth } });
      setBudgets(rows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) void load();
  }, [open, targetMonth]);

  const resetForm = () => {
    setPickCategory(null);
    setAmountInput("");
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async () => {
    if (!pickCategory) return;
    const amount = Number(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) return;

    setSaving(true);
    try {
      await upsertBudget({ data: { categoryId: pickCategory, month: targetMonth, amount } });
      showToast(t("budget.saved"));
      resetForm();
      await load();
      onChanged?.();
    } catch {
      showErrorToast(t("budget.saveFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget({ data: { id } });
      showToast(t("budget.deleted"));
      await load();
      onChanged?.();
    } catch {
      showErrorToast(t("budget.deleteFailed"));
    }
  };

  return (
    <BottomSheet
      open={open}
      onClose={handleClose}
      title={t("budget.sheetTitle")}
      description={t("budget.sheetDesc", { month: targetMonth })}
    >
      <div className="flex flex-col gap-3 pb-2">
        {loading && budgets.length === 0 ? (
          <p className="text-caption text-fg-muted py-4 text-center">{t("common.loading")}</p>
        ) : budgets.length === 0 ? (
          <p className="text-caption text-fg-muted py-2">{t("budget.empty")}</p>
        ) : (
          budgets.map((b) => {
            const pct = b.amount > 0 ? Math.min(100, Math.round((b.spent / b.amount) * 100)) : 0;
            const over = b.spent > b.amount;
            return (
              <div key={b.id} className="rounded-xl border border-app bg-card px-3.5 py-3">
                <div className="flex items-center gap-2.5 mb-2">
                  <CategoryIcon categoryId={b.categoryId} size="sm" />
                  <span className="flex-1 text-body font-semibold text-fg truncate">
                    {getCategoryName(b.categoryId, language)}
                  </span>
                  <button
                    type="button"
                    onClick={() => { void handleDelete(b.id); }}
                    className="text-caption font-semibold text-coral-400 px-1"
                  >
                    {t("common.delete")}
                  </button>
                </div>
                <div className="mb-1.5 h-2 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className={`h-full rounded-full transition-all ${over ? "bg-coral-400" : "bg-mint-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="text-caption text-fg-muted">
                  {fmt(b.spent)} / {fmt(b.amount)}
                  {over ? ` · ${t("budget.over")}` : ` · ${pct}%`}
                </p>
              </div>
            );
          })
        )}

        {pickCategory ? (
          <div className="rounded-xl border border-app bg-surface-muted/50 p-3.5 space-y-3">
            <p className="text-caption font-semibold text-fg">
              {getCategoryName(pickCategory, language)}
            </p>
            <input
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder={t("budget.amountPlaceholder")}
              className="w-full rounded-xl border border-app bg-card px-3 py-2.5 text-body text-fg"
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="md" fullWidth onClick={resetForm}>
                {t("common.cancel")}
              </Button>
              <Button size="md" fullWidth loading={saving} onClick={() => { void handleSave(); }}>
                {t("budget.save")}
              </Button>
            </div>
          </div>
        ) : availableCategories.length > 0 ? (
          <div className="space-y-2">
            <p className="text-label text-fg-muted">{t("budget.pickCategory")}</p>
            <div className="flex flex-wrap gap-2">
              {availableCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setPickCategory(cat.id)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-app bg-card px-3 py-1.5 text-caption font-semibold text-fg active:bg-surface-muted"
                >
                  <CategoryIcon categoryId={cat.id} size="xs" />
                  {getCategoryName(cat.id, language)}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </BottomSheet>
  );
}
