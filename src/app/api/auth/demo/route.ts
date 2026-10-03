import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const { role } = await req.json();
    const targetEmail = role === "ADMIN" ? "admin@college.edu" : "student@college.edu";

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      return NextResponse.json({ error: "Demo user not found. Run database seed." }, { status: 404 });
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
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
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Demo login error:", error);
    return NextResponse.json({ error: "Failed to login demo user" }, { status: 500 });
  }
}
