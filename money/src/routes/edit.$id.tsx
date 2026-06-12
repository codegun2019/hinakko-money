import { createFileRoute, useNavigate, useRouter, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { TransactionForm } from "~/components/transaction/TransactionForm";
import { ConfirmDialog } from "~/components/ui/ConfirmDialog";
import { getTransactionById } from "~/db/queries/transactions";
import { patchTransaction, removeTransaction } from "~/lib/transactions-client";
import { EditSearchSchema } from "~/lib/validation";
import type { CreateTransactionInput } from "~/lib/validation";
import { useTranslation } from "~/lib/i18n";
import { showToast, showErrorToast } from "~/lib/toast";

export const Route = createFileRoute("/edit/$id")({
  validateSearch: EditSearchSchema,

  loader: async ({ params }) => {
    const transaction = await getTransactionById({ data: { id: params.id } });
    if (!transaction) throw notFound();
    return { transaction };
  },

  component: EditTransactionPage,
});

function EditTransactionPage() {
  const { t } = useTranslation();
  const { transaction } = Route.useLoaderData();
  const { returnTo, month } = Route.useSearch();
  const navigate = useNavigate();
  const router   = useRouter();
  const [saving, setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error,  setError]  = useState("");

  const goBack = () => {
    if (returnTo === "/calendar" || returnTo === "/categories") {
      void navigate({ to: returnTo, search: month ? { month } : {} });
    } else {
      void navigate({ to: returnTo });
    }
  };

  const handleSubmit = async (data: CreateTransactionInput) => {
    if (saving || deleting) return;
    setSaving(true);
    setError("");
    try {
      const result = await patchTransaction({ id: transaction.id, ...data });
      await router.invalidate();
      showToast(result.offline ? t("toast.savedOffline") : t("toast.updated"));
      goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("transaction.saveFailed"));
      showErrorToast(err instanceof Error ? err.message : t("transaction.saveFailed"));
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (saving || deleting) return;
    setDeleting(true);
    try {
      const result = await removeTransaction(transaction.id);
      await router.invalidate();
      setDeleteOpen(false);
      showToast(result.offline ? t("toast.savedOffline") : t("toast.deleted"));
      goBack();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("transaction.deleteFailed"));
      showErrorToast(err instanceof Error ? err.message : t("transaction.deleteFailed"));
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  return (
    <>
      <TransactionForm
        mode="edit"
        initial={transaction}
        onSubmit={handleSubmit}
        onCancel={goBack}
        onDelete={() => setDeleteOpen(true)}
        saving={saving}
        deleting={deleting}
        error={error}
      />

      <ConfirmDialog
        open={deleteOpen}
        title={t("transaction.deleteTitle")}
        description={t("transaction.deleteConfirmDesc")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        loading={deleting}
        onCancel={() => !deleting && setDeleteOpen(false)}
        onConfirm={() => { void handleDelete(); }}
      />
    </>
  );
}
