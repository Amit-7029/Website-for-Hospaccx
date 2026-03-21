import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getFirebaseAdminServices } from "@/lib/firebase/admin";
import { DEFAULT_ROLE_RECORDS, getDefaultRoleId, getLegacyPermissions, normalizeLegacyRole, normalizeUserStatus, sanitizePermissions } from "@/lib/rbac";
import type { AdminUser } from "@/types";

export const SESSION_COOKIE = "hospaccx_admin_session";

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }

  return new TextEncoder().encode(secret);
}

export async function signSessionToken(user: AdminUser) {
  return new SignJWT({
    uid: user.uid,
    email: user.email,
    name: user.name,
    role: user.role,
    roleId: user.roleId,
    roleName: user.roleName,
    permissions: user.permissions,
    status: user.status,
    isActive: user.isActive,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSessionSecret());
}

export async function verifySessionToken(token: string) {
  const { payload } = await jwtVerify(token, getSessionSecret());
  return {
    uid: String(payload.uid),
    email: String(payload.email),
    name: String(payload.name),
    role: payload.role === "admin" ? "admin" : "staff",
    roleId: typeof payload.roleId === "string" ? payload.roleId : undefined,
    roleName: typeof payload.roleName === "string" ? payload.roleName : undefined,
    permissions: Array.isArray(payload.permissions) ? payload.permissions.filter((item): item is string => typeof item === "string") : [],
    status: payload.status === "inactive" ? "inactive" : "active",
    isActive: payload.status === "inactive" ? false : Boolean(payload.isActive ?? true),
  } as AdminUser;
}

async function hydrateSessionUser(user: AdminUser) {
  try {
    const { db } = getFirebaseAdminServices();
    const userDoc = await db.collection("users").doc(user.uid).get();
    const userData = userDoc.data() as
      | {
          role?: string;
          roleId?: string;
          roleName?: string;
          name?: string;
          email?: string;
          status?: string;
          permissions?: unknown;
        }
      | undefined;

    const normalizedRole = normalizeLegacyRole(userData?.role ?? user.role);
    const resolvedStatus = normalizeUserStatus(userData?.status ?? user.status);
    const preferredRoleId =
      userData?.roleId ??
      user.roleId ??
      getDefaultRoleId(normalizedRole);

    const roleDoc = await db.collection("roles").doc(preferredRoleId).get();
    const fallbackRole =
      DEFAULT_ROLE_RECORDS.find((item) => item.id === preferredRoleId) ??
      DEFAULT_ROLE_RECORDS.find((item) => item.id === getDefaultRoleId(normalizedRole)) ??
      DEFAULT_ROLE_RECORDS[0];

    const roleRecord = roleDoc.exists
      ? {
          id: roleDoc.id,
          name: String(roleDoc.data()?.name ?? fallbackRole.name),
          permissions: sanitizePermissions(roleDoc.data()?.permissions ?? fallbackRole.permissions),
        }
      : {
          id: fallbackRole.id,
          name: fallbackRole.name,
          permissions: fallbackRole.permissions,
        };

    const explicitPermissions = sanitizePermissions(userData?.["permissions"]);
    const permissions = roleRecord.permissions.length
      ? roleRecord.permissions
      : explicitPermissions.length
        ? explicitPermissions
        : getLegacyPermissions(normalizedRole);

    return {
      ...user,
      email: userData?.email ?? user.email,
      name: userData?.name ?? user.name,
      role: normalizedRole,
      roleId: roleRecord.id,
      roleName: userData?.roleName ?? roleRecord.name,
      permissions,
      status: resolvedStatus,
      isActive: resolvedStatus === "active",
    } satisfies AdminUser;
  } catch {
    return user;
  }
}

export async function getSessionUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    const verified = await verifySessionToken(token);
    return await hydrateSessionUser(verified);
  } catch {
    return null;
  }
}
