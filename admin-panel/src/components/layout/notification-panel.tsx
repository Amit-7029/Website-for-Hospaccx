"use client";

import Link from "next/link";
import { BellRing } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateTime } from "@/lib/utils";
import { useNotifications } from "@/features/notifications/hooks/use-notifications";

const typeHrefMap = {
  appointment: "/admin/appointments",
  career: "/admin/careers",
  review: "/admin/reviews",
  system: "/admin",
} as const;

export function NotificationPanel() {
  const { items, isLoading, unreadCount, isOpen, setIsOpen, toggleOpen, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="relative">
      <Button size="icon" variant="outline" onClick={toggleOpen} aria-label="Open notifications">
        <BellRing className="h-4 w-4" />
      </Button>
      {unreadCount ? (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground">
          {unreadCount}
        </span>
      ) : null}

      {isOpen ? (
        <>
          <button className="fixed inset-0 z-30 cursor-default bg-transparent" aria-label="Close notifications" onClick={() => setIsOpen(false)} />
          <Card className="absolute right-0 top-14 z-40 w-[min(92vw,380px)] border shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Notifications</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => void markAllAsRead()}>
                Mark all read
              </Button>
            </CardHeader>
            <CardContent className="max-h-[420px] space-y-3 overflow-y-auto">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)
              ) : items.length ? (
                items.map((item) => (
                  <Link
                    key={item.id}
                    href={typeHrefMap[item.type]}
                    className={`block rounded-2xl border p-4 transition hover:border-primary/30 hover:bg-secondary/40 ${item.read ? "bg-background/40" : "bg-primary/5"}`}
                    onClick={() => void markAsRead(item)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{item.message}</p>
                      </div>
                      <Badge variant={item.read ? "secondary" : "warning"}>{item.type}</Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                  </Link>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                  New appointment alerts and system notifications will appear here.
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
