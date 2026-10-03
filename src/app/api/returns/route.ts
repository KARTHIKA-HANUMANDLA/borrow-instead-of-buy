import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { borrowRequestId, action, borrowerNotes, ownerNotes, beforeImages, afterImages, conditionStatus } = await req.json();

    if (!borrowRequestId || !action) {
      return NextResponse.json({ error: "Missing borrowRequestId or action" }, { status: 400 });
    }

    const borrowReq = await prisma.borrowRequest.findUnique({
      where: { id: borrowRequestId },
      include: {
        item: { include: { category: true } },
        borrower: true,
        owner: true,
      },
    });

    if (!borrowReq) {
      return NextResponse.json({ error: "Borrow request not found" }, { status: 404 });
    }

    if (action === "REQUEST_RETURN") {
      if (borrowReq.borrowerId !== session.userId && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the borrower can request return" }, { status: 403 });
      }

      const returnRec = await prisma.returnRecord.upsert({
        where: { borrowRequestId },
        update: {
          borrowerNotes: borrowerNotes ? borrowerNotes.trim() : null,
          beforeImages: beforeImages ? JSON.stringify(beforeImages) : null,
          afterImages: afterImages ? JSON.stringify(afterImages) : null,
          requestedAt: new Date(),
        },
        create: {
          borrowRequestId,
          borrowerNotes: borrowerNotes ? borrowerNotes.trim() : null,
          beforeImages: beforeImages ? JSON.stringify(beforeImages) : null,
          afterImages: afterImages ? JSON.stringify(afterImages) : null,
          requestedAt: new Date(),
        },
      });

      await prisma.borrowRequest.update({
        where: { id: borrowRequestId },
        data: { status: "RETURN_REQUESTED" },
      });

      await prisma.notification.create({
        data: {
          userId: borrowReq.ownerId,
          title: "Return Confirmation Requested 🔄",
          message: `${borrowReq.borrower.name} requested to mark '${borrowReq.item.title}' as returned. Please inspect and confirm.`,
          type: "RETURN_REQUESTED",
          link: "/listings",
        },
      });

      return NextResponse.json({ success: true, returnRecord: returnRec });
    }

    if (action === "CONFIRM_RETURN") {
      if (borrowReq.ownerId !== session.userId && session.role !== "ADMIN") {
        return NextResponse.json({ error: "Only the item owner can confirm return" }, { status: 403 });
      }

      await prisma.returnRecord.upsert({
        where: { borrowRequestId },
        update: {
          ownerNotes: ownerNotes ? ownerNotes.trim() : null,
          conditionStatus: conditionStatus || "GOOD",
          confirmedAt: new Date(),
        },
        create: {
          borrowRequestId,
          ownerNotes: ownerNotes ? ownerNotes.trim() : null,
          conditionStatus: conditionStatus || "GOOD",
          confirmedAt: new Date(),
        },
      });

      await prisma.borrowRequest.update({
        where: { id: borrowRequestId },
        data: { status: "RETURNED" },
      });

      await prisma.borrowTransaction.updateMany({
        where: { borrowRequestId },
        data: {
          status: "COMPLETED",
          returnedAt: new Date(),
        },
      });

      // Calculate estimated money saved and carbon/waste impact
      // Benchmark purchase estimate ~ 15x pricePerDay or standard estimate
      const estimatedPurchasePrice = Math.max(borrowReq.item.pricePerDay * 20, 1000);
      const moneySaved = Math.max(estimatedPurchasePrice - borrowReq.estimatedCost, 300);
      const wasteAvoided = 1.2; // kg estimate
      const carbonSaved = 2.4; // kg CO2e estimate

      // Update Borrower Impact Stats
      await prisma.user.update({
        where: { id: borrowReq.borrowerId },
        data: {
          totalSavings: { increment: moneySaved },
          wasteAvoidedKg: { increment: wasteAvoided },
          carbonSavedKg: { increment: carbonSaved },
          itemsReusedCount: { increment: 1 },
          communityCredits: { increment: 25 },
        },
      });

      // Update Owner Credits & Stats
      await prisma.user.update({
        where: { id: borrowReq.ownerId },
        data: {
          itemsReusedCount: { increment: 1 },
          communityCredits: { increment: 35 },
        },
      });

      // Record Impact
      await prisma.impactRecord.create({
        data: {
          userId: borrowReq.borrowerId,
          borrowRequestId,
          moneySaved,
          wasteAvoidedKg: wasteAvoided,
          carbonSavedKg: carbonSaved,
        },
      });

      // Notify Borrower
      await prisma.notification.create({
        data: {
          userId: borrowReq.borrowerId,
          title: "Return Confirmed & Impact Logged! 🌟",
          message: `${borrowReq.owner.name} confirmed return of '${borrowReq.item.title}'. You saved ₹${moneySaved}! Please leave a rating & review.`,
          type: "ITEM_RETURNED",
          link: "/borrows",
        },
      });

      return NextResponse.json({ success: true, moneySaved, wasteAvoided, carbonSaved });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("POST return error:", error);
    return NextResponse.json({ error: "Failed to process return" }, { status: 500 });
  }
}
