import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getFirebaseAdminServices } from "@/lib/firebase/admin";
import { SESSION_COOKIE, signSessionToken } from "@/lib/session";
import type { AdminUser, UserRole } from "@/types";

function resolveRole(email: string, role?: string): UserRole {
  if (role === "admin" || role === "staff") {
    return role;
  }

  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((item) => item.trim().toLowerCase()) ?? [];
  return adminEmails.includes(email.toLowerCase()) ? "admin" : "staff";
}

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token" }, { status: 400 });
    }

    const { auth, db } = getFirebaseAdminServices();
    const decoded = await auth.verifyIdToken(idToken);
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const role = resolveRole(decoded.email ?? "", userDoc.data()?.role);
    const profile = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: userDoc.data()?.name ?? decoded.name ?? decoded.email?.split("@")[0] ?? "Admin User",
      role,
    } satisfies AdminUser;

    if (!userDoc.exists) {
      await db.collection("users").doc(decoded.uid).set(
        {
          email: profile.email,
          name: profile.name,
          role: profile.role,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        { merge: true },
      );
    }

    const token = await signSessionToken(profile);
    cookies().set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json(
      { user: profile },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create admin session",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}

export async function DELETE() {
  cookies().delete(SESSION_COOKIE);
  return NextResponse.json(
    { success: true },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
