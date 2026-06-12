import type { Category, PaymentMethod } from "./types";

// ─── Categories ──────────────────────────────────────────────────────────────
// Kept as a static client-side lookup so UI components never need a DB round-trip.
// The same data is seeded into the `categories` table (src/db/seed.ts).

export const CATEGORIES: Category[] = [
  { id: "food",       name: "Food & Drink",  icon: "food",       color: "#F59E0B", type: "expense" },
  { id: "transport",  name: "Transport",     icon: "transport",  color: "#4F8CFF", type: "expense" },
  { id: "shopping",   name: "Shopping",      icon: "shopping",   color: "#A78BFA", type: "expense" },
  { id: "health",     name: "Health",        icon: "health",     color: "#22D3EE", type: "expense" },
  { id: "home",       name: "Home",          icon: "home",       color: "#818CF8", type: "expense" },
  { id: "entertain",  name: "Entertainment", icon: "entertain",  color: "#F472B6", type: "expense" },
  { id: "education",  name: "Education",     icon: "education",  color: "#6366F1", type: "expense" },
  { id: "beauty",     name: "Beauty",        icon: "beauty",     color: "#EAB308", type: "expense" },
  { id: "pet",        name: "Pets",          icon: "pet",        color: "#34D399", type: "expense" },
  { id: "other_exp",  name: "Other",         icon: "other_exp",  color: "#64748B", type: "expense" },
  { id: "salary",     name: "Salary",        icon: "salary",     color: "#22C55E", type: "income"  },
  { id: "freelance",  name: "Freelance",     icon: "freelance",  color: "#4ADE80", type: "income"  },
  { id: "invest",     name: "Investment",    icon: "invest",     color: "#3B82F6", type: "income"  },
  { id: "other_inc",  name: "Other Income",  icon: "other_inc",  color: "#86EFAC", type: "income"  },
];

const FALLBACK_CATEGORY: Category = {
  id:    "other_exp",
  name:  "Other",
  icon:  "other_exp",
  color: "#64748B",
  type:  "expense",
};

export const getCategoryById = (id: string): Category =>
  CATEGORIES.find((c) => c.id === id) ?? FALLBACK_CATEGORY;

// ─── Payment methods ─────────────────────────────────────────────────────────

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash",        label: "Cash"    },
  { value: "credit",      label: "Credit"  },
  { value: "installment", label: "Install" },
];
