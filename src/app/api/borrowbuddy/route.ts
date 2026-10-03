import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const query = message.trim().toLowerCase();

    // Map intent to keywords
    const keywordMap: Record<string, string[]> = {
      iot: ["arduino", "raspberry", "sensor", "breadboard", "soldering", "dso"],
      robotics: ["arduino", "raspberry", "drill", "tools", "soldering", "oscilloscope"],
      exam: ["textbook", "book", "calculator", "notes", "dbms", "operating"],
      study: ["textbook", "book", "calculator", "notes", "dbms", "operating"],
      placement: ["blazer", "suit", "formal"],
      interview: ["blazer", "suit", "formal"],
      fest: ["camera", "dslr", "projector", "guitar", "racket", "tent"],
      travel: ["tent", "camera", "power bank", "backpack"],
      sports: ["badminton", "racket", "tent"],
      tools: ["drill", "tool", "soldering", "drafter"],
    };

    let searchTerms: string[] = [query];

    for (const [key, words] of Object.entries(keywordMap)) {
      if (query.includes(key)) {
        searchTerms = [...searchTerms, ...words];
      }
    }

    // Search items in DB matching any of the search terms
    const matchedItems = await prisma.item.findMany({
      where: {
        isAvailable: true,
        isApproved: true,
        OR: searchTerms.map((term) => ({
          OR: [
            { title: { contains: term } },
            { description: { contains: term } },
            { category: { name: { contains: term } } },
          ],
        })),
      },
      take: 4,
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

    let assistantResponse = "";
    if (matchedItems.length > 0) {
      assistantResponse = `Great news! I found ${matchedItems.length} available item(s) on campus matching your request. Here are the top recommendations:`;
    } else {
      assistantResponse = `I couldn't find exact matches right now, but you can post a borrow request on campus or check our popular categories like Electronics, Books, or Project Equipment!`;
    }

    return NextResponse.json({
      reply: assistantResponse,
      items: matchedItems,
    });
  } catch (error) {
    console.error("BorrowBuddy API error:", error);
    return NextResponse.json({ error: "BorrowBuddy encountered an error" }, { status: 500 });
  }
}
