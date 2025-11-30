import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import { type User } from "../generated/prisma/client";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "session";
const SESSION_DAYS = Number(process.env.SESSION_DAYS || "7");

async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateRandomToken(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSession(userId: number) {
  const rawToken = generateRandomToken(48);
  const token = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  // store hashed token in DB (cast as any until generated types are synced)
  await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  // set cookie with raw token
  const cookieStore = await cookies();
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    expires: expiresAt,
  });

  return { rawToken, expiresAt };
}

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const c = cookieStore.get(SESSION_COOKIE_NAME);
  const raw = c?.value;
  if (!raw) return null;
  const hashed = await hashToken(raw);
  const session = await prisma.session.findFirst({
    where: {
      token: hashed,
      expiresAt: { gt: new Date() },
    },
    include: { user: true },
  });
  if (!session) return null;
  return session.user;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const c = cookieStore.get(SESSION_COOKIE_NAME);
  const raw = c?.value;
  if (raw) {
  const hashed = await hashToken(raw);
  await prisma.session.deleteMany({ where: { token: hashed } });
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      expires: new Date(0),
    });
  }
}
