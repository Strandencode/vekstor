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
    <div className="flex h-screen bg-[#faf9f6]">
      <AppSidebar
        userName={session.user.name}
        userEmail={session.user.email}
        workspaceName={ctx.workspace.name}
      />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
