import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { getCurrentWorkspace } from "@/lib/get-workspace";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  const ctx = await getCurrentWorkspace();
  if (!ctx) redirect("/sign-in");

  return (
    <div className="flex h-screen bg-canvas">
      <AppSidebar
        userName={session.user.name}
        userEmail={session.user.email}
        workspaceName={ctx.workspace.name}
        plan={ctx.workspace.plan ?? "trialing"}
      />
      <main className="flex-1 overflow-y-auto ml-[240px]">{children}</main>
    </div>
  );
}
