"use client";

import Image from "next/image";
import { ImagePlus, Pencil, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MediaForm } from "@/features/media/components/media-form";
import { useMediaManager } from "@/features/media/hooks/use-media-manager";
import { usePermissions } from "@/hooks/use-permissions";

export default function MediaPage() {
  const { canDeleteMedia, canUploadMedia, canViewMedia } = usePermissions();
  const {
    items,
    totalItems,
    sectionFilter,
    setSectionFilter,
    editingItem,
    setEditingItem,
    itemToDelete,
    setItemToDelete,
    isLoading,
    isSaving,
    saveMedia,
    removeMedia,
  } = useMediaManager();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Manage hero slider images, homepage section visuals, doctors overlay images, and gallery assets used across the website."
        action={canUploadMedia ? { label: "Add media", onClick: () => setEditingItem(null) } : undefined}
      />

      <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-muted-foreground">{totalItems} media assets available</p>
              <div className="w-full md:w-56">
                <Select value={sectionFilter} onChange={(event) => setSectionFilter(event.target.value as typeof sectionFilter)}>
                  <option value="all">All sections</option>
                  <option value="hero">Hero</option>
                  <option value="highlights">Highlights</option>
                  <option value="whyChoose">Why Choose Us</option>
                  <option value="healthcare">Complete Healthcare</option>
                  <option value="pharmacies">Pharmacies</option>
                  <option value="services">Diagnostic Services</option>
                  <option value="doctorsOverlay">Doctors Overlay</option>
                  <option value="gallery">Gallery</option>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-72 rounded-3xl" />
                ))}
              </div>
            ) : items.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                  <Card key={item.id} className="overflow-hidden border bg-background/60 shadow-none">
                    <div className="relative h-52 w-full bg-secondary">
                      <Image src={item.imageUrl} alt={item.alt || item.title} fill className="object-cover" unoptimized />
                    </div>
                    <CardContent className="space-y-3 p-5">
                      <div className="flex flex-wrap gap-2">
                        <Badge>{item.section}</Badge>
                        <Badge variant="secondary">{item.category}</Badge>
                        <Badge variant="outline">Order {item.order}</Badge>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">{item.caption}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button variant="outline" className="flex-1" onClick={() => setEditingItem(item)} disabled={!canUploadMedia}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        {canDeleteMedia ? (
                          <Button variant="destructive" size="icon" onClick={() => setItemToDelete(item)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={ImagePlus}
                title="No media assets yet"
                description="Add hero slides, hospital photos, and gallery images so the public site can render them dynamically."
              />
            )}
          </CardContent>
        </Card>

        {canUploadMedia ? (
          <MediaForm
            item={editingItem}
            items={items}
            preferredSection={sectionFilter === "all" ? undefined : sectionFilter}
            onCancel={() => setEditingItem(null)}
            isSaving={isSaving}
            onSave={saveMedia}
          />
        ) : (
          <Card>
            <CardContent className="p-6 text-sm text-muted-foreground">
              This role can view the media library, but uploading or editing assets requires{" "}
              <span className="font-medium text-foreground">media_upload</span>.
            </CardContent>
          </Card>
        )}
      </div>

      {canDeleteMedia ? (
        <ConfirmDialog
          open={Boolean(itemToDelete)}
          title="Delete media asset?"
          description="This removes the image from the website media library and any section using it."
          destructive
          confirmLabel="Delete media"
          onClose={() => setItemToDelete(null)}
          onConfirm={() => void removeMedia()}
        />
      ) : null}
    </div>
  );
}
