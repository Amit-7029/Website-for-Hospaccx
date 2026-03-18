"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  value,
  onChange,
  readOnly = false,
}: {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const rating = index + 1;
        const active = rating <= value;
        return (
          <button
            key={rating}
            type="button"
            className={cn(
              "rounded-full p-1 transition-transform hover:scale-110",
              readOnly ? "cursor-default" : "cursor-pointer",
            )}
            onClick={() => onChange?.(rating)}
            disabled={readOnly}
            aria-label={`Rate ${rating} star${rating > 1 ? "s" : ""}`}
          >
            <Star className={cn("h-5 w-5", active ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
          </button>
        );
      })}
    </div>
  );
}
