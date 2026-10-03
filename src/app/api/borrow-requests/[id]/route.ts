import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { action } = await req.json();

    const request = await prisma.borrowRequest.findUnique({
      where: { id },
      include: {
        item: true,
        borrower: { select: { name: true } },
        owner: { select: { name: true } },
      },
    });

    if (!request) {
      return NextResponse.json({ error: "Borrow request not found" }, { status: 404 });
    }

    const isOwner = request.ownerId === session.userId;
    const isBorrower = request.borrowerId === session.userId;
    const isAdmin = session.role === "ADMIN";

    if (!isOwner && !isBorrower && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let newStatus = request.status;

    if (action === "APPROVE" || action === "ACCEPT") {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Only item owner can accept borrow requests" }, { status: 403 });
      }
      newStatus = "APPROVED";

      // Create transaction if not existing
      await prisma.borrowTransaction.upsert({
        where: { borrowRequestId: id },
        update: { status: "APPROVED" },
        create: {
          borrowRequestId: id,
          totalAmount: request.estimatedCost,
          securityDeposit: request.securityDeposit,
          status: "APPROVED",
        },
      });

      // Notify Borrower
      await prisma.notification.create({
        data: {
          userId: request.borrowerId,
          title: "Borrow Request Approved! ✅",
          message: `${request.owner.name} approved your request to borrow '${request.item.title}'. Contact them for pickup instructions!`,
          type: "REQUEST_APPROVED",
          link: "/borrows",
        },
      });
    } else if (action === "REJECT") {
      if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Only item owner can reject borrow requests" }, { status: 403 });
      }
      newStatus = "REJECTED";

      await prisma.notification.create({
        data: {
          userId: request.borrowerId,
          title: "Borrow Request Declined ❌",
          message: `Your borrow request for '${request.item.title}' was declined by the owner.`,
          type: "REQUEST_REJECTED",
          link: "/browse",
        },
      });
    } else if (action === "MARK_BORROWED") {
      if (!isOwner && !isBorrower && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      newStatus = "BORROWED";

      await prisma.borrowTransaction.upsert({
        where: { borrowRequestId: id },
        update: {
          borrowedAt: new Date(),
          dueDate: request.endDate,
          status: "ACTIVE",
        },
        create: {
          borrowRequestId: id,
          borrowedAt: new Date(),
          dueDate: request.endDate,
          totalAmount: request.estimatedCost,
          securityDeposit: request.securityDeposit,
          status: "ACTIVE",
        },
      });

      // Increment item borrowsCount
      await prisma.item.update({
        where: { id: request.itemId },
        data: { borrowsCount: { increment: 1 } },
      });

      await prisma.notification.create({
        data: {
          userId: isOwner ? request.borrowerId : request.ownerId,
          title: "Item Picked Up & Borrow Active 📦",
          message: `'${request.item.title}' has been marked as borrowed until ${new Date(request.endDate).toLocaleDateString()}.`,
          type: "ITEM_BORROWED",
          link: "/borrows",
        },
      });
    } else if (action === "CANCEL") {
      if (!isBorrower && !isOwner && !isAdmin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      newStatus = "CANCELLED";
    }

    const updated = await prisma.borrowRequest.update({
      where: { id },
      data: { status: newStatus },
      include: {
        item: true,
        transaction: true,
      },
    });

    return NextResponse.json({ success: true, request: updated });
  } catch (error) {
    console.error("PUT borrow request error:", error);
    return NextResponse.json({ error: "Failed to update request status" }, { status: 500 });
  }
}
