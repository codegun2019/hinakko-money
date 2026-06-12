export type TransactionType  = "income" | "expense";
export type PaymentMethod    = "cash" | "credit" | "installment";

export interface Category {
  id:    string;
  name:  string;
  icon:  string; // Lucide icon key — see lib/icons.ts
  color: string;
  type:  TransactionType | "both";
}

export interface Transaction {
  id:              string;
  type:            TransactionType;
  title:           string;
  amount:          number;
  categoryId:      string;
  paymentMethod:   PaymentMethod;
  transactionDate: string; // YYYY-MM-DD
  note?:           string | null;
  createdAt:       string;
  updatedAt:       string;
}

export interface Account {
  id:        string;
  name:      string;
  balance:   number;
  type:      "cash" | "bank" | "credit";
  createdAt: string;
}

export interface DailyGroup {
  date:         string;
  transactions: Transaction[];
  totalIncome:  number;
  totalExpense: number;
}

export interface MonthlyStats {
  month:        string; // YYYY-MM
  totalIncome:  number;
  totalExpense: number;
  balance:      number;
}

export interface CategoryStat {
  category:   Category;
  total:      number;
  count:      number;
  percentage: number;
}

export interface Budget {
  id:         string;
  categoryId: string;
  month:      string;
  amount:     number;
  createdAt:  string;
}

export interface BudgetWithSpent extends Budget {
  spent:    number;
  category: Category;
}

export interface RecurringRule {
  id:               string;
  type:             TransactionType;
  title:            string;
  amount:           number;
  categoryId:       string;
  paymentMethod:    PaymentMethod;
  dayOfMonth:       number;
  note?:            string | null;
  active:           boolean;
  lastAppliedMonth?: string | null;
  createdAt:        string;
  category?:        Category;
}

export type CreateTransactionInput = Omit<Transaction, "id" | "createdAt" | "updatedAt">;
