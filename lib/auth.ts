import "server-only";

import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "ahsap_admin_session";

function secret() {
  return process.env.ADMIN_SESSION_SECRET || "local-dev-secret-change-me";
}

function password() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

export function createAdminSessionValue() {
  return createHmac("sha256", secret()).update(`admin:${password()}`).digest("hex");
}

export function verifyPassword(input: string) {
  return input === password();
}

export function isAdminAuthenticated() {
  const value = cookies().get(ADMIN_COOKIE)?.value;
  if (!value) return false;
  const expected = createAdminSessionValue();
  try {
    return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function requireAdmin() {
  if (!isAdminAuthenticated()) throw new Error("Yetkisiz işlem");
}