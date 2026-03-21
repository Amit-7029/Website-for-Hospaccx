"use client";

import { CalendarCheck2, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppointmentsManager } from "@/features/appointments/hooks/use-appointments-manager";
import { usePermissions } from "@/hooks/use-permissions";
import { formatDateTime } from "@/lib/utils";

export default function AppointmentsPage() {
  const { canUpdateAppointments, canViewAppointments } = usePermissions();
  const { items, filter, setFilter, search, setSearch, isLoading, updateStatus, exportCsv } = useAppointmentsManager();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Appointments"
        description="Track appointment requests, update patient status, and export operational data for staff follow-up."
        action={canViewAppointments ? { label: "Export CSV", onClick: exportCsv } : undefined}
      />
      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="grid gap-4 md:grid-cols-[1fr,220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-10"
                placeholder="Search by name, phone, or doctor..."
              />
            </div>
            <Select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
            </Select>
          </div>

          {isLoading ? (
            Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-3xl" />)
          ) : items.length ? (
            items.map((appointment) => (
              <Card key={appointment.id} className="border bg-background/50 shadow-none">
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{appointment.name}</h3>
                        <Badge
                          variant={
                            appointment.status === "completed"
                              ? "success"
                              : appointment.status === "confirmed"
                                ? "default"
                                : "warning"
                          }
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {appointment.phone}
                        {appointment.doctor ? ` | ${appointment.doctor}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(appointment.date)}</p>
                    </div>
                  </div>
                  {appointment.message ? <p className="text-sm text-muted-foreground">{appointment.message}</p> : null}
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => void updateStatus(appointment, "pending")} disabled={!canUpdateAppointments}>
                      Pending
                    </Button>
                    <Button variant="secondary" onClick={() => void updateStatus(appointment, "confirmed")} disabled={!canUpdateAppointments}>
                      Confirm
                    </Button>
                    <Button onClick={() => void updateStatus(appointment, "completed")} disabled={!canUpdateAppointments}>Complete</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <EmptyState
              icon={CalendarCheck2}
              title="No appointments found"
              description="As soon as patient bookings are synced into Firestore, your admin workflow will appear here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
