import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

function createDb() {
  const url = process.env["DATABASE_URL"] ?? "./local.db";
  const sqlite = new Database(url);

  // Performance pragmas
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("synchronous = NORMAL");

  return drizzle(sqlite, { schema });
}

// Module-level singleton — safe because this file is server-only
export const db = createDb();

export type Db = typeof db;
