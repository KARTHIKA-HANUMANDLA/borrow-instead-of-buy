import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, setSessionCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, username, email, studentId, department, year, phone, password, confirmPassword } = body;

    if (!name || !username || !email || !studentId || !department || !year || !password) {
      return NextResponse.json({ error: "All required fields must be provided" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "_");
    const cleanEmail = email.trim().toLowerCase();

    // Check existing username, email, or student ID
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanUsername },
          { email: cleanEmail },
          { studentId: studentId.trim() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === cleanUsername) {
        return NextResponse.json({ error: "Username is already taken. Please choose another." }, { status: 400 });
      }
      return NextResponse.json({ error: "User with this email or Student ID already registered" }, { status: 400 });
    }

    const isCollegeEmail = cleanEmail.includes("@college.edu") || cleanEmail.includes(".edu") || cleanEmail.includes(".ac.in");

    const passwordHash = await hashPassword(password);
    const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        username: cleanUsername,
        email: cleanEmail,
        passwordHash,
        studentId: studentId.trim(),
        department: department.trim(),
        year: year.trim(),
        phone: phone ? phone.trim() : null,
        avatar: defaultAvatar,
        isVerified: isCollegeEmail,
        role: "STUDENT",
        communityCredits: 50,
      },
    });

    // Create welcoming notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        title: "Welcome to Borrow Instead of Buy! 🎉",
        message: "You've earned 50 Community Credits! Start browsing or listing items on campus.",
        type: "SYSTEM",
        link: "/browse",
      },
    });

    const sessionPayload = {
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      name: newUser.name,
      role: newUser.role,
      studentId: newUser.studentId,
      avatar: newUser.avatar || undefined,
    };

    await setSessionCookie(sessionPayload);

    return NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        studentId: newUser.studentId,
        department: newUser.department,
        isVerified: newUser.isVerified,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
