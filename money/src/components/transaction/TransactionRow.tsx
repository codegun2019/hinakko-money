import { useState } from "react";
import type { Transaction } from "~/lib/types";
import { getCategoryById } from "~/lib/constants";
import { AmountText } from "~/components/ui/AmountText";
import { ConfirmDialog } from "~/components/ui/ConfirmDialog";
import { SwipeableRow } from "~/components/ui/SwipeableRow";
import { CategoryIcon, AppIcon } from "~/components/icons";
import { Icons } from "~/lib/icons";
import { getCategoryName, getPaymentLabel, useTranslation } from "~/lib/i18n";

interface Props {
  transaction: Transaction;
  onEdit?:      (id: string) => void;
  onDelete?:    (id: string) => Promise<void>;
  onDuplicate?: (transaction: Transaction) => Promise<void>;
}

const paymentBadge: Record<string, string> = {
  cash:        "badge-cash",
  credit:      "badge-credit",
  installment: "badge-installment",
};

export function TransactionRow({ transaction, onEdit, onDelete, onDuplicate }: Props) {
  const { t, language } = useTranslation();
  const category = getCategoryById(transaction.categoryId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting]       = useState(false);
  const isPending = transaction.id.startsWith("pending-");
  const canEdit = onEdit && !isPending ? onEdit : undefined;
  const handleEdit = () => canEdit?.(transaction.id);

  const handleConfirmDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete(transaction.id);
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const row = (
    <div
      role={canEdit ? "button" : undefined}
      tabIndex={canEdit ? 0 : undefined}
      onClick={canEdit ? handleEdit : undefined}
      onKeyDown={canEdit ? (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleEdit(); } } : undefined}
      className="list-row flex items-center gap-3 px-3.5 py-3 focus-visible:outline-none"
      aria-label={canEdit ? t("transaction.editAria", { title: transaction.title }) : undefined}
    >
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: category.color + "18" }}
      >
        <CategoryIcon categoryId={category.id} size="md" color={category.color} />
      </div>

      <div className="min-w-0 flex-1 flex-col gap-0.5 flex">
        <span className="truncate text-body font-semibold text-fg">{transaction.title}</span>
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="truncate text-caption text-fg-muted">{getCategoryName(category.id, language)}</span>
          <span className={`badge-payment shrink-0 ${paymentBadge[transaction.paymentMethod]}`}>
            {getPaymentLabel(transaction.paymentMethod, language)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <AmountText amount={transaction.amount} type={transaction.type} size="sm" className="font-semibold tabular-nums" />
        {canEdit && <AppIcon icon={Icons.action.chevronRight} size="sm" className="text-fg-subtle" />}
        {isPending && (
          <span className="text-micro font-semibold text-fg-muted rounded-full bg-surface-muted px-2 py-0.5">
            offline
          </span>
        )}
      </div>
    </div>
  );

  const canDuplicate = onDuplicate && !isPending
    ? () => { void onDuplicate(transaction); }
    : undefined;
  const swipeEnabled = Boolean(canEdit || onDelete || canDuplicate);

  return (
    <>
      {swipeEnabled ? (
        <SwipeableRow
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={onDelete ? () => setConfirmOpen(true) : undefined}
          onDuplicate={canDuplicate}
          editLabel={t("transaction.swipeEdit")}
          deleteLabel={t("transaction.swipeDelete")}
          duplicateLabel={t("transaction.swipeDuplicate")}
        >
          {row}
        </SwipeableRow>
      ) : (
        row
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={t("transaction.deleteTitle")}
        description={t("transaction.deleteDesc", { title: transaction.title })}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        loading={deleting}
        onConfirm={() => { void handleConfirmDelete(); }}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
}
