import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "college_borrow_instead_of_buy_jwt_secret_key_2026_btech_project";
const TOKEN_COOKIE = "borrow_session_token";

export interface SessionPayload {
  userId: string;
  email: string;
  username?: string | null;
  name: string;
  role: string;
  studentId?: string;
  avatar?: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(TOKEN_COOKIE)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session?.userId) return null;
  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        studentId: true,
        department: true,
        year: true,
        phone: true,
        avatar: true,
        bio: true,
        isVerified: true,
        role: true,
        rating: true,
        ratingCount: true,
        totalSavings: true,
        wasteAvoidedKg: true,
        carbonSavedKg: true,
        itemsReusedCount: true,
        communityCredits: true,
        createdAt: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}
