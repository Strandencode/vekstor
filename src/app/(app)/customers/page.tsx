export const dynamic = "force-dynamic";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import CustomersClient from "./customers-client";
import { redirect } from "next/navigation";

export default async function CustomersPage() {
  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  const list = await db
    .select()
    .from(customers)
    .where(eq(customers.workspaceId, ctx.workspace.id))
    .orderBy(desc(customers.wonDate));

  return <CustomersClient initialCustomers={list} />;
}
