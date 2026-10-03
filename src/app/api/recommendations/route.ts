import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    let favoriteCategoryIds: string[] = [];
    if (session?.userId) {
      const favorites = await prisma.favorite.findMany({
        where: { userId: session.userId },
        include: { item: true },
      });
      favoriteCategoryIds = favorites.map((f) => f.item.categoryId);
    }

    // Fetch top items either matching favorite categories or top rated
    const where: any = {
      isApproved: true,
      isAvailable: true,
    };

    if (favoriteCategoryIds.length > 0) {
      where.categoryId = { in: favoriteCategoryIds };
    }

    let recommendedItems = await prisma.item.findMany({
      where,
      orderBy: { rating: "desc" },
      take: 6,
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
    });

    if (recommendedItems.length < 4) {
      // Fallback to general top rated
      recommendedItems = await prisma.item.findMany({
        where: { isApproved: true, isAvailable: true },
        orderBy: { rating: "desc" },
        take: 6,
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
      });
    }

    return NextResponse.json({ recommendations: recommendedItems });
  } catch (error) {
    console.error("GET recommendations error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}
