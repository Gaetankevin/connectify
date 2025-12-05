import "server-only";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

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

  console.log(`createSession: creating session for userId=${userId}`);

  try {
    // store hashed token in DB (cast as any until generated types are synced)
    await prisma.session.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
    console.log(`createSession: prisma.session.create succeeded for userId=${userId}`);
  } catch (err) {
    console.error(`createSession: prisma.session.create failed for userId=${userId}:`, err);
    throw err;
  }

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

  console.log(`createSession: cookie set for userId=${userId} (name=${SESSION_COOKIE_NAME})`);

  return { rawToken, expiresAt };
}

export async function getUserFromSession() {
  const cookieStore = await cookies();
  const c = cookieStore.get(SESSION_COOKIE_NAME);
  const raw = c?.value;
  if (!raw) return null;
  const hashed = await hashToken(raw);
  // Retry a few times for transient connection issues (e.g. brief DB hiccups)
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const session = await prisma.session.findFirst({
        where: {
          token: hashed,
          expiresAt: { gt: new Date() },
        },
        include: { user: true },
      });
      if (!session) return null;
      return session.user;
    } catch (err) {
      console.error(`Prisma session lookup failed (attempt ${attempt}):`, err);
      if (attempt < maxAttempts) {
        // small backoff before retrying
        await new Promise((r) => setTimeout(r, 200 * attempt));
        continue;
      }
      // after final attempt, return null so callers treat as unauthenticated
      return null;
    }
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  const c = cookieStore.get(SESSION_COOKIE_NAME);
  const raw = c?.value;
  if (raw) {
  try {
    const hashed = await hashToken(raw);
    await prisma.session.deleteMany({ where: { token: hashed } });
  } catch (err) {
    console.error("Prisma destroy session failed:", err);
    // continue to clear cookie even if DB operation failed
  }
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      path: "/",
      expires: new Date(0),
    });
  }
}
