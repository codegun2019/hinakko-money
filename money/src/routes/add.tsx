import { createFileRoute, useNavigate, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { TransactionForm } from "~/components/transaction/TransactionForm";
import type { CreateTransactionInput } from "~/lib/validation";
import { useTranslation } from "~/lib/i18n";
import { showToast, showErrorToast } from "~/lib/toast";
import { saveTransaction } from "~/lib/transactions-client";

export const Route = createFileRoute("/add")({
  component: AddTransactionPage,
});

function AddTransactionPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const router   = useRouter();
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");

  const handleSubmit = async (data: CreateTransactionInput) => {
    setSaving(true);
    setError("");
    try {
      const result = await saveTransaction(data);
      await router.invalidate();
      showToast(result.offline ? t("toast.savedOffline") : t("toast.saved"));
      void navigate({ to: "/" });
    } catch (err) {
      setError(err instanceof Error ? err.message : t("transaction.saveFailed"));
      showErrorToast(err instanceof Error ? err.message : t("transaction.saveFailed"));
      setSaving(false);
    }
  };

  return (
    <TransactionForm
      onSubmit={handleSubmit}
      onCancel={() => void navigate({ to: "/" })}
      saving={saving}
      error={error}
    />
  );
}
