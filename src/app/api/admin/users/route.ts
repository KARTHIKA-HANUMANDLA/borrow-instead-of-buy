import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        studentId: true,
        department: true,
        year: true,
        phone: true,
        avatar: true,
        isVerified: true,
        role: true,
        rating: true,
        ratingCount: true,
        totalSavings: true,
        communityCredits: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            borrowRequests: true,
          },
        },
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("GET admin users error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, isVerified, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const data: any = {};
    if (isVerified !== undefined) data.isVerified = isVerified;
    if (role !== undefined) data.role = role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data,
    });

    // Record admin action
    await prisma.adminAction.create({
      data: {
        adminId: session.userId,
        action: "UPDATE_USER",
        targetType: "USER",
        targetId: userId,
        description: `Updated verification status (${isVerified}) or role (${role}) for user ${updatedUser.name}`,
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("PUT admin user error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
