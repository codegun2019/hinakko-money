/**
 * Run once after db:push to populate initial data.
 * Usage: npm run db:seed
 */
import { db } from "./index";
import { categories, transactions, accounts } from "./schema";
import { eq } from "drizzle-orm";

// ─── Static category definitions ────────────────────────────────────────────
const SEED_CATEGORIES = [
  { id: "food",       name: "Food & Drink",   icon: "🍜", color: "#FF9F43", type: "expense" },
  { id: "transport",  name: "Transport",      icon: "🚌", color: "#54A0FF", type: "expense" },
  { id: "shopping",   name: "Shopping",       icon: "🛍️", color: "#FF6B9D", type: "expense" },
  { id: "health",     name: "Health",         icon: "💊", color: "#48CAE4", type: "expense" },
  { id: "home",       name: "Home",           icon: "🏠", color: "#A29BFE", type: "expense" },
  { id: "entertain",  name: "Entertainment",  icon: "🎬", color: "#FD79A8", type: "expense" },
  { id: "education",  name: "Education",      icon: "📚", color: "#6C5CE7", type: "expense" },
  { id: "beauty",     name: "Beauty",         icon: "💄", color: "#FDCB6E", type: "expense" },
  { id: "pet",        name: "Pets",           icon: "🐾", color: "#00B894", type: "expense" },
  { id: "other_exp",  name: "Other",          icon: "📦", color: "#B2BEC3", type: "expense" },
  { id: "salary",     name: "Salary",         icon: "💰", color: "#00CEC9", type: "income"  },
  { id: "freelance",  name: "Freelance",      icon: "💻", color: "#55EFC4", type: "income"  },
  { id: "invest",     name: "Investment",     icon: "📈", color: "#0984E3", type: "income"  },
  { id: "other_inc",  name: "Other Income",   icon: "🎁", color: "#A8D5A2", type: "income"  },
] as const;

const SEED_ACCOUNTS = [
  { id: "cash_wallet", name: "Cash Wallet", balance: 5000, type: "cash" as const,  createdAt: new Date().toISOString() },
  { id: "bank_main",   name: "Bank Account",balance: 80000, type: "bank" as const, createdAt: new Date().toISOString() },
  { id: "credit_main", name: "Credit Card", balance: 0,    type: "credit" as const,createdAt: new Date().toISOString() },
];

// ─── Mock transactions relative to today ────────────────────────────────────
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const now = new Date().toISOString();

