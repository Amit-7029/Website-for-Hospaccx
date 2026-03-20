"use client";

import { MessageSquareQuote } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { RatingStars } from "@/components/shared/rating-stars";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useReviewsManager } from "@/features/reviews/hooks/use-reviews-manager";
import { usePermissions } from "@/hooks/use-permissions";
import { formatDate } from "@/lib/utils";

export default function ReviewsPage() {
  const { canDelete } = usePermissions();
  const {
    items,
    filter,
    setFilter,
    averageRating,
    reviewToDelete,
    setReviewToDelete,
    isLoading,
    updateStatus,
    removeReview,
  } = useReviewsManager();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Reviews"
        description="Moderate incoming feedback, approve genuine patient experiences, and remove inappropriate submissions."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr,1.4fr]">
        <Card>
          <CardHeader>
            <CardTitle>Trust Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl bg-secondary p-5">
              <p className="text-4xl font-semibold">{averageRating}</p>
              <div className="mt-2">
                <RatingStars value={Math.round(Number(averageRating))} readOnly />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Average patient rating across submitted feedback.</p>
            </div>
            <Select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}>
              <option value="all">All reviews</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-4 p-6">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-40 rounded-3xl" />)
            ) : items.length ? (
              items.map((review) => (
                <Card key={review.id} className="border bg-background/50 shadow-none">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{review.name || "Anonymous patient"}</h3>
                          <Badge
                            variant={
                              review.status === "approved"
                                ? "success"
                                : review.status === "rejected"
                                  ? "destructive"
                                  : "warning"
                            }
                          >
                            {review.status}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <RatingStars value={review.rating} readOnly />
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">{review.message}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="outline" onClick={() => void updateStatus(review, "pending")}>
                        Mark pending
                      </Button>
                      <Button variant="secondary" onClick={() => void updateStatus(review, "approved")}>
                        Approve
                      </Button>
                      {canDelete ? (
                        <Button variant="destructive" onClick={() => setReviewToDelete(review)}>
                          Delete
                        </Button>
                      ) : null}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <EmptyState
                icon={MessageSquareQuote}
                title="No reviews yet"
                description="New patient reviews will appear here for moderation as soon as submissions start coming in."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {canDelete ? (
        <ConfirmDialog
          open={Boolean(reviewToDelete)}
          title="Delete review?"
          description="This action permanently removes the review from your moderation queue."
          destructive
          confirmLabel="Delete review"
          onClose={() => setReviewToDelete(null)}
          onConfirm={() => void removeReview()}
        />
      ) : null}
    </div>
  );
}
