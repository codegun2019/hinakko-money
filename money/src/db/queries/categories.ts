import { createServerFn } from "@tanstack/react-start";
import { db } from "../client";
import { categories } from "../schema";

export const listCategories = createServerFn({ method: "GET" })
  .handler(async () => {
    return db.select().from(categories).orderBy(categories.type, categories.name);
  });

