import type { CreateTransactionInput, UpdateTransactionInput } from "~/lib/validation";
import type { Transaction } from "~/lib/types";

const QUEUE_KEY   = "hinakko-offline-queue";
const PENDING_KEY = "hinakko-offline-pending";

export type OfflineOpType = "create" | "update" | "delete";

export interface OfflineQueueItem {
  queueId:   string;
  type:      OfflineOpType;
  payload:   unknown;
  createdAt: string;
}

export function isBrowserOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

function readQueue(): OfflineQueueItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as OfflineQueueItem[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: OfflineQueueItem[]): void {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

function readPending(): Transaction[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
}

function writePending(items: Transaction[]): void {
  localStorage.setItem(PENDING_KEY, JSON.stringify(items));
}

export function getQueueLength(): number {
  return readQueue().length;
}

export function getPendingTransactions(): Transaction[] {
  return readPending();
}

export function getPendingForMonth(month: string): Transaction[] {
  return readPending().filter((tx) => tx.transactionDate.startsWith(month));
}

export function mergeWithPending(serverTxs: Transaction[], month: string): Transaction[] {
  const pending = getPendingForMonth(month);
  if (pending.length === 0) return serverTxs;

  const deletedIds = new Set(
    readQueue()
      .filter((q) => q.type === "delete")
      .map((q) => (q.payload as { id: string }).id),
  );

  const merged = [
    ...serverTxs.filter((tx) => !deletedIds.has(tx.id)),
    ...pending,
  ];

  return merged.sort((a, b) => {
    const dateCmp = b.transactionDate.localeCompare(a.transactionDate);
    return dateCmp !== 0 ? dateCmp : b.createdAt.localeCompare(a.createdAt);
  });
}

function enqueue(item: OfflineQueueItem): void {
  writeQueue([...readQueue(), item]);
}

export function enqueueCreate(data: CreateTransactionInput): Transaction {
  const now = new Date().toISOString();
  const tx: Transaction = {
    id:              `pending-${crypto.randomUUID()}`,
    ...data,
    note:            data.note ?? null,
    createdAt:       now,
    updatedAt:       now,
  };
  writePending([...readPending(), tx]);
  enqueue({ queueId: tx.id, type: "create", payload: data, createdAt: now });
  return tx;
}

export function enqueueUpdate(data: UpdateTransactionInput): void {
  const pending = readPending();
  const idx = pending.findIndex((tx) => tx.id === data.id);
  if (idx >= 0) {
    const updated = {
      ...pending[idx]!,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    pending[idx] = updated;
    writePending(pending);
    const queue = readQueue();
    const qIdx = queue.findIndex((q) => q.queueId === data.id && q.type === "create");
    if (qIdx >= 0) {
      queue[qIdx] = { ...queue[qIdx]!, payload: { ...queue[qIdx]!.payload as CreateTransactionInput, ...data } };
      writeQueue(queue);
    } else {
      enqueue({ queueId: crypto.randomUUID(), type: "update", payload: data, createdAt: new Date().toISOString() });
    }
    return;
  }
  enqueue({ queueId: crypto.randomUUID(), type: "update", payload: data, createdAt: new Date().toISOString() });
}

export function enqueueDelete(id: string): void {
  if (id.startsWith("pending-")) {
    writePending(readPending().filter((tx) => tx.id !== id));
    writeQueue(readQueue().filter((q) => q.queueId !== id));
    return;
  }
  writePending(readPending().filter((tx) => tx.id !== id));
  enqueue({ queueId: crypto.randomUUID(), type: "delete", payload: { id }, createdAt: new Date().toISOString() });
}

export async function flushOfflineQueue(
  handlers: {
    create: (data: CreateTransactionInput) => Promise<{ id: string }>;
    update: (data: UpdateTransactionInput) => Promise<{ id: string }>;
    delete: (id: string) => Promise<{ id: string }>;
  },
): Promise<{ synced: number; failed: number }> {
  const queue = readQueue();
  if (queue.length === 0) return { synced: 0, failed: 0 };

  let synced = 0;
  let failed = 0;
  const remaining: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      if (item.type === "create") {
        await handlers.create(item.payload as CreateTransactionInput);
      } else if (item.type === "update") {
        await handlers.update(item.payload as UpdateTransactionInput);
      } else {
        await handlers.delete((item.payload as { id: string }).id);
      }
      synced++;
    } catch {
      failed++;
      remaining.push(item);
    }
  }

  writeQueue(remaining);
  if (synced > 0) writePending([]);
  return { synced, failed };
}

export function clearOfflineQueue(): void {
  writeQueue([]);
  writePending([]);
}
