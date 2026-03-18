"use client";

import { useEffect, useMemo, useState } from "react";
import { listCollection, loadCmsContent } from "@/lib/firebase/repository";
import type { ActivityLog, Appointment, CmsContent, DashboardStats, Doctor, Review } from "@/types";

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDoctors: 0,
    totalAppointments: 0,
    totalReviews: 0,
    pendingReviews: 0,
    pendingAppointments: 0,
  });
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [cms, setCms] = useState<CmsContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setIsLoading(true);
      const [doctors, appointments, reviews, activityLogs, cmsContent] = await Promise.all([
        listCollection<Doctor>("doctors"),
        listCollection<Appointment>("appointments"),
        listCollection<Review>("reviews"),
        listCollection<ActivityLog>("activityLogs"),
        loadCmsContent(),
      ]);

      setStats({
        totalDoctors: doctors.length,
        totalAppointments: appointments.length,
        totalReviews: reviews.length,
        pendingReviews: reviews.filter((review) => review.status === "pending").length,
        pendingAppointments: appointments.filter((appointment) => appointment.status === "pending").length,
      });
      setActivity(activityLogs.slice(0, 6));
      setCms(cmsContent);
      setIsLoading(false);
    }

    void run();
  }, []);

  return useMemo(
    () => ({
      stats,
      activity,
      cms,
      isLoading,
    }),
    [activity, cms, isLoading, stats],
  );
}
