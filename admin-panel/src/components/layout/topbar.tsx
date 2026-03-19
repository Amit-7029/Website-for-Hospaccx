"use client";

import { Bell, LogOut, Menu, MoonStar, Search, SunMedium } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUiStore } from "@/store/ui-store";
import { useSession } from "@/components/providers/app-providers";

export function Topbar() {
  const { toggleSidebar, toggleMobileSidebar, theme, setTheme } = useUiStore();
  const { sessionUser, logout } = useSession();

  return (
    <motion.header
      className="glass-panel sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-4 sm:px-6"
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button size="icon" variant="outline" onClick={toggleMobileSidebar} className="inline-flex lg:hidden">
        <Menu className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline" onClick={toggleSidebar} className="hidden lg:inline-flex">
        <Menu className="h-4 w-4" />
      </Button>
      <div className="relative hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search doctors, appointments, reviews..." className="pl-10" />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <Badge variant={sessionUser?.role === "admin" ? "success" : "secondary"} className="hidden sm:inline-flex">
          {sessionUser?.role ?? "staff"}
        </Badge>
        <Button size="icon" variant="outline" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        </Button>
        <Button size="icon" variant="outline" className="hidden sm:inline-flex">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" className="gap-3 px-2 sm:px-3" onClick={() => void logout()}>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold">{sessionUser?.name ?? "Admin User"}</p>
            <p className="text-xs text-muted-foreground">{sessionUser?.email ?? "Not signed in"}</p>
          </div>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </motion.header>
  );
}
