"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { addActivityLog, deleteDocument, listCollection, saveDocument } from "@/lib/firebase/repository";
import type { Review } from "@/types";

export function useReviewsManager() {
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
    try {
      await saveDocument("reviews", {
        ...review,
        status,
      });
      await addActivityLog({
        action: `Marked review as ${status}`,
        entity: "review",
        entityId: review.id,
        actorName: "Current admin",
        actorRole: "admin",
      });
      toast.success(`Review marked as ${status}`);
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update review");
    }
  };

  const removeReview = async () => {
    if (!reviewToDelete) {
      return;
    }

    try {
      await deleteDocument("reviews", reviewToDelete.id);
      await addActivityLog({
        action: "Deleted review",
        entity: "review",
        entityId: reviewToDelete.id,
        actorName: "Current admin",
        actorRole: "admin",
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
    filter,
    setFilter,
    averageRating,
    reviewToDelete,
    setReviewToDelete,
    isLoading,
    updateStatus,
    removeReview,
  };
}
