"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { listCollection, loadCmsContent } from "@/lib/firebase/repository";
import type { ActivityLog, Appointment, CmsContent, DashboardAnalytics, DashboardStats, Doctor, Review } from "@/types";

function toDateValue(value?: string) {
  const parsed = value ? new Date(value) : new Date(0);
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed;
}

function buildDailyAppointments(appointments: Appointment[]) {
  const today = new Date();
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(today);
    current.setDate(today.getDate() - (6 - index));
    const label = current.toLocaleDateString("en-IN", { weekday: "short" });
    const count = appointments.filter((appointment) => {
      const createdAt = toDateValue(appointment.createdAt || appointment.date);
      return createdAt.toDateString() === current.toDateString();
    }).length;
    return { label, value: count };
  });
}

function buildMonthlyGrowth(appointments: Appointment[]) {
  const today = new Date();
  return Array.from({ length: 6 }, (_, index) => {
    const current = new Date(today.getFullYear(), today.getMonth() - (5 - index), 1);
    const label = current.toLocaleDateString("en-IN", { month: "short" });
    const count = appointments.filter((appointment) => {
      const createdAt = toDateValue(appointment.createdAt || appointment.date);
      return createdAt.getMonth() === current.getMonth() && createdAt.getFullYear() === current.getFullYear();
    }).length;
    return { label, value: count };
  });
}

function buildReviewRatings(reviews: Review[]) {
  return [5, 4, 3, 2, 1].map((rating) => ({
    label: `${rating}★`,
    value: reviews.filter((review) => review.rating === rating).length,
  }));
}

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
  const [analytics, setAnalytics] = useState<DashboardAnalytics>({
    dailyAppointments: [],
    monthlyGrowth: [],
    reviewRatings: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function run() {
      setIsLoading(true);
      try {
        const [doctorsResult, appointmentsResult, reviewsResult, activityLogsResult, cmsContentResult] = await Promise.allSettled([
          listCollection<Doctor>("doctors"),
          listCollection<Appointment>("appointments"),
          listCollection<Review>("reviews"),
          listCollection<ActivityLog>("activityLogs"),
          loadCmsContent(),
        ]);

        const doctors = doctorsResult.status === "fulfilled" ? doctorsResult.value : [];
        const appointments = appointmentsResult.status === "fulfilled" ? appointmentsResult.value : [];
        const reviews = reviewsResult.status === "fulfilled" ? reviewsResult.value : [];
        const activityLogs = activityLogsResult.status === "fulfilled" ? activityLogsResult.value : [];
        const cmsContent = cmsContentResult.status === "fulfilled" ? cmsContentResult.value : null;

        setStats({
          totalDoctors: doctors.length,
          totalAppointments: appointments.length,
          totalReviews: reviews.length,
          pendingReviews: reviews.filter((review) => review.status === "pending").length,
          pendingAppointments: appointments.filter((appointment) => appointment.status === "pending").length,
        });
        setActivity(activityLogs.slice(0, 6));
        setCms(cmsContent);
        setAnalytics({
          dailyAppointments: buildDailyAppointments(appointments),
          monthlyGrowth: buildMonthlyGrowth(appointments),
          reviewRatings: buildReviewRatings(reviews),
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    }

    void run();
  }, []);

  return useMemo(
    () => ({
      stats,
      activity,
      cms,
      analytics,
      isLoading,
    }),
    [activity, analytics, cms, isLoading, stats],
  );
}
