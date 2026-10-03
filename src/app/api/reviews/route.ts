import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { borrowRequestId, rating, comment } = await req.json();

    if (!borrowRequestId || !rating) {
      return NextResponse.json({ error: "Borrow request ID and rating (1-5) are required" }, { status: 400 });
    }

    const ratingVal = parseInt(rating);
    if (ratingVal < 1 || ratingVal > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5 stars" }, { status: 400 });
    }

    const borrowReq = await prisma.borrowRequest.findUnique({
      where: { id: borrowRequestId },
      include: { item: true },
    });

    if (!borrowReq) {
      return NextResponse.json({ error: "Borrow request not found" }, { status: 404 });
    }

    const isBorrower = borrowReq.borrowerId === session.userId;
    const isOwner = borrowReq.ownerId === session.userId;

    if (!isBorrower && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const revieweeId = isBorrower ? borrowReq.ownerId : borrowReq.borrowerId;

    const review = await prisma.review.create({
      data: {
        borrowRequestId,
        reviewerId: session.userId,
        revieweeId,
        itemId: borrowReq.itemId,
        rating: ratingVal,
        comment: comment ? comment.trim() : null,
      },
    });

    // Recalculate rating for reviewee
    const allUserReviews = await prisma.review.findMany({
      where: { revieweeId },
      select: { rating: true },
    });

    const totalUserRating = allUserReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgUserRating = Number((totalUserRating / allUserReviews.length).toFixed(2));

    await prisma.user.update({
      where: { id: revieweeId },
      data: {
        rating: avgUserRating,
        ratingCount: allUserReviews.length,
      },
    });

    // Recalculate rating for item if borrower reviewed
    if (isBorrower) {
      const allItemReviews = await prisma.review.findMany({
        where: { itemId: borrowReq.itemId },
        select: { rating: true },
      });

      const totalItemRating = allItemReviews.reduce((sum, r) => sum + r.rating, 0);
      const avgItemRating = Number((totalItemRating / allItemReviews.length).toFixed(2));

      await prisma.item.update({
        where: { id: borrowReq.itemId },
        data: {
          rating: avgItemRating,
          ratingCount: allItemReviews.length,
        },
      });
    }

    // Notify reviewee
    await prisma.notification.create({
      data: {
        userId: revieweeId,
        title: "New Review Received ⭐",
        message: `${session.name} left a ${ratingVal}-star review: "${comment ? comment.trim() : 'Great experience!'}"`,
        type: "REVIEW_RECEIVED",
        link: "/profile",
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("POST review error:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
