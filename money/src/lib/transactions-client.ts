import { format } from "date-fns";
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from "~/db/queries/transactions";
import type { CreateTransactionInput, UpdateTransactionInput } from "~/lib/validation";
import type { Transaction } from "~/lib/types";
import { useSettingsStore } from "~/lib/store";
import {
  enqueueCreate,
  enqueueDelete,
  enqueueUpdate,
  flushOfflineQueue,
  isBrowserOnline,
} from "~/lib/offline-queue";

export type SaveResult = { id: string; offline?: boolean };

export async function saveTransaction(data: CreateTransactionInput): Promise<SaveResult> {
  if (!isBrowserOnline()) {
    const tx = enqueueCreate(data);
    useSettingsStore.getState().incrementSaveCount();
    return { id: tx.id, offline: true };
  }
  const result = await createTransaction({ data });
  useSettingsStore.getState().incrementSaveCount();
  return result;
}

export async function patchTransaction(data: UpdateTransactionInput): Promise<SaveResult> {
  if (!isBrowserOnline()) {
    enqueueUpdate(data);
    return { id: data.id, offline: true };
  }
  return updateTransaction({ data });
}

export async function removeTransaction(id: string): Promise<SaveResult> {
  if (!isBrowserOnline()) {
    enqueueDelete(id);
    return { id, offline: true };
  }
  return deleteTransaction({ data: { id } });
}

export async function duplicateTransaction(
  source: Transaction,
  transactionDate = format(new Date(), "yyyy-MM-dd"),
): Promise<SaveResult> {
  return saveTransaction({
    type: source.type,
    title: source.title,
    amount: source.amount,
    categoryId: source.categoryId,
    paymentMethod: source.paymentMethod,
    transactionDate,
    note: source.note ?? undefined,
  });
}

export async function syncOfflineTransactions(): Promise<{ synced: number; failed: number }> {
  if (!isBrowserOnline()) return { synced: 0, failed: 0 };
  return flushOfflineQueue({
    create: (data) => createTransaction({ data }),
    update: (data) => updateTransaction({ data }),
    delete: (id) => deleteTransaction({ data: { id } }),
  });
}
