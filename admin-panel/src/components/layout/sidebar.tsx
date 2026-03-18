"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarCheck2, ClipboardList, LayoutDashboard, MessageSquareQuote, Settings, Stethoscope } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope },
  { href: "/admin/services", label: "Services", icon: ClipboardList },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarCheck2 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUiStore();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 280 : 88 }}
      className="hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col"
    >
      <div className="border-b border-sidebar-border px-6 py-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Hospaccx Admin</p>
        {sidebarOpen ? (
          <>
            <h2 className="mt-3 text-lg font-semibold leading-tight">{siteConfig.hospitalName}</h2>
            <p className="mt-1 text-sm text-slate-400">{siteConfig.location}</p>
          </>
        ) : null}
      </div>
      <nav className="flex-1 space-y-2 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-slate-300 hover:bg-sidebar-accent/70 hover:text-white",
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {sidebarOpen ? <span>{label}</span> : null}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
}
