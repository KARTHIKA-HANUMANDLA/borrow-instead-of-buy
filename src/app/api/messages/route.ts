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
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      // Fetch messages for single conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          item: { select: { id: true, title: true, image: true, pricePerDay: true } },
          borrower: { select: { id: true, name: true, avatar: true, department: true } },
          owner: { select: { id: true, name: true, avatar: true, department: true } },
        },
      });

      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
      }

      if (conversation.borrowerId !== session.userId && conversation.ownerId !== session.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      // Mark unread messages as read
      await prisma.message.updateMany({
        where: {
          conversationId,
          senderId: { not: session.userId },
          isRead: false,
        },
        data: { isRead: true },
      });

      const messages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, avatar: true } },
        },
      });

      return NextResponse.json({ conversation, messages });
    }

    // Fetch all conversations for user
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ borrowerId: session.userId }, { ownerId: session.userId }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        item: { select: { id: true, title: true, image: true, pricePerDay: true } },
        borrower: { select: { id: true, name: true, avatar: true, department: true } },
        owner: { select: { id: true, name: true, avatar: true, department: true } },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("GET messages error:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, recipientId, itemId, text } = await req.json();

    if (!text || !text.trim()) {
      return NextResponse.json({ error: "Message text is required" }, { status: 400 });
    }

    let targetConvId = conversationId;

    if (!targetConvId) {
      if (!recipientId) {
        return NextResponse.json({ error: "Recipient is required to start conversation" }, { status: 400 });
      }

      // Find or create conversation
      let conv = await prisma.conversation.findFirst({
        where: {
          OR: [
            { borrowerId: session.userId, ownerId: recipientId },
            { borrowerId: recipientId, ownerId: session.userId },
          ],
          itemId: itemId || undefined,
        },
      });

      if (!conv) {
        conv = await prisma.conversation.create({
          data: {
            borrowerId: session.userId,
            ownerId: recipientId,
            itemId: itemId || null,
          },
        });
      }
      targetConvId = conv.id;
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: targetConvId },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const recipientUserId = conversation.borrowerId === session.userId ? conversation.ownerId : conversation.borrowerId;

    const message = await prisma.message.create({
      data: {
        conversationId: targetConvId,
        senderId: session.userId,
        text: text.trim(),
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Touch conversation updatedAt
    await prisma.conversation.update({
      where: { id: targetConvId },
      data: { updatedAt: new Date() },
    });

    // Send Notification to recipient
    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        title: `New Message from ${session.name} 💬`,
        message: text.trim().substring(0, 80) + (text.length > 80 ? "..." : ""),
        type: "NEW_MESSAGE",
        link: `/messages?conversationId=${targetConvId}`,
      },
    });

    return NextResponse.json({ success: true, message });
  } catch (error) {
    console.error("POST message error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
