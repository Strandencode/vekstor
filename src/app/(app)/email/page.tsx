export const dynamic = "force-dynamic";

import { db } from "@/db";
import { emailTemplates } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import EmailClient from "./email-client";
import { redirect } from "next/navigation";

export default async function EmailPage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const templates = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.workspaceId, ctx.workspace.id))
    .orderBy(desc(emailTemplates.updatedAt));

  return <EmailClient initialTemplates={templates} />;
}
