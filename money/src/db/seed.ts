/**
 * Seed script — run once after db:push.
 * Usage: npm run db:seed
 */
import { db } from "./client";
import { categories, transactions, accounts } from "./schema";
import { eq } from "drizzle-orm";

const SEED_CATEGORIES = [
  { id: "food",       name: "Food & Drink",  icon: "food",       color: "#FF9F43", type: "expense" as const },
  { id: "transport",  name: "Transport",     icon: "transport",  color: "#54A0FF", type: "expense" as const },
  { id: "shopping",   name: "Shopping",      icon: "shopping",   color: "#FF6B9D", type: "expense" as const },
  { id: "health",     name: "Health",        icon: "health",     color: "#48CAE4", type: "expense" as const },
  { id: "home",       name: "Home",          icon: "home",       color: "#A29BFE", type: "expense" as const },
  { id: "entertain",  name: "Entertainment", icon: "entertain",  color: "#FD79A8", type: "expense" as const },
  { id: "education",  name: "Education",     icon: "education",  color: "#6C5CE7", type: "expense" as const },
  { id: "beauty",     name: "Beauty",        icon: "beauty",     color: "#FDCB6E", type: "expense" as const },
  { id: "pet",        name: "Pets",          icon: "pet",        color: "#00B894", type: "expense" as const },
  { id: "other_exp",  name: "Other",         icon: "other_exp",  color: "#B2BEC3", type: "expense" as const },
  { id: "salary",     name: "Salary",        icon: "salary",     color: "#00CEC9", type: "income"  as const },
  { id: "freelance",  name: "Freelance",     icon: "freelance",  color: "#55EFC4", type: "income"  as const },
  { id: "invest",     name: "Investment",    icon: "invest",     color: "#0984E3", type: "income"  as const },
  { id: "other_inc",  name: "Other Income",  icon: "other_inc",  color: "#A8D5A2", type: "income"  as const },
];

const SEED_ACCOUNTS = [
  { id: "cash_wallet", name: "Cash Wallet",  balance: 5000,  type: "cash"   as const, createdAt: new Date().toISOString() },
  { id: "bank_main",   name: "Bank Account", balance: 80000, type: "bank"   as const, createdAt: new Date().toISOString() },
  { id: "credit_main", name: "Credit Card",  balance: 0,     type: "credit" as const, createdAt: new Date().toISOString() },
];

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

const now = new Date().toISOString();

const SEED_TRANSACTIONS = [
  { id: "t1",  type: "expense" as const, title: "Pad Thai",         amount: 65,    categoryId: "food",       paymentMethod: "cash"        as const, transactionDate: daysAgo(0), note: "Lunch at street food",  createdAt: now, updatedAt: now },
  { id: "t2",  type: "expense" as const, title: "BTS Skytrain",     amount: 52,    categoryId: "transport",  paymentMethod: "cash"        as const, transactionDate: daysAgo(0), note: null, createdAt: now, updatedAt: now },
  { id: "t3",  type: "income"  as const, title: "Freelance payment",amount: 3500,  categoryId: "freelance",  paymentMethod: "credit"      as const, transactionDate: daysAgo(0), note: "Logo design project",  createdAt: now, updatedAt: now },
  { id: "t4",  type: "expense" as const, title: "Grab Food",        amount: 180,   categoryId: "food",       paymentMethod: "credit"      as const, transactionDate: daysAgo(1), note: null, createdAt: now, updatedAt: now },
  { id: "t5",  type: "expense" as const, title: "Uniqlo T-shirt",   amount: 590,   categoryId: "shopping",   paymentMethod: "credit"      as const, transactionDate: daysAgo(1), note: "2 pcs",                createdAt: now, updatedAt: now },
  { id: "t6",  type: "expense" as const, title: "Pharmacy",         amount: 245,   categoryId: "health",     paymentMethod: "cash"        as const, transactionDate: daysAgo(1), note: null, createdAt: now, updatedAt: now },
  { id: "t7",  type: "income"  as const, title: "Monthly Salary",   amount: 35000, categoryId: "salary",     paymentMethod: "credit"      as const, transactionDate: daysAgo(2), note: null, createdAt: now, updatedAt: now },
  { id: "t8",  type: "expense" as const, title: "Netflix",          amount: 299,   categoryId: "entertain",  paymentMethod: "credit"      as const, transactionDate: daysAgo(2), note: null, createdAt: now, updatedAt: now },
  { id: "t9",  type: "expense" as const, title: "Electricity bill", amount: 1250,  categoryId: "home",       paymentMethod: "cash"        as const, transactionDate: daysAgo(2), note: null, createdAt: now, updatedAt: now },
  { id: "t10", type: "expense" as const, title: "Cat food",         amount: 420,   categoryId: "pet",        paymentMethod: "cash"        as const, transactionDate: daysAgo(3), note: null, createdAt: now, updatedAt: now },
  { id: "t11", type: "expense" as const, title: "Online course",    amount: 990,   categoryId: "education",  paymentMethod: "credit"      as const, transactionDate: daysAgo(3), note: "React advanced course", createdAt: now, updatedAt: now },
  { id: "t12", type: "expense" as const, title: "Skincare set",     amount: 875,   categoryId: "beauty",     paymentMethod: "credit"      as const, transactionDate: daysAgo(4), note: null, createdAt: now, updatedAt: now },
  { id: "t13", type: "expense" as const, title: "Motorbike taxi",   amount: 40,    categoryId: "transport",  paymentMethod: "cash"        as const, transactionDate: daysAgo(4), note: null, createdAt: now, updatedAt: now },
  { id: "t14", type: "income"  as const, title: "Stock dividend",   amount: 1200,  categoryId: "invest",     paymentMethod: "credit"      as const, transactionDate: daysAgo(4), note: null, createdAt: now, updatedAt: now },
  { id: "t15", type: "expense" as const, title: "Sushi dinner",     amount: 1450,  categoryId: "food",       paymentMethod: "credit"      as const, transactionDate: daysAgo(5), note: "With friends",          createdAt: now, updatedAt: now },
  { id: "t16", type: "expense" as const, title: "iPhone 16 Pro",    amount: 3500,  categoryId: "shopping",   paymentMethod: "installment" as const, transactionDate: daysAgo(1), note: "12-month plan",         createdAt: now, updatedAt: now },
  { id: "t17", type: "expense" as const, title: "MacBook Air",      amount: 5000,  categoryId: "education",  paymentMethod: "installment" as const, transactionDate: daysAgo(3), note: "24-month plan",         createdAt: now, updatedAt: now },
];

async function seed() {
  console.log("🌱 Seeding database…");

  for (const cat of SEED_CATEGORIES) {
    const existing = await db.query.categories.findFirst({ where: eq(categories.id, cat.id) });
    if (!existing) {
      await db.insert(categories).values(cat);
      console.log(`  ✓ category: ${cat.name}`);
    }
  }

  for (const acc of SEED_ACCOUNTS) {
    const existing = await db.query.accounts.findFirst({ where: eq(accounts.id, acc.id) });
    if (!existing) {
      await db.insert(accounts).values(acc);
      console.log(`  ✓ account: ${acc.name}`);
    }
  }

  const count = await db.$count(transactions);
  if (count === 0) {
    for (const tx of SEED_TRANSACTIONS) {
      await db.insert(transactions).values(tx);
    }
    console.log(`  ✓ inserted ${SEED_TRANSACTIONS.length} transactions`);
  } else {
    console.log(`  ↩  transactions already seeded (${count} rows)`);
  }

  console.log("✅ Seed complete.");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
