import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const unreadNotifications = await prisma.notification.count({
    where: {
      userId: user.id,
      isRead: false,
    },
  });

  const unreadMessages = await prisma.message.count({
    where: {
      conversation: {
        OR: [{ borrowerId: user.id }, { ownerId: user.id }],
      },
      senderId: { not: user.id },
      isRead: false,
    },
  });

  return NextResponse.json({
    user,
    counts: {
      unreadNotifications,
      unreadMessages,
    },
  });
}
