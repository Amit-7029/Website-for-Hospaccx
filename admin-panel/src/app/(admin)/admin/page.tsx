"use client";

import { CalendarCheck2, MessageSquareQuote, Stethoscope, TimerReset } from "lucide-react";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useDashboardData } from "@/features/dashboard/hooks/use-dashboard-data";
import { formatDateTime } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { stats, activity, cms, isLoading } = useDashboardData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Overview"
        description="Track clinic operations, website content readiness, and pending admin actions from a single place."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Doctors" value={String(stats.totalDoctors)} description="Published profiles" icon={Stethoscope} />
        <StatCard
          title="Appointments"
          value={String(stats.totalAppointments)}
          description={`${stats.pendingAppointments} pending follow-ups`}
          icon={CalendarCheck2}
        />
        <StatCard title="Reviews" value={String(stats.totalReviews)} description={`${stats.pendingReviews} awaiting moderation`} icon={MessageSquareQuote} />
        <StatCard title="Live Operations" value="24x7" description="Emergency support messaging" icon={TimerReset} />
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr,0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest admin actions across doctors, services, reviews, and content.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 w-full rounded-2xl" />)
            ) : activity.length ? (
              activity.map((item) => (
                <motion.div
                  key={item.id}
                  className="rounded-2xl border bg-background/70 p-4"
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{item.action}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.actorName} updated {item.entity}
                      </p>
                    </div>
                    <Badge variant={item.actorRole === "admin" ? "success" : "secondary"}>{item.actorRole}</Badge>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{formatDateTime(item.createdAt)}</p>
                </motion.div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Activity logs will appear here as soon as dashboard actions are recorded.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Website Content Status</CardTitle>
            <CardDescription>Core homepage and contact content managed from the CMS module.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading || !cms ? (
              <>
                <Skeleton className="h-20 w-full rounded-2xl" />
                <Skeleton className="h-20 w-full rounded-2xl" />
              </>
            ) : (
              <>
                <div className="rounded-2xl bg-secondary p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Hero</p>
                  <h3 className="mt-2 text-lg font-semibold">{cms.heroHeading}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{cms.heroDescription}</p>
                </div>
                <div className="rounded-2xl bg-secondary p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Contact</p>
                  <p className="mt-2 text-sm font-medium">{cms.contactPhone}</p>
                  <p className="text-sm text-muted-foreground">{cms.contactEmail}</p>
                  <p className="mt-2 text-sm text-muted-foreground">{cms.contactAddress}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
