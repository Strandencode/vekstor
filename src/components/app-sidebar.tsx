"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Search,
  Mail,
  Bookmark,
  Kanban,
  Users,
  Target,
  BarChart3,
  Settings,
  LogOut,
  ChevronDown,
  History,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";

const NAV_SECTIONS = [
  {
    label: "",
    items: [{ label: "Home", icon: Home, href: "/dashboard" }],
  },
  {
    label: "Leads",
    items: [
      { label: "Prospektering", icon: Search, href: "/search" },
      { label: "E-postmaler", icon: Mail, href: "/email" },
      { label: "Lagrede lister", icon: Bookmark, href: "/saved" },
    ],
  },
  {
    label: "Kunder",
    items: [
      { label: "Pipeline", icon: Kanban, href: "/pipeline" },
      { label: "Kunder", icon: Users, href: "/customers" },
    ],
  },
  {
    label: "Innsikt",
    items: [
      { label: "ICP-analyse", icon: Target, href: "/icp" },
      { label: "Analytics", icon: BarChart3, href: "/analytics" },
    ],
  },
];

interface Props {
  userName: string;
  userEmail: string;
  workspaceName: string;
  plan?: string;
}

export function AppSidebar({ userName, userEmail, workspaceName, plan = "professional" }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  async function handleSignOut() {
    await authClient.signOut();
    router.push("/sign-in");
  }

  function isActive(href: string) {
    return pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
  }

  const navItemClass = (href: string) =>
    `flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[0.85rem] transition-all duration-150 mb-0.5 ${
      isActive(href)
        ? "bg-ink text-canvas font-medium"
        : "text-ink-muted hover:text-ink hover:bg-canvas-warm"
    }`;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[240px] bg-canvas-soft flex flex-col border-r border-bdr z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-bdr">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center w-full text-left"
        >
          <span
            className="text-[1.25rem] font-bold tracking-tight text-ink"
            style={{ fontFamily: "var(--font-work-sans), system-ui, sans-serif" }}
          >
            vekstor
          </span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-3 overflow-y-auto">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.label || sIdx} className={sIdx > 0 ? "mt-4" : ""}>
            {section.label && (
              <div className="text-[0.62rem] uppercase tracking-[0.15em] text-ink-subtle font-semibold px-3 mb-1.5">
                {section.label}
              </div>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={navItemClass(item.href)}
                >
                  <Icon size={16} />
                  {item.label}
                </button>
              );
            })}
          </div>
        ))}

        <div className="my-4 mx-3 border-t border-bdr" />

        <button
          onClick={() => router.push("/settings")}
          className={navItemClass("/settings")}
        >
          <Settings size={16} />
          Innstillinger
        </button>
      </nav>

      {/* Activity */}
      <div className="px-3 pb-1">
        <button
          onClick={() => router.push("/pipeline")}
          className="flex items-center gap-2.5 w-full px-3 py-2 rounded-md text-[0.85rem] text-ink-muted hover:text-ink hover:bg-canvas-warm transition-all duration-150"
        >
          <History size={16} />
          <span className="flex-1 text-left">Aktivitet</span>
        </button>
      </div>

      {/* User card */}
      <div className="p-3 border-t border-bdr relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="flex items-center gap-2.5 p-2 rounded-md w-full hover:bg-canvas-warm transition-all duration-150"
        >
          <div className="w-8 h-8 rounded-md flex items-center justify-center text-[0.72rem] font-semibold text-canvas bg-ink flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="text-[0.8rem] font-medium text-ink truncate">{userName}</div>
            <div className="text-[0.65rem] text-ink-subtle uppercase tracking-wider font-semibold">
              {plan}
            </div>
          </div>
          <ChevronDown
            size={14}
            className={`text-ink-subtle transition-transform flex-shrink-0 ${showUserMenu ? "rotate-180" : ""}`}
          />
        </button>

        {showUserMenu && (
          <div className="absolute bottom-full left-3 right-3 mb-1 rounded-md border border-bdr bg-canvas-soft shadow-lg overflow-hidden">
            <div className="px-4 py-2.5 border-b border-bdr">
              <p className="text-[0.8rem] font-medium text-ink">{userName}</p>
              <p className="text-[0.72rem] text-ink-subtle">{userEmail}</p>
            </div>
            <button
              onClick={() => { router.push("/settings"); setShowUserMenu(false); }}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[0.8rem] text-ink-muted hover:text-ink hover:bg-canvas-warm transition-all"
            >
              <Settings size={14} />
              Innstillinger
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[0.8rem] text-err hover:bg-rose-50 transition-all border-t border-bdr"
            >
              <LogOut size={14} />
              Logg ut
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
