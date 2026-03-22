"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { BriefcaseBusiness, CalendarCheck2, ClipboardList, Eye, Globe2, Images, LayoutDashboard, MessageSquareQuote, PanelTop, Settings, ShieldCheck, Stethoscope, Users, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { usePermissions } from "@/hooks/use-permissions";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/store/ui-store";
import type { UserPermission } from "@/types";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: "dashboard_view" },
  { href: "/admin/hero", label: "Hero", icon: PanelTop, permission: "settings_view" },
  { href: "/admin/doctors", label: "Doctors", icon: Stethoscope, permission: "doctors_view" },
  { href: "/admin/careers", label: "Careers", icon: BriefcaseBusiness, permission: ["careers_view", "applications_view"] },
  { href: "/admin/services", label: "Services", icon: ClipboardList, permission: "services_view" },
  { href: "/admin/media", label: "Media", icon: Images, permission: "media_view" },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquareQuote, permission: "reviews_view" },
  { href: "/admin/appointments", label: "Appointments", icon: CalendarCheck2, permission: "appointments_view" },
  { href: "/admin/preview", label: "Preview", icon: Eye, permission: "dashboard_view" },
  { href: "/admin/seo", label: "SEO", icon: Globe2, permission: "seo_view" },
  { href: "/admin/settings", label: "Settings", icon: Settings, permission: "settings_view" },
  { href: "/admin/roles", label: "Roles", icon: ShieldCheck, permission: "roles_view" },
  { href: "/admin/users", label: "Users", icon: Users, permission: "users_view" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, mobileSidebarOpen, closeMobileSidebar } = useUiStore();
  const { hasPermission } = usePermissions();
  const visibleItems = navItems.filter((item) => {
    const requiredPermissions = Array.isArray(item.permission) ? item.permission : [item.permission];
    return requiredPermissions.some((permission) => hasPermission(permission as UserPermission));
  });

  const navigateTo = (href: string, closeDrawer = false) => {
    if (closeDrawer) {
      closeMobileSidebar();
      window.setTimeout(() => {
        window.location.assign(href);
      }, 80);
      return;
    }

    window.location.assign(href);
  };

  return (
    <>
      <motion.aside
        animate={{ width: sidebarOpen ? 280 : 88 }}
        className="sticky top-0 z-40 hidden h-screen shrink-0 overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex lg:flex-col"
      >
        <div className="shrink-0 border-b border-sidebar-border px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Hospaccx Admin</p>
          {sidebarOpen ? (
            <>
              <h2 className="mt-3 text-lg font-semibold leading-tight">{siteConfig.hospitalName}</h2>
              <p className="mt-1 text-sm text-slate-400">{siteConfig.location}</p>
            </>
          ) : null}
        </div>
        <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <button
                type="button"
                key={href}
                onClick={() => navigateTo(href)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-slate-300 hover:bg-sidebar-accent/70 hover:text-white",
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen ? <span>{label}</span> : null}
              </button>
            );
          })}
        </nav>
      </motion.aside>

      {mobileSidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu overlay"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            onClick={closeMobileSidebar}
          />
          <motion.aside
            initial={{ x: -24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -24, opacity: 0 }}
            className="absolute inset-y-0 left-0 flex h-[100dvh] w-[92vw] max-w-[340px] flex-col overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground shadow-2xl"
          >
            <div className="flex shrink-0 items-start justify-between border-b border-sidebar-border px-5 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Hospaccx Admin</p>
                <h2 className="mt-3 text-base font-semibold leading-tight">{siteConfig.hospitalName}</h2>
                <p className="mt-1 text-xs text-slate-400">{siteConfig.location}</p>
              </div>
              <button
                type="button"
                onClick={closeMobileSidebar}
                className="rounded-xl border border-sidebar-border p-2 text-slate-300"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 pb-6 pt-4">
              {visibleItems.map(({ href, label, icon: Icon }) => {
                const active = pathname === href;
                return (
                  <button
                    type="button"
                    key={href}
                    onClick={() => navigateTo(href, true)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition-all",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-slate-300 hover:bg-sidebar-accent/70 hover:text-white",
                    )}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.aside>
        </div>
      ) : null}
    </>
  );
}
