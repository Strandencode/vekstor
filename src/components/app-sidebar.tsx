"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Target,
  Kanban,
  Users,
  Mail,
  Bookmark,
  BarChart2,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { authClient } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/search", label: "Søk", icon: Search },
  { href: "/icp", label: "ICP", icon: Target },
  { href: "/pipeline", label: "Pipeline", icon: Kanban },
  { href: "/customers", label: "Kunder", icon: Users },
  { href: "/email", label: "E-post", icon: Mail },
  { href: "/saved", label: "Lagrede", icon: Bookmark },
  { href: "/analytics", label: "Analyse", icon: BarChart2 },
  { href: "/settings", label: "Innstillinger", icon: Settings },
];

interface Props {
  userName: string;
  userEmail: string;
  workspaceName: string;
}

export function AppSidebar({ userName, userEmail, workspaceName }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  return (
    <aside className="w-56 shrink-0 border-r border-[#e8e4dc] bg-[#faf9f6] flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-[#e8e4dc]">
        <span className="text-xl font-bold tracking-tight text-[#1a1a1a]">Vekstor</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === href || pathname.startsWith(href + "/")
                ? "bg-[#1a1a1a] text-white"
                : "text-[#4a4a4a] hover:bg-[#f0ede6] hover:text-[#1a1a1a]"
            )}
          >
            <Icon size={16} />
            {label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-[#e8e4dc] p-2">
        <DropdownMenu>
          <DropdownMenuTrigger
            className="flex items-center gap-2 px-2 py-2 rounded-md hover:bg-[#f0ede6] transition-colors w-full text-left"
          >
            <Avatar className="h-7 w-7">
              <AvatarFallback className="text-xs bg-[#1a1a1a] text-white">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#1a1a1a] truncate">{userName}</p>
              <p className="text-xs text-[#6b6b6b] truncate">{workspaceName}</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-52">
            <DropdownMenuLabel>
              <p className="font-medium">{userName}</p>
              <p className="text-xs text-[#6b6b6b] font-normal">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings size={14} className="mr-2" /> Innstillinger
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} variant="destructive">
              <LogOut size={14} className="mr-2" /> Logg ut
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
