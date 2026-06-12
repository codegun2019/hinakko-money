import { z } from "zod";

// ─── Shared primitives ───────────────────────────────────────────────────────

const TransactionType  = z.enum(["income", "expense"]);
const PaymentMethod    = z.enum(["cash", "credit", "installment"]);
const IsoDate          = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD");
const MonthString      = z.string().regex(/^\d{4}-\d{2}$/,       "Must be YYYY-MM");

// ─── Transaction mutations ────────────────────────────────────────────────────

export const CreateTransactionSchema = z.object({
  type:            TransactionType,
  title:           z.string().min(1, "Title is required").max(200),
  amount:          z.number({ invalid_type_error: "Amount must be a number" })
                    .positive("Amount must be positive"),
  categoryId:      z.string().min(1, "Category is required"),
  paymentMethod:   PaymentMethod,
  transactionDate: IsoDate,
  note:            z.string().max(500).optional(),
});

export const UpdateTransactionSchema = z.object({
  id:              z.string().min(1),
  type:            TransactionType.optional(),
  title:           z.string().min(1).max(200).optional(),
  amount:          z.number().positive().optional(),
  categoryId:      z.string().min(1).optional(),
  paymentMethod:   PaymentMethod.optional(),
  transactionDate: IsoDate.optional(),
  note:            z.string().max(500).optional(),
});

export const DeleteTransactionSchema = z.object({
  id: z.string().min(1),
});

// ─── Query inputs ─────────────────────────────────────────────────────────────

export const ListByMonthSchema     = z.object({ month: MonthString });
export const MonthlySummarySchema  = z.object({ month: MonthString });
export const CategorySummarySchema = z.object({ month: MonthString });
export const GetByIdSchema         = z.object({ id: z.string().min(1) });

// ─── Route search params ──────────────────────────────────────────────────────

export const DashboardSearchSchema = z.object({
  month: MonthString.optional(),
});

export const EditSearchSchema = z.object({
  returnTo: z.enum(["/", "/calendar", "/categories"]).default("/"),
  month:    MonthString.optional(),
});

// ─── Budget mutations ─────────────────────────────────────────────────────────

export const BudgetMonthSchema = z.object({ month: MonthString });

export const UpsertBudgetSchema = z.object({
  categoryId: z.string().min(1),
  month:      MonthString,
  amount:     z.number({ invalid_type_error: "Amount must be a number" }).positive("Amount must be positive"),
});

export const DeleteBudgetSchema = z.object({
  id: z.string().min(1),
});

export const ImportTransactionsSchema = z.object({
  items: z.array(CreateTransactionSchema).min(1).max(5000),
});

export const UpsertRecurringSchema = z.object({
  id:            z.string().optional(),
  type:          TransactionType,
  title:         z.string().min(1).max(200),
  amount:        z.number().positive(),
  categoryId:    z.string().min(1),
  paymentMethod: PaymentMethod,
  dayOfMonth:    z.number().int().min(1).max(31),
  note:          z.string().max(500).optional(),
  active:        z.boolean().optional(),
});

export const DeleteRecurringSchema = z.object({
  id: z.string().min(1),
});

export const DueRecurringSchema = z.object({
  date: IsoDate,
});

export const MarkRecurringAppliedSchema = z.object({
  id: z.string().min(1),
  month: MonthString,
});

// ─── Inferred TS types ────────────────────────────────────────────────────────

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type DeleteTransactionInput = z.infer<typeof DeleteTransactionSchema>;
export type UpsertBudgetInput      = z.infer<typeof UpsertBudgetSchema>;
export type DeleteBudgetInput      = z.infer<typeof DeleteBudgetSchema>;
