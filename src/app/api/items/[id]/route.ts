import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            department: true,
            year: true,
            rating: true,
            ratingCount: true,
            isVerified: true,
            bio: true,
          },
        },
        reviews: {
          include: {
            reviewer: {
              select: {
                id: true,
                name: true,
                avatar: true,
                department: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        availability: {
          orderBy: { startDate: "asc" },
        },
        borrowRequests: {
          where: {
            status: { in: ["APPROVED", "RESERVED", "BORROWED"] },
          },
          select: {
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Increment views count asynchronously
    await prisma.item.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    let isFavorited = false;
    if (session?.userId) {
      const fav = await prisma.favorite.findUnique({
        where: {
          userId_itemId: {
            userId: session.userId,
            itemId: id,
          },
        },
      });
      isFavorited = !!fav;
    }

    return NextResponse.json({
      item: {
        ...item,
        isFavorited,
      },
    });
  } catch (error) {
    console.error("GET item by id error:", error);
    return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const item = await prisma.item.findUnique({ where: { id } });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.ownerId !== session.userId && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.item.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE item error:", error);
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}
