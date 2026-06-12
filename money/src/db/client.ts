import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// For local dev: file:local.db
// For Turso production: set TURSO_DATABASE_URL + TURSO_AUTH_TOKEN env vars
const client = createClient({
  url:       process.env["TURSO_DATABASE_URL"] ?? "file:local.db",
  authToken: process.env["TURSO_AUTH_TOKEN"],
});

export const db = drizzle(client, { schema });

export type Db = typeof db;
