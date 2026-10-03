import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const items = await prisma.item.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
          },
        },
        _count: {
          select: {
            borrowRequests: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET admin items error:", error);
    return NextResponse.json({ error: "Failed to fetch admin items" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { itemId, isApproved, isAvailable } = await req.json();

    if (!itemId) {
      return NextResponse.json({ error: "Item ID is required" }, { status: 400 });
    }

    const data: any = {};
    if (isApproved !== undefined) data.isApproved = isApproved;
    if (isAvailable !== undefined) data.isAvailable = isAvailable;

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data,
    });

    await prisma.adminAction.create({
      data: {
        adminId: session.userId,
        action: "MODERATE_ITEM",
        targetType: "ITEM",
        targetId: itemId,
        description: `Set approval (${isApproved}) or availability (${isAvailable}) for item ${updatedItem.title}`,
      },
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error) {
    console.error("PUT admin item error:", error);
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}
