import "server-only";
import { db, ciszuSchema } from "@ciszunetwork/db";
import { and, eq } from "@ciszunetwork/db";

export type PuckPage = {
  path: string;
  data: unknown;
  updatedAt?: Date | null;
};

export async function getPuckPage(app: string, path: string): Promise<PuckPage | null> {
  const rows = await db
    .select()
    .from(ciszuSchema.puckPages)
    .where(and(eq(ciszuSchema.puckPages.app, app), eq(ciszuSchema.puckPages.path, path)))
    .limit(1);
  if (!rows.length) return null;
  const row = rows[0];
  return { path: row.path, data: row.data, updatedAt: row.updatedAt };
}

export async function savePuckPage(app: string, path: string, data: unknown): Promise<void> {
  await db
    .insert(ciszuSchema.puckPages)
    .values({ app, path, data })
    .onConflictDoUpdate({
      target: [ciszuSchema.puckPages.app, ciszuSchema.puckPages.path],
      set: { data, updatedAt: new Date() },
    });
}