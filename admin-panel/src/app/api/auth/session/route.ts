import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getFirebaseAdminServices } from "@/lib/firebase/admin";
import { DEFAULT_ROLE_RECORDS, getDefaultRoleId, getLegacyPermissions, normalizeLegacyRole, normalizeUserStatus, sanitizePermissions } from "@/lib/rbac";
import { SESSION_COOKIE, signSessionToken } from "@/lib/session";
import type { AdminUser, RoleRecord, UserRole, UserStatus } from "@/types";

function resolveRole(email: string, role?: string): UserRole {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((item) => item.trim().toLowerCase()) ?? [];
  if (adminEmails.includes(email.toLowerCase())) {
    return "admin";
  }

  if (role === "admin" || role === "staff") {
    return normalizeLegacyRole(role);
  }

  return "staff";
}

async function ensureDefaultRoles(db: FirebaseFirestore.Firestore) {
  const batch = db.batch();

  for (const role of DEFAULT_ROLE_RECORDS) {
    batch.set(
      db.collection("roles").doc(role.id),
      {
        ...role,
        updatedAt: new Date().toISOString(),
        createdAt: role.createdAt ?? new Date().toISOString(),
      },
      { merge: true },
    );
  }

  await batch.commit();
}

async function resolveRoleRecord(
  db: FirebaseFirestore.Firestore,
  roleId: string | undefined,
  fallbackRole: UserRole,
) {
  const safeRoleId = roleId || getDefaultRoleId(fallbackRole);
  const snapshot = await db.collection("roles").doc(safeRoleId).get();

  if (!snapshot.exists) {
    const fallback = DEFAULT_ROLE_RECORDS.find((item) => item.id === getDefaultRoleId(fallbackRole)) ?? DEFAULT_ROLE_RECORDS[0];
    return {
      id: fallback.id,
      record: fallback,
    };
  }

  const data = snapshot.data() as Partial<RoleRecord>;
  return {
    id: snapshot.id,
    record: {
      id: snapshot.id,
      name: data.name ?? (fallbackRole === "admin" ? "Admin" : "Staff"),
      description: data.description ?? "",
      permissions: sanitizePermissions(data.permissions ?? getLegacyPermissions(fallbackRole)),
      system: Boolean(data.system),
    } satisfies RoleRecord,
  };
}

export async function POST(request: Request) {
  try {
    const { idToken } = (await request.json()) as { idToken?: string };
    if (!idToken) {
      return NextResponse.json({ error: "Missing Firebase ID token" }, { status: 400 });
    }

    const { auth, db } = getFirebaseAdminServices();
    const decoded = await auth.verifyIdToken(idToken);
    await ensureDefaultRoles(db);
    const userDoc = await db.collection("users").doc(decoded.uid).get();
    const userData = userDoc.data() as
        | {
          role?: string;
          roleId?: string;
          name?: string;
          status?: string;
          createdAt?: string;
        }
      | undefined;
    const role = resolveRole(decoded.email ?? "", userData?.role);
    const status: UserStatus = normalizeUserStatus(userData?.status);
    if (status === "inactive") {
      return NextResponse.json({ error: "This account is inactive. Please contact an administrator." }, { status: 403 });
    }

    const preferredRoleId =
      role === "admin" && (!userData?.roleId || userData.roleId === getDefaultRoleId("staff"))
        ? getDefaultRoleId("admin")
        : userData?.roleId;
    const resolvedRole = await resolveRoleRecord(db, preferredRoleId, role);
    const profile = {
      uid: decoded.uid,
      email: decoded.email ?? "",
      name: userData?.name ?? decoded.name ?? decoded.email?.split("@")[0] ?? "Admin User",
      role,
      roleId: resolvedRole.id,
      roleName: resolvedRole.record.name,
      permissions: resolvedRole.record.permissions,
      status,
      isActive: status === "active",
    } satisfies AdminUser;

    await db.collection("users").doc(decoded.uid).set(
      {
        email: profile.email,
        name: profile.name,
        role: profile.role,
        roleId: profile.roleId,
        roleName: profile.roleName,
        permissions: profile.permissions,
        status: profile.status,
        updatedAt: new Date().toISOString(),
        createdAt: userDoc.exists ? userData?.["createdAt"] ?? new Date().toISOString() : new Date().toISOString(),
      },
      { merge: true },
    );

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
