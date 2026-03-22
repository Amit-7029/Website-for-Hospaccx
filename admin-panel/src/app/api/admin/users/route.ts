import { NextResponse } from "next/server";
import { z } from "zod";
import { getFirebaseAdminServices } from "@/lib/firebase/admin";
import { DEFAULT_ROLE_RECORDS, getDefaultRoleId, getLegacyPermissions, inferRoleFromPermissions, mergeWithSystemRole } from "@/lib/rbac";
import { sessionHasPermission } from "@/lib/rbac";
import { getSessionUser } from "@/lib/session";
import type { RoleRecord } from "@/types";

const createUserSchema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  password: z.string().min(8),
  roleId: z.string().trim().min(2).default(getDefaultRoleId("staff")),
  status: z.enum(["active", "inactive"]).default("active"),
});

const updateUserSchema = z.object({
  id: z.string().trim().min(2),
  name: z.string().trim().min(2).optional(),
  roleId: z.string().trim().min(2).optional(),
  status: z.enum(["active", "inactive"]).optional(),
});

export async function POST(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sessionHasPermission(sessionUser, "users_add")) {
    return NextResponse.json({ error: "User add permission required" }, { status: 403 });
  }

  try {
    const payload = createUserSchema.parse(await request.json());
    const { auth, db } = getFirebaseAdminServices();
    const roleSnapshot = await db.collection("roles").doc(payload.roleId).get();
    const fallbackRole = DEFAULT_ROLE_RECORDS.find((item) => item.id === payload.roleId) ?? null;
    const roleData = roleSnapshot.exists
      ? ({ id: roleSnapshot.id, ...roleSnapshot.data() } as RoleRecord)
      : fallbackRole;
    const resolvedRoleData = roleData ? mergeWithSystemRole(roleData) : null;
    const permissions = resolvedRoleData?.permissions?.length ? resolvedRoleData.permissions : getLegacyPermissions("staff");
    const role = inferRoleFromPermissions(permissions);
    const createdUser = await auth.createUser({
      email: payload.email,
      password: payload.password,
      displayName: payload.name,
      disabled: payload.status === "inactive",
    });

    const timestamp = new Date().toISOString();
    const userRecord = {
      email: payload.email,
      name: payload.name,
      role,
      roleId: resolvedRoleData?.id ?? getDefaultRoleId("staff"),
      roleName: resolvedRoleData?.name ?? "Staff",
      permissions,
      status: payload.status,
      updatedAt: timestamp,
      createdAt: timestamp,
    };

    await db.collection("users").doc(createdUser.uid).set(userRecord, { merge: true });

    return NextResponse.json({
      id: createdUser.uid,
      ...userRecord,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to create user",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!sessionHasPermission(sessionUser, "users_edit")) {
    return NextResponse.json({ error: "User edit permission required" }, { status: 403 });
  }

  try {
    const payload = updateUserSchema.parse(await request.json());
    if (payload.id === sessionUser.uid && payload.status === "inactive") {
      return NextResponse.json({ error: "You cannot deactivate your own account" }, { status: 400 });
    }

    const { auth, db } = getFirebaseAdminServices();
    const userRef = db.collection("users").doc(payload.id);
    const snapshot = await userRef.get();
    if (!snapshot.exists) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const current = snapshot.data() ?? {};
    let roleId = typeof current.roleId === "string" ? current.roleId : getDefaultRoleId("staff");
    let roleName = typeof current.roleName === "string" ? current.roleName : "Staff";
    let permissions = Array.isArray(current.permissions) ? current.permissions : getLegacyPermissions("staff");

    if (payload.roleId) {
      const roleSnapshot = await db.collection("roles").doc(payload.roleId).get();
      const fallbackRole = DEFAULT_ROLE_RECORDS.find((item) => item.id === payload.roleId) ?? null;
      if (!roleSnapshot.exists && !fallbackRole) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      const roleData = roleSnapshot.exists
        ? ({ id: roleSnapshot.id, ...roleSnapshot.data() } as RoleRecord)
        : fallbackRole;
      const resolvedRoleData = roleData ? mergeWithSystemRole(roleData) : null;
      if (!resolvedRoleData) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }
      roleId = resolvedRoleData.id;
      roleName = resolvedRoleData.name;
      permissions = resolvedRoleData.permissions;
    }

    const role = inferRoleFromPermissions(permissions);
    const status = payload.status ?? (current.status === "inactive" ? "inactive" : "active");
    const updatePayload = {
      ...current,
      ...(payload.name ? { name: payload.name } : {}),
      role,
      roleId,
      roleName,
      permissions,
      status,
      updatedAt: new Date().toISOString(),
    };

    await userRef.set(updatePayload, { merge: true });

    if (payload.status) {
      await auth.updateUser(payload.id, { disabled: payload.status === "inactive" });
    }

    if (payload.name) {
      await auth.updateUser(payload.id, { displayName: payload.name });
    }

    return NextResponse.json({
      id: payload.id,
      ...updatePayload,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to update user",
      },
      { status: 500 },
    );
  }
}
