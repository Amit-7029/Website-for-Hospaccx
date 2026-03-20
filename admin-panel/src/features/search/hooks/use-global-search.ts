"use client";

import { useEffect, useMemo, useState } from "react";
import { listCollection } from "@/lib/firebase/repository";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { Appointment, DiagnosticService, Doctor, GlobalSearchResult } from "@/types";

export function useGlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 220);

  useEffect(() => {
    async function run() {
      const nextQuery = debouncedQuery.trim().toLowerCase();
      if (nextQuery.length < 2) {
        setResults([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const [doctors, services, appointments] = await Promise.all([
          listCollection<Doctor>("doctors"),
          listCollection<DiagnosticService>("services"),
          listCollection<Appointment>("appointments"),
        ]);

        const doctorResults: GlobalSearchResult[] = doctors
          .filter(
            (item) =>
              item.name.toLowerCase().includes(nextQuery) ||
              item.department.toLowerCase().includes(nextQuery) ||
              item.specialization.toLowerCase().includes(nextQuery),
          )
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            type: "doctor",
            title: item.name,
            subtitle: `${item.department} • ${item.specialization}`,
            href: "/admin/doctors",
          }));

        const serviceResults: GlobalSearchResult[] = services
          .filter((item) => item.title.toLowerCase().includes(nextQuery) || item.description.toLowerCase().includes(nextQuery))
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            type: "service",
            title: item.title,
            subtitle: item.category,
            href: "/admin/services",
          }));

        const appointmentResults: GlobalSearchResult[] = appointments
          .filter(
            (item) =>
              item.name.toLowerCase().includes(nextQuery) ||
              item.phone.toLowerCase().includes(nextQuery) ||
              String(item.doctor ?? "").toLowerCase().includes(nextQuery),
          )
          .slice(0, 4)
          .map((item) => ({
            id: item.id,
            type: "appointment",
            title: item.name,
            subtitle: `${item.phone}${item.doctor ? ` • ${item.doctor}` : ""}`,
            href: "/admin/appointments",
          }));

        setResults([...doctorResults, ...serviceResults, ...appointmentResults].slice(0, 10));
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }

    void run();
  }, [debouncedQuery]);

  return useMemo(
    () => ({
      query,
      setQuery,
      results,
      isLoading,
    }),
    [isLoading, query, results],
  );
}
