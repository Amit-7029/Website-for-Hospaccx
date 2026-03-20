"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useGlobalSearch } from "@/features/search/hooks/use-global-search";

export function GlobalSearch() {
  const { query, setQuery, results, isLoading } = useGlobalSearch();

  return (
    <div className="relative w-full max-w-full md:max-w-md">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search doctors, services, appointments..."
        className="pl-10"
      />

      {query.trim().length >= 2 ? (
        <div className="absolute left-0 top-12 z-40 w-full rounded-3xl border bg-background p-2 shadow-xl">
          {isLoading ? (
            <div className="space-y-2 p-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-16 rounded-2xl" />
              ))}
            </div>
          ) : results.length ? (
            <div className="space-y-1">
              {results.map((result) => (
                <Link
                  key={`${result.type}-${result.id}`}
                  href={result.href}
                  className="flex items-start justify-between gap-3 rounded-2xl px-3 py-3 transition hover:bg-secondary"
                >
                  <div>
                    <p className="font-medium">{result.title}</p>
                    <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                  </div>
                  <Badge variant="secondary">{result.type}</Badge>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl px-3 py-4 text-sm text-muted-foreground">No matching admin records found.</div>
          )}
        </div>
      ) : null}
    </div>
  );
}
