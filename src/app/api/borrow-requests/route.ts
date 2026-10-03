import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const roleParam = searchParams.get("role") || "borrower"; // borrower, lender, all
    const statusParam = searchParams.get("status") || "all";

    const where: any = {};

    if (roleParam === "borrower") {
      where.borrowerId = session.userId;
    } else if (roleParam === "lender") {
      where.ownerId = session.userId;
    } else {
      where.OR = [{ borrowerId: session.userId }, { ownerId: session.userId }];
    }

    if (statusParam !== "all") {
      if (statusParam === "active") {
        where.status = { in: ["APPROVED", "RESERVED", "BORROWED", "RETURN_REQUESTED"] };
      } else if (statusParam === "due_soon") {
        where.status = "BORROWED";
      } else {
        where.status = statusParam.toUpperCase();
      }
    }

    const requests = await prisma.borrowRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        item: {
          include: {
            category: true,
          },
        },
        borrower: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            department: true,
            year: true,
            rating: true,
          },
        },
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
          },
        },
        transaction: true,
        returnRecord: true,
        reviews: true,
      },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("GET borrow requests error:", error);
    return NextResponse.json({ error: "Failed to fetch borrow requests" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId, startDate, endDate, purpose, message } = await req.json();

    if (!itemId || !startDate || !endDate) {
      return NextResponse.json({ error: "Item and borrow dates are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ error: "Invalid start or end date" }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ error: "Return date must be after borrow start date" }, { status: 400 });
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: { owner: true },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (item.ownerId === session.userId) {
      return NextResponse.json({ error: "You cannot borrow your own item!" }, { status: 400 });
    }

    if (!item.isAvailable) {
      return NextResponse.json({ error: "Item is currently not available for borrowing" }, { status: 400 });
    }

    if (totalDays > item.maxDurationDays) {
      return NextResponse.json(
        { error: `Maximum borrowing duration for this item is ${item.maxDurationDays} days` },
        { status: 400 }
      );
    }

    // Check overlapping bookings
    const overlapping = await prisma.borrowRequest.findFirst({
      where: {
        itemId,
        status: { in: ["APPROVED", "RESERVED", "BORROWED", "RETURN_REQUESTED"] },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
    });

    if (overlapping) {
      return NextResponse.json(
        { error: "Item is already reserved or borrowed for the selected date range. Please choose different dates." },
        { status: 400 }
      );
    }

    const estimatedCost = totalDays * item.pricePerDay;
    const securityDeposit = item.securityDeposit;

    const borrowRequest = await prisma.borrowRequest.create({
      data: {
        itemId,
        borrowerId: session.userId,
        ownerId: item.ownerId,
        startDate: start,
        endDate: end,
        totalDays,
        estimatedCost,
        securityDeposit,
        purpose: purpose ? purpose.trim() : null,
        message: message ? message.trim() : null,
        status: "REQUESTED",
      },
      include: {
        item: true,
        borrower: {
          select: { name: true, department: true },
        },
      },
    });

    // Notify Owner
    await prisma.notification.create({
      data: {
        userId: item.ownerId,
        title: "New Borrow Request Received 📩",
        message: `${session.name} requested to borrow '${item.title}' for ${totalDays} day(s).`,
        type: "BORROW_REQUEST",
        link: "/listings",
      },
    });

    // Create or get conversation
    let conversation = await prisma.conversation.findFirst({
      where: {
        itemId,
        borrowerId: session.userId,
        ownerId: item.ownerId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          itemId,
          borrowerId: session.userId,
          ownerId: item.ownerId,
        },
      });
    }

    if (message && message.trim()) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: session.userId,
          text: message.trim(),
        },
      });
    }

    return NextResponse.json({ success: true, borrowRequest });
  } catch (error) {
    console.error("POST borrow request error:", error);
    return NextResponse.json({ error: "Failed to create borrow request" }, { status: 500 });
  }
}
