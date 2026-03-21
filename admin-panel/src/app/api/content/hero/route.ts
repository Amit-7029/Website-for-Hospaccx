import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdminServices } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/session";
import { DEFAULT_HERO_CONTENT } from "@/lib/constants";
import { sessionHasPermission } from "@/lib/rbac";

export const dynamic = "force-dynamic";

const heroSchema = z.object({
  heading: z.string().trim().min(5),
  subheading: z.string().trim().min(5),
  primaryButtonText: z.string().trim().min(2),
  secondaryButtonText: z.string().trim().min(2),
  primaryButtonLink: z.string().trim().min(1),
  secondaryButtonLink: z.string().trim().min(1),
  imageUrl: z.string().trim().min(1),
  backgroundImageUrl: z.string().trim().min(1),
  overlayOpacity: z.number().min(0.3).max(0.7),
  overlayColor: z.string().trim().min(4).max(32),
});

export async function GET() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sessionHasPermission(sessionUser, "settings_view")) {
    return NextResponse.json({ error: "Settings permission required" }, { status: 403 });
  }

  try {
    const { db } = getFirebaseAdminServices();
    const snapshot = await db.collection("content").doc("hero").get();
    const content = snapshot.exists ? snapshot.data() : null;

    return NextResponse.json(
      {
        ...DEFAULT_HERO_CONTENT,
        ...(content || {}),
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    console.error("Hero content GET error:", error);
    return NextResponse.json({ error: "Unable to load hero content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sessionHasPermission(sessionUser, "settings_edit")) {
    return NextResponse.json({ error: "Settings permission required" }, { status: 403 });
  }

  try {
    const payload = heroSchema.parse(await request.json());
    const timestamp = new Date().toISOString();
    const { db } = getFirebaseAdminServices();

    const nextContent = {
      ...payload,
      updatedAt: timestamp,
      createdAt: timestamp,
    };

    const batch = db.batch();
    batch.set(db.collection("content").doc("hero"), nextContent, { merge: true });
    batch.set(
      db.collection("cms").doc("website"),
      {
        heroHeading: payload.heading,
        heroDescription: payload.subheading,
        heroPrimaryCtaLabel: payload.primaryButtonText,
        heroSecondaryCtaLabel: payload.secondaryButtonText,
        updatedAt: timestamp,
      },
      { merge: true },
    );
    await batch.commit();

    return NextResponse.json(nextContent, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Hero content PUT error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid hero content payload" }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to save hero content" }, { status: 500 });
  }
}
