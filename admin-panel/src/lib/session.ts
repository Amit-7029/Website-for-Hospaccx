import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
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
  } as AdminUser;
}

export async function getSessionUser() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  try {
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
