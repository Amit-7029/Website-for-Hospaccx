import { NextResponse } from "next/server";
import { getFirebaseAdminServices, getFirebaseAdminStorageCandidates } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";
const INLINE_IMAGE_MAX_BYTES = 450 * 1024;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/-+/g, "-");
}

function buildDownloadUrl(bucketName: string, objectPath: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(objectPath)}?alt=media&token=${token}`;
}

function buildInlineDataUrl(file: File, bytes: Buffer) {
  return `data:${file.type};base64,${bytes.toString("base64")}`;
}

export async function POST(request: Request) {
  try {
    const sessionUser = await getSessionUser();
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "doctors").trim() || "doctors";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image size must be under 10 MB" }, { status: 400 });
    }

    const { storage } = getFirebaseAdminServices();
    const bytes = Buffer.from(await file.arrayBuffer());
    const safeFileName = sanitizeFileName(file.name || "doctor-image");
    const objectPath = `${folder}/${Date.now()}-${safeFileName}`;
    const downloadToken = crypto.randomUUID();

    let lastError: unknown = null;

    for (const bucketName of getFirebaseAdminStorageCandidates()) {
      try {
        const bucket = storage.bucket(bucketName);
        await bucket.file(objectPath).save(bytes, {
          resumable: false,
          metadata: {
            contentType: file.type,
            metadata: {
              firebaseStorageDownloadTokens: downloadToken,
            },
          },
        });

        return NextResponse.json({
          url: buildDownloadUrl(bucket.name, objectPath, downloadToken),
          path: objectPath,
        });
      } catch (error) {
        lastError = error;
      }
    }

    if (file.size <= INLINE_IMAGE_MAX_BYTES) {
      return NextResponse.json({
        url: buildInlineDataUrl(file, bytes),
        path: objectPath,
        storageMode: "inline",
      });
    }

    console.error("Doctor image upload failed:", lastError);
    return NextResponse.json(
      {
        error:
          "Firebase Storage is not available for this project yet. Please use an image under 450 KB, or enable Firebase Storage for larger uploads.",
      },
      { status: 500 },
    );
  } catch (error) {
    console.error("Doctor image upload route error:", error);
    return NextResponse.json({ error: "Unable to upload doctor image" }, { status: 500 });
  }
}
