import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "stadiumtracker-admin";

function getAdminPassword() {
  return process.env.ADMIN_PASSWORD?.trim() ?? "";
}

function getAuthSecret() {
  return process.env.AUTH_SECRET?.trim() ?? "";
}

function createAdminToken() {
  const password = getAdminPassword();
  const secret = getAuthSecret();

  if (!password || !secret) {
    return null;
  }

  return createHmac("sha256", secret).update(password).digest("hex");
}

export async function isAdminAuthenticated() {
  const expectedToken = createAdminToken();

  if (!expectedToken) {
    return false;
  }

  const cookieStore = await cookies();
  const providedToken = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (!providedToken || providedToken.length !== expectedToken.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(providedToken), Buffer.from(expectedToken));
}

export async function requireAdminAccess() {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    throw new Error("Nicht autorisiert");
  }
}

export async function loginWithPassword(password: string) {
  const expectedPassword = getAdminPassword();
  const token = createAdminToken();

  if (!expectedPassword || !token) {
    return false;
  }

  if (password.trim() !== expectedPassword) {
    return false;
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  return true;
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}
