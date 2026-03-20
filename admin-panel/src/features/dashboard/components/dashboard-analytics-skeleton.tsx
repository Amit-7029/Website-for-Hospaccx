import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardAnalyticsSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr,1fr]">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index} className={index === 2 ? "xl:col-span-2" : ""}>
          <CardHeader className="space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[260px] w-full rounded-3xl" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
