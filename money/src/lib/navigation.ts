import { EditSearchSchema } from "~/lib/validation";
import type { z } from "zod";

export type EditSearch = z.infer<typeof EditSearchSchema>;

export function buildEditSearch(
  returnTo: EditSearch["returnTo"],
  month?: string,
): EditSearch {
  return { returnTo, month };
}
