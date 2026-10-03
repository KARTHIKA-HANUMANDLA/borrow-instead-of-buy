import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reports = await prisma.report.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        reporter: { select: { id: true, name: true, email: true } },
        reportedUser: { select: { id: true, name: true, email: true } },
        reportedItem: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error("GET reports error:", error);
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportedUserId, reportedItemId, reason, description } = await req.json();

    if (!reason || !description) {
      return NextResponse.json({ error: "Reason and description are required" }, { status: 400 });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: session.userId,
        reportedUserId: reportedUserId || null,
        reportedItemId: reportedItemId || null,
        reason: reason.trim(),
        description: description.trim(),
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, report });
  } catch (error) {
    console.error("POST report error:", error);
    return NextResponse.json({ error: "Failed to file report" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (session?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { reportId, status } = await req.json();

    if (!reportId || !status) {
      return NextResponse.json({ error: "Report ID and status are required" }, { status: 400 });
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: { status },
    });

    return NextResponse.json({ success: true, report: updated });
  } catch (error) {
    console.error("PUT report status error:", error);
    return NextResponse.json({ error: "Failed to update report status" }, { status: 500 });
  }
}
