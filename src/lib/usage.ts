import { db } from "@/db";
import { usageCounters } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "@/lib/nanoid";

function currentMonthKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export async function incrementUsage(
  workspaceId: string,
  field: "enrichments" | "emailsSent" | "phonesViewed"
) {
  const monthKey = currentMonthKey();

  const existing = await db.query.usageCounters.findFirst({
    where: and(
      eq(usageCounters.workspaceId, workspaceId),
      eq(usageCounters.monthKey, monthKey)
    ),
  });

  if (existing) {
    await db
      .update(usageCounters)
      .set({
        [field]: (existing[field] ?? 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(usageCounters.id, existing.id));
  } else {
    await db.insert(usageCounters).values({
      id: nanoid(),
      workspaceId,
      monthKey,
      enrichments: field === "enrichments" ? 1 : 0,
      emailsSent: field === "emailsSent" ? 1 : 0,
      phonesViewed: field === "phonesViewed" ? 1 : 0,
      updatedAt: new Date(),
    });
  }
}
