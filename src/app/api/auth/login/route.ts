import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { username, email, password, loginIdentifier } = await req.json();

    const identifier = (loginIdentifier || username || email || "").trim().toLowerCase();

    if (!identifier || !password) {
      return NextResponse.json({ error: "Username or email and password are required" }, { status: 400 });
    }

    // Authenticate using Username OR Email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      studentId: user.studentId,
      avatar: user.avatar || undefined,
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        username: user.username,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
