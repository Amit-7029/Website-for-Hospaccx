"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/components/providers/app-providers";
import { usePermissions } from "@/hooks/use-permissions";
import { addActivityLog, deleteDocument, listCollection, saveDocument } from "@/lib/firebase/repository";
import type { Review } from "@/types";

export function useReviewsManager() {
  const { sessionUser } = useSession();
  const { canApproveReviews, canDeleteReviews, canViewReviews, role } = usePermissions();
  const [items, setItems] = useState<Review[]>([]);
  const [filter, setFilter] = useState<Review["status"] | "all">("all");
  const [reviewToDelete, setReviewToDelete] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const reviews = await listCollection<Review>("reviews");
      setItems(reviews);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to load reviews");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((review) => (filter === "all" ? true : review.status === filter));
  }, [filter, items]);

  const updateStatus = async (review: Review, status: Review["status"]) => {
    if (!canApproveReviews) {
      toast.error("You do not have permission to approve or reject reviews");
      return;
    }

    try {
      await saveDocument("reviews", {
        ...review,
        status,
      });
      await addActivityLog({
        action: `Marked review as ${status}`,
        entity: "review",
        entityId: review.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success(`Review marked as ${status}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update review");
    }
  };

  const removeReview = async () => {
    if (!canDeleteReviews) {
      toast.error("You do not have permission to delete reviews");
      return;
    }

    if (!reviewToDelete) {
      return;
    }

    try {
      await deleteDocument("reviews", reviewToDelete.id);
      await addActivityLog({
        action: "Deleted review",
        entity: "review",
        entityId: reviewToDelete.id,
        actorName: sessionUser?.name ?? "Current user",
        actorRole: role,
      });
      toast.success("Review removed");
      setReviewToDelete(null);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to delete review");
    }
  };

  const averageRating = items.length
    ? (items.reduce((sum, review) => sum + review.rating, 0) / items.length).toFixed(1)
    : "0.0";

  return {
    items: filteredItems,
    allItems: items,
    filter,
    setFilter,
    averageRating,
    reviewToDelete,
    setReviewToDelete,
    isLoading,
    updateStatus,
    removeReview,
    canViewReviews,
    canApproveReviews,
    canDeleteReviews,
    canModerateReviews: canApproveReviews || canDeleteReviews,
  };
}
