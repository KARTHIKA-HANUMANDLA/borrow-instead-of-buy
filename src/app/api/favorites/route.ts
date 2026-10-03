import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
      include: {
        item: {
          include: {
            category: true,
            owner: {
              select: {
                id: true,
                name: true,
                avatar: true,
                rating: true,
                isVerified: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error("GET favorites error:", error);
    return NextResponse.json({ error: "Failed to fetch saved items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_itemId: {
          userId: session.userId,
          itemId,
        },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, isFavorited: false });
    } else {
      await prisma.favorite.create({
        data: {
          userId: session.userId,
          itemId,
        },
      });
      return NextResponse.json({ success: true, isFavorited: true });
    }
  } catch (error) {
    console.error("POST favorite error:", error);
    return NextResponse.json({ error: "Failed to toggle favorite" }, { status: 500 });
  }
}
