import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const condition = searchParams.get("condition") || "";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const isFree = searchParams.get("free") === "true";
    const minRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
    const sort = searchParams.get("sort") || "recent";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const session = await getSession();

    const where: any = {
      isApproved: true,
      isAvailable: true,
    };

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { pickupLocation: { contains: q } },
        { category: { name: { contains: q } } },
      ];
    }

    if (category && category !== "all") {
      where.category = {
        slug: category,
      };
    }

    if (condition && condition !== "all") {
      where.condition = condition;
    }

    if (isFree) {
      where.pricePerDay = 0;
    } else {
      if (minPrice !== undefined || maxPrice !== undefined) {
        where.pricePerDay = {};
        if (minPrice !== undefined) where.pricePerDay.gte = minPrice;
        if (maxPrice !== undefined) where.pricePerDay.lte = maxPrice;
      }
    }

    if (minRating !== undefined) {
      where.rating = { gte: minRating };
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-low") orderBy = { pricePerDay: "asc" };
    if (sort === "price-high") orderBy = { pricePerDay: "desc" };
    if (sort === "rating") orderBy = { rating: "desc" };
    if (sort === "most-borrowed") orderBy = { borrowsCount: "desc" };
    if (sort === "recent") orderBy = { createdAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          category: true,
          owner: {
            select: {
              id: true,
              name: true,
              avatar: true,
              department: true,
              year: true,
              rating: true,
              isVerified: true,
            },
          },
          favorites: session?.userId ? { where: { userId: session.userId } } : false,
        },
      }),
      prisma.item.count({ where }),
    ]);

    // Format items to include isFavorited boolean flag
    const formattedItems = items.map((item) => ({
      ...item,
      isFavorited: session?.userId ? item.favorites && item.favorites.length > 0 : false,
      favorites: undefined,
    }));

    return NextResponse.json({
      items: formattedItems,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET items error:", error);
    return NextResponse.json({ error: "Failed to fetch items" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      categoryId,
      condition,
      pricePerDay,
      securityDeposit,
      pickupLocation,
      pickupInstructions,
      rules,
      maxDurationDays,
      image,
      extraImages,
    } = body;

    if (!title || !description || !categoryId || !pickupLocation) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const defaultImagesMap: Record<string, string> = {
      books: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
      electronics: "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?w=800",
      "project-equipment": "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800",
      fashion: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
      "college-essentials": "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800",
      sports: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
      travel: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
      tools: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
    };

    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    const fallbackImg = category ? defaultImagesMap[category.slug] || defaultImagesMap["electronics"] : "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800";

    const item = await prisma.item.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        categoryId,
        condition: condition || "GOOD",
        pricePerDay: parseFloat(pricePerDay || "0"),
        securityDeposit: parseFloat(securityDeposit || "0"),
        pickupLocation: pickupLocation.trim(),
        pickupInstructions: pickupInstructions ? pickupInstructions.trim() : null,
        rules: rules ? rules.trim() : null,
        maxDurationDays: parseInt(maxDurationDays || "7"),
        isAvailable: true,
        isApproved: true,
        ownerId: session.userId,
        image: image && image.trim().length > 5 ? image.trim() : fallbackImg,
        extraImages: Array.isArray(extraImages) ? JSON.stringify(extraImages) : extraImages || null,
      },
    });

    // Award 20 Community Credits for listing an item!
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        communityCredits: { increment: 20 },
      },
    });

    // Check achievement for FIRST_LEND
    const existingLends = await prisma.item.count({ where: { ownerId: session.userId } });
    if (existingLends === 1) {
      const firstLendAch = await prisma.achievement.findUnique({ where: { code: "FIRST_LEND" } });
      if (firstLendAch) {
        await prisma.userAchievement.upsert({
          where: {
            userId_achievementId: {
              userId: session.userId,
              achievementId: firstLendAch.id,
            },
          },
          update: {},
          create: {
            userId: session.userId,
            achievementId: firstLendAch.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("POST item error:", error);
    return NextResponse.json({ error: "Failed to create listing" }, { status: 500 });
  }
}
