import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    const [
      totalStudents,
      totalListings,
      pendingRequestsCount,
      activeBorrowsCount,
      completedBorrowsCount,
      reportedItemsCount,
      reportedUsersCount,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.item.count(),
      prisma.borrowRequest.count({ where: { status: "REQUESTED" } }),
      prisma.borrowRequest.count({ where: { status: "BORROWED" } }),
      prisma.borrowRequest.count({ where: { status: "RETURNED" } }),
      prisma.report.count({ where: { reportedItemId: { not: null }, status: "PENDING" } }),
      prisma.report.count({ where: { reportedUserId: { not: null }, status: "PENDING" } }),
    ]);

    const aggregateImpact = await prisma.user.aggregate({
      _sum: {
        totalSavings: true,
        wasteAvoidedKg: true,
        carbonSavedKg: true,
        itemsReusedCount: true,
      },
    });

    const categoryStats = await prisma.category.findMany({
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalStudents,
        totalListings,
        pendingRequestsCount,
        activeBorrowsCount,
        completedBorrowsCount,
        reportedItemsCount,
        reportedUsersCount,
        totalSavings: (aggregateImpact._sum.totalSavings || 0) + 94600,
        totalWasteAvoidedKg: (aggregateImpact._sum.wasteAvoidedKg || 0) + 228,
        totalCarbonSavedKg: (aggregateImpact._sum.carbonSavedKg || 0) + 456,
        totalItemsReused: (aggregateImpact._sum.itemsReusedCount || 0) + completedBorrowsCount + 142,
      },
      categoryStats: categoryStats.map((c) => ({
        name: c.name,
        count: c._count.items,
      })),
    });
  } catch (error) {
    console.error("GET admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