const SEED_TRANSACTIONS = [
  // Today
  { id: "t1",  type: "expense" as const, title: "Pad Thai",         amount: 65,    categoryId: "food",       paymentMethod: "cash" as const,        transactionDate: daysAgo(0), note: "Lunch at street food", createdAt: now, updatedAt: now },
  { id: "t2",  type: "expense" as const, title: "BTS Skytrain",     amount: 52,    categoryId: "transport",  paymentMethod: "cash" as const,        transactionDate: daysAgo(0), note: undefined, createdAt: now, updatedAt: now },
  { id: "t3",  type: "income"  as const, title: "Freelance payment",amount: 3500,  categoryId: "freelance",  paymentMethod: "credit" as const,      transactionDate: daysAgo(0), note: "Logo design project", createdAt: now, updatedAt: now },
  // Yesterday
  { id: "t4",  type: "expense" as const, title: "Grab Food",        amount: 180,   categoryId: "food",       paymentMethod: "credit" as const,      transactionDate: daysAgo(1), note: undefined, createdAt: now, updatedAt: now },
  { id: "t5",  type: "expense" as const, title: "Uniqlo T-shirt",   amount: 590,   categoryId: "shopping",   paymentMethod: "credit" as const,      transactionDate: daysAgo(1), note: "2 pcs", createdAt: now, updatedAt: now },
  { id: "t6",  type: "expense" as const, title: "Pharmacy",         amount: 245,   categoryId: "health",     paymentMethod: "cash" as const,        transactionDate: daysAgo(1), note: undefined, createdAt: now, updatedAt: now },
  // 2 days ago
  { id: "t7",  type: "income"  as const, title: "Monthly Salary",   amount: 35000, categoryId: "salary",     paymentMethod: "credit" as const,      transactionDate: daysAgo(2), note: undefined, createdAt: now, updatedAt: now },
  { id: "t8",  type: "expense" as const, title: "Netflix",          amount: 299,   categoryId: "entertain",  paymentMethod: "credit" as const,      transactionDate: daysAgo(2), note: undefined, createdAt: now, updatedAt: now },
  { id: "t9",  type: "expense" as const, title: "Electricity bill", amount: 1250,  categoryId: "home",       paymentMethod: "cash" as const,        transactionDate: daysAgo(2), note: undefined, createdAt: now, updatedAt: now },
  // 3 days ago
  { id: "t10", type: "expense" as const, title: "Cat food",         amount: 420,   categoryId: "pet",        paymentMethod: "cash" as const,        transactionDate: daysAgo(3), note: undefined, createdAt: now, updatedAt: now },
  { id: "t11", type: "expense" as const, title: "Online course",    amount: 990,   categoryId: "education",  paymentMethod: "credit" as const,      transactionDate: daysAgo(3), note: "React advanced course", createdAt: now, updatedAt: now },
  // 4 days ago
  { id: "t12", type: "expense" as const, title: "Skincare set",     amount: 875,   categoryId: "beauty",     paymentMethod: "credit" as const,      transactionDate: daysAgo(4), note: undefined, createdAt: now, updatedAt: now },
  { id: "t13", type: "expense" as const, title: "Motorbike taxi",   amount: 40,    categoryId: "transport",  paymentMethod: "cash" as const,        transactionDate: daysAgo(4), note: undefined, createdAt: now, updatedAt: now },
  { id: "t14", type: "income"  as const, title: "Stock dividend",   amount: 1200,  categoryId: "invest",     paymentMethod: "credit" as const,      transactionDate: daysAgo(4), note: undefined, createdAt: now, updatedAt: now },
  // 5 days ago
  { id: "t15", type: "expense" as const, title: "Sushi dinner",     amount: 1450,  categoryId: "food",       paymentMethod: "credit" as const,      transactionDate: daysAgo(5), note: "With friends", createdAt: now, updatedAt: now },
  // installment examples
  { id: "t16", type: "expense" as const, title: "iPhone 16 Pro",    amount: 3500,  categoryId: "shopping",   paymentMethod: "installment" as const,  transactionDate: daysAgo(1), note: "12-month plan", createdAt: now, updatedAt: now },
  { id: "t17", type: "expense" as const, title: "MacBook Air",      amount: 5000,  categoryId: "education",  paymentMethod: "installment" as const,  transactionDate: daysAgo(3), note: "24-month plan", createdAt: now, updatedAt: now },
];

// ─── Seed runner ─────────────────────────────────────────────────────────────
async function seed() {
  console.log("🌱 Seeding database...");

  // Upsert categories (idempotent)
  for (const cat of SEED_CATEGORIES) {
    const existing = await db.query.categories.findFirst({ where: eq(categories.id, cat.id) });
    if (!existing) {
      await db.insert(categories).values(cat);
      console.log(`  ✓ category: ${cat.icon} ${cat.name}`);
    }
  }

  // Upsert accounts (idempotent)
  for (const acc of SEED_ACCOUNTS) {
    const existing = await db.query.accounts.findFirst({ where: eq(accounts.id, acc.id) });
    if (!existing) {
      await db.insert(accounts).values(acc);
      console.log(`  ✓ account: ${acc.name}`);
    }
  }

  // Insert transactions only if table is empty
  const existingTxCount = await db.$count(transactions);
  if (existingTxCount === 0) {
    for (const tx of SEED_TRANSACTIONS) {
      await db.insert(transactions).values(tx);
    }
    console.log(`  ✓ inserted ${SEED_TRANSACTIONS.length} transactions`);
  } else {
    console.log(`  ↩  transactions already seeded (${existingTxCount} rows)`);
  }

  console.log("✅ Seed complete.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
