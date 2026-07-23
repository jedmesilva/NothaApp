import { eq } from "drizzle-orm";
import { db, walletsTable } from "@workspace/db";

/** Retorna a carteira do usuário, criando-a se ainda não existir. */
export async function ensureWallet(userId: string) {
  const [existing] = await db
    .select()
    .from(walletsTable)
    .where(eq(walletsTable.userId, userId))
    .limit(1);

  if (existing) return existing;

  const [wallet] = await db
    .insert(walletsTable)
    .values({ userId })
    .onConflictDoNothing()
    .returning();

  return wallet;
}
