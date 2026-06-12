import type { Transaction } from "~/lib/types";
import { getCategoryName } from "~/lib/i18n";
import type { LanguageCode } from "~/lib/settings";

function escapeCsv(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToJSON(transactions: Transaction[]): string {
  return JSON.stringify(transactions, null, 2);
}

export function transactionsToCSV(transactions: Transaction[], lang: LanguageCode = "th"): string {
  const headers = [
    "id", "type", "title", "amount", "category",
    "paymentMethod", "transactionDate", "note", "createdAt",
  ];

  const rows = transactions.map((tx) => [
    tx.id,
    tx.type,
    escapeCsv(tx.title),
    String(tx.amount),
    escapeCsv(getCategoryName(tx.categoryId, lang)),
    tx.paymentMethod,
    tx.transactionDate,
    escapeCsv(tx.note ?? ""),
    tx.createdAt,
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

export async function downloadFile(content: string, filename: string, mimeType: string): Promise<void> {
  const blob = new Blob([content], { type: mimeType });
  const file = new File([blob], filename, { type: mimeType });

  if (typeof navigator.share === "function" && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: filename });
      return;
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function exportFilename(ext: "json" | "csv"): string {
  const date = new Date().toISOString().slice(0, 10);
  return `hinakko-expense-${date}.${ext}`;
}
