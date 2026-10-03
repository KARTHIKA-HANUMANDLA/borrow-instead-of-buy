import { PrismaClient } from "../generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding Borrow Instead of Buy database with usernames...");

  // Clean existing data in order
  await prisma.userAchievement.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.adminAction.deleteMany();
  await prisma.impactRecord.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.searchHistory.deleteMany();
  await prisma.report.deleteMany();
  await prisma.dispute.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.returnRecord.deleteMany();
  await prisma.borrowTransaction.deleteMany();
  await prisma.borrowRequest.deleteMany();
  await prisma.itemAvailability.deleteMany();
  await prisma.item.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("student123", 10);
  const adminPasswordHash = await bcrypt.hash("admin123", 10);

  // 1. Create Users
  const admin = await prisma.user.create({
    data: {
      email: "admin@college.edu",
      username: "prof_vikram",
      passwordHash: adminPasswordHash,
      name: "Prof. Vikram Malhotra",
      studentId: "ADM-2026-01",
      department: "Computer Science & Engineering",
      year: "Faculty Advisor",
      phone: "+91 98765 43210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      bio: "Faculty Admin for Campus Sustainability & Student Resource Sharing Initiative.",
      isVerified: true,
      role: "ADMIN",
      rating: 5.0,
      ratingCount: 12,
      totalSavings: 15400,
      wasteAvoidedKg: 42.5,
      carbonSavedKg: 85.0,
      itemsReusedCount: 28,
      communityCredits: 450,
    },
  });

  const studentDemo = await prisma.user.create({
    data: {
      email: "student@college.edu",
      username: "aarav_sharma",
      passwordHash: passwordHash,
      name: "Aarav Sharma",
      studentId: "21BCE0482",
      department: "Computer Science & Engineering",
      year: "3rd Year",
      phone: "+91 98123 45678",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400",
      bio: "Tech enthusiast, IoT maker & CSE 3rd year student. Love sharing lab equipment!",
      isVerified: true,
      role: "STUDENT",
      rating: 4.9,
      ratingCount: 18,
      totalSavings: 8400,
      wasteAvoidedKg: 18.2,
      carbonSavedKg: 36.4,
      itemsReusedCount: 14,
      communityCredits: 210,
    },
  });

  const usersData = [
    {
      email: "ananya.p@college.edu",
      username: "ananya_p",
      name: "Ananya Patel",
      studentId: "21ECE0114",
      department: "Electronics & Communication",
      year: "3rd Year",
      phone: "+91 98234 56789",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
      bio: "ECE student passionate about robotics, embedded systems, and sustainable living.",
      isVerified: true,
      rating: 4.85,
      ratingCount: 15,
      totalSavings: 6200,
      wasteAvoidedKg: 14.0,
      carbonSavedKg: 28.0,
      itemsReusedCount: 11,
      communityCredits: 180,
    },
    {
      email: "rohan.v@college.edu",
      username: "rohan_v",
      name: "Rohan Verma",
      studentId: "22BME0091",
      department: "Mechanical Engineering",
      year: "2nd Year",
      phone: "+91 98345 67890",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      bio: "Mechanical engineering student. Hardware tinkerer, automotive club lead.",
      isVerified: true,
      rating: 4.95,
      ratingCount: 22,
      totalSavings: 11200,
      wasteAvoidedKg: 26.5,
      carbonSavedKg: 53.0,
      itemsReusedCount: 19,
      communityCredits: 310,
    },
    {
      email: "priya.nair@college.edu",
      username: "priya_nair",
      name: "Priya Nair",
      studentId: "20BIT0055",
      department: "Information Technology",
      year: "4th Year",
      phone: "+91 98456 78901",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400",
      bio: "Final year IT student. Preparing for campus placements & organizing tech fests.",
      isVerified: true,
      rating: 5.0,
      ratingCount: 14,
      totalSavings: 9500,
      wasteAvoidedKg: 21.0,
      carbonSavedKg: 42.0,
      itemsReusedCount: 16,
      communityCredits: 260,
    },
    {
      email: "kabir.singh@college.edu",
      username: "kabir_singh",
      name: "Kabir Singh",
      studentId: "22BEE0033",
      department: "Electrical Engineering",
      year: "2nd Year",
      phone: "+91 98567 89012",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
      bio: "Sports fanatic & EE major. Guitar player, trekker, and tech enthusiast.",
      isVerified: true,
      rating: 4.7,
      ratingCount: 9,
      totalSavings: 4100,
      wasteAvoidedKg: 9.5,
      carbonSavedKg: 19.0,
      itemsReusedCount: 7,
      communityCredits: 120,
    },
    {
      email: "sneha.reddy@college.edu",
      username: "sneha_reddy",
      name: "Sneha Reddy",
      studentId: "21BCE0899",
      department: "Computer Science & Engineering",
      year: "3rd Year",
      phone: "+91 98678 90123",
      avatar: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400",
      bio: "Design enthusiast & full-stack developer. Active in IEEE student branch.",
      isVerified: true,
      rating: 4.9,
      ratingCount: 16,
      totalSavings: 7800,
      wasteAvoidedKg: 16.0,
      carbonSavedKg: 32.0,
      itemsReusedCount: 13,
      communityCredits: 220,
    },
    {
      email: "devansh.g@college.edu",
      username: "devansh_g",
      name: "Devansh Gupta",
      studentId: "23BCV0012",
      department: "Civil Engineering",
      year: "1st Year",
      phone: "+91 98789 01234",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
      bio: "Freshman Civil Engineering student. Love photography and sports.",
      isVerified: true,
      rating: 4.8,
      ratingCount: 6,
      totalSavings: 2900,
      wasteAvoidedKg: 6.2,
      carbonSavedKg: 12.4,
      itemsReusedCount: 5,
      communityCredits: 90,
    },
    {
      email: "riya.sen@college.edu",
      username: "riya_sen",
      name: "Riya Sen",
      studentId: "21BME0411",
      department: "Biomedical Engineering",
      year: "3rd Year",
      phone: "+91 98890 12345",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
      bio: "Biomedical researcher & cultural coordinator. Eco-friendly campus advocate.",
      isVerified: true,
      rating: 5.0,
      ratingCount: 11,
      totalSavings: 5300,
      wasteAvoidedKg: 11.8,
      carbonSavedKg: 23.6,
      itemsReusedCount: 9,
      communityCredits: 160,
    },
    {
      email: "aditya.k@college.edu",
      username: "aditya_k",
      name: "Aditya Kumar",
      studentId: "20BCE0102",
      department: "Computer Science & Engineering",
      year: "4th Year",
      phone: "+91 98901 23456",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400",
      bio: "Final year student. Selling/lending my reference books & graduation clothes.",
      isVerified: true,
      rating: 4.9,
      ratingCount: 25,
      totalSavings: 14200,
      wasteAvoidedKg: 31.0,
      carbonSavedKg: 62.0,
      itemsReusedCount: 23,
      communityCredits: 390,
    },
  ];

  const createdStudents = [];
  for (const u of usersData) {
    const user = await prisma.user.create({
      data: {
        ...u,
        passwordHash,
        role: "STUDENT",
      },
    });
    createdStudents.push(user);
  }

  const allStudents = [studentDemo, ...createdStudents];

  // 2. Categories
  const categoriesData = [
    {
      name: "Books & Study Material",
      slug: "books",
      icon: "BookOpen",
      description: "Textbooks, GATE guides, reference manuals, and lecture notes for all semesters.",
    },
    {
      name: "Electronics & Gadgets",
      slug: "electronics",
      icon: "Laptop",
      description: "Laptops, monitors, power banks, adapters, scientific calculators, and cables.",
    },
    {
      name: "Project Equipment",
      slug: "project-equipment",
      icon: "Cpu",
      description: "Arduino kits, Raspberry Pi, oscilloscopes, sensors, breadboards, and soldering tools.",
    },
    {
      name: "Fashion & Apparel",
      slug: "fashion",
      icon: "Shirt",
      description: "Formal blazers, suits, lab coats, traditional wear for fests and interviews.",
    },
    {
      name: "College Essentials",
      slug: "college-essentials",
      icon: "Backpack",
      description: "Backpacks, desk lamps, drafters, drawing boards, mini-fridges, and kettles.",
    },
    {
      name: "Sports & Fitness",
      slug: "sports",
      icon: "Trophy",
      description: "Badminton rackets, footballs, cricket gear, gym accessories, and board games.",
    },
    {
      name: "Travel & Events",
      slug: "travel",
      icon: "Compass",
      description: "Tents, sleeping bags, luggage bags, DSLR cameras, tripods, and portable speakers.",
    },
    {
      name: "Tools & Hardware",
      slug: "tools",
      icon: "Wrench",
      description: "Screwdriver sets, measuring tapes, drills, glue guns, and mechanical toolkits.",
    },
    {
      name: "Lab & Measurement",
      slug: "lab-equipment",
      icon: "Microscope",
      description: "Multimeters, function generators,Vernier callipers, lab glassware, and goggles.",
    },
    {
      name: "Music & Audio",
      slug: "music-audio",
      icon: "Music",
      description: "Acoustic guitars, keyboards, Bluetooth speakers, micro mics, and headphones.",
    },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = createdCat.id;
  }

  // 3. Items Seed Data
  const itemsData = [
    {
      title: "DBMS Reference Book - Korth (7th Edition)",
      description: "Database System Concepts by Silberschatz, Korth and Sudarshan. Excellent condition, includes highlighted notes for CSE 3rd sem exams.",
      categorySlug: "books",
      condition: "LIKE_NEW",
      pricePerDay: 20,
      securityDeposit: 300,
      pickupLocation: "Hostel Block C, Room 204",
      pickupInstructions: "Available weekdays after 5 PM near the hostel library entrance.",
      rules: "Do not mark with pen on pages. Handle with care.",
      maxDurationDays: 14,
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800",
      rating: 4.9,
      ownerIndex: 1, // Ananya
    },
    {
      title: "Casio fx-991EX ClassWiz Scientific Calculator",
      description: "Original Casio solar calculator with 552 functions. Essential for Engineering Mathematics, EE, ECE and ME semester exams.",
      categorySlug: "electronics",
      condition: "LIKE_NEW",
      pricePerDay: 30,
      securityDeposit: 500,
      pickupLocation: "Library Main Entrance",
      pickupInstructions: "Can meet during lunch hours (1 PM to 2 PM) outside central library.",
      rules: "Keep in protective case when not in use.",
      maxDurationDays: 7,
      image: "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?w=800",
      rating: 5.0,
      ownerIndex: 0, // Aarav (studentDemo)
    },
    {
      title: "Arduino Uno R3 Ultimate Starter Kit",
      description: "Complete IoT kit with Arduino board, breadboard, 30+ sensors (DHT11, Ultrasonic, PIR, Servo), LEDs, jumper wires, and OLED display.",
      categorySlug: "project-equipment",
      condition: "GOOD",
      pricePerDay: 50,
      securityDeposit: 800,
      pickupLocation: "ECE Lab Ground Floor",
      pickupInstructions: "Meet outside Embedded Systems Lab between 4 PM and 6 PM.",
      rules: "Verify all sensor modules before returning. Handle IC pins gently.",
      maxDurationDays: 10,
      image: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800",
      rating: 4.95,
      ownerIndex: 0, // Aarav (studentDemo)
    },
    {
      title: "Raspberry Pi 4 Model B (4GB RAM) + Acrylic Case",
      description: "Includes 32GB SanDisk MicroSD preloaded with Raspberry Pi OS, official micro HDMI to HDMI cable, and 5V 3A USB-C power adapter.",
      categorySlug: "project-equipment",
      condition: "LIKE_NEW",
      pricePerDay: 80,
      securityDeposit: 1500,
      pickupLocation: "CSE Block 3rd Floor Lab",
      pickupInstructions: "Contact via chat before coming.",
      rules: "Do not overclock processor. Return with formatted SD card.",
      maxDurationDays: 10,
      image: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=800",
      rating: 4.85,
      ownerIndex: 2, // Rohan
    },
    {
      title: "Digital Storage Oscilloscope (DSO 50MHz Portable)",
      description: "2-channel portable DSO oscilloscope with probes and BNC cables. Great for ECE/EE hardware projects and waveform testing.",
      categorySlug: "lab-equipment",
      condition: "GOOD",
      pricePerDay: 120,
      securityDeposit: 2500,
      pickupLocation: "Electrical Dept Workshop",
      pickupInstructions: "Collect from Workshop 2 during working hours.",
      rules: "Inspect probes upon pickup. Do not exceed max voltage rating.",
      maxDurationDays: 5,
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800",
      rating: 4.9,
      ownerIndex: 4, // Kabir
    },
    {
      title: "Canon EOS 1500D DSLR Camera + 18-55mm Lens",
      description: "24.1 MP Wi-Fi DSLR camera with bag, 64GB High-Speed SD card, and 2 batteries. Perfect for campus cultural fests and trips!",
      categorySlug: "travel",
      condition: "LIKE_NEW",
      pricePerDay: 350,
      securityDeposit: 4000,
      pickupLocation: "Student Activity Center (SAC)",
      pickupInstructions: "Collect near SAC Auditorium entrance.",
      rules: "Keep neck strap attached while shooting. No rain exposure.",
      maxDurationDays: 4,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800",
      rating: 5.0,
      ownerIndex: 6, // Devansh
    },
    {
      title: "Men's Raymond Formal Black Blazer (Size 40/M)",
      description: "Slim-fit premium black formal blazer with trousers, ironed and dry-cleaned. Ideal for placement interviews, PPTs, and formal banquets.",
      categorySlug: "fashion",
      condition: "LIKE_NEW",
      pricePerDay: 150,
      securityDeposit: 1000,
      pickupLocation: "Hostel Block A, Room 102",
      pickupInstructions: "Try fit before taking.",
      rules: "Must be dry cleaned or returned in clean condition.",
      maxDurationDays: 3,
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800",
      rating: 4.9,
      ownerIndex: 7, // Aditya
    },
    {
      title: "Women's Formal Navy Blue Suit Set (Size S/M)",
      description: "Professional blazer and formal trousers set. Perfect for paper presentations, mock interviews, and conference events.",
      categorySlug: "fashion",
      condition: "NEW",
      pricePerDay: 160,
      securityDeposit: 1200,
      pickupLocation: "Girls Hostel Block B",
      pickupInstructions: "Can meet at main campus gate or girls hostel visitor lounge.",
      rules: "Return clean in garment cover.",
      maxDurationDays: 3,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800",
      rating: 5.0,
      ownerIndex: 3, // Priya
    },
    {
      title: "Mini LED HD Portable Projector (1080p Supported)",
      description: "Compact HDMI projector with built-in speaker and tripod mount. Great for team project presentations or hostel movie nights!",
      categorySlug: "electronics",
      condition: "GOOD",
      pricePerDay: 180,
      securityDeposit: 2000,
      pickupLocation: "Hostel Common Room",
      pickupInstructions: "Available evenings 6 PM to 9 PM.",
      rules: "Handle HDMI cable carefully. Allow fan to cool down before packing.",
      maxDurationDays: 4,
      image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800",
      rating: 4.8,
      ownerIndex: 5, // Sneha
    },
    {
      title: "Operating System Concepts - Galvin (9th Edition)",
      description: "Standard OS textbook for CSE/IT 4th semester. Clean condition with key chapter bookmarks for quick exam revision.",
      categorySlug: "books",
      condition: "GOOD",
      pricePerDay: 15,
      securityDeposit: 250,
      pickupLocation: "Central Library Desk",
      pickupInstructions: "Available during college hours.",
      rules: "No page tearing or ink marks allowed.",
      maxDurationDays: 14,
      image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=800",
      rating: 4.9,
      ownerIndex: 0, // Aarav (studentDemo)
    },
    {
      title: "Quechua 3-Person Camping Tent + 2 Sleeping Bags",
      description: "Waterproof pop-up camping tent with ground sheet and 2 cozy thermal sleeping bags. Ideal for weekend trekking trips!",
      categorySlug: "travel",
      condition: "LIKE_NEW",
      pricePerDay: 250,
      securityDeposit: 1800,
      pickupLocation: "Sports Complex Gate 1",
      pickupInstructions: "Pickup Friday afternoon or Saturday morning.",
      rules: "Clean dirt off tent poles and pegs before returning dry.",
      maxDurationDays: 5,
      image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800",
      rating: 4.95,
      ownerIndex: 4, // Kabir
    },
    {
      title: "Yonex Muscle Power Badminton Rackets (Pair) + Shuttles",
      description: "Set of 2 Yonex graphite rackets strung at 24 lbs with 1 full tube of Mavis 350 nylon shuttlecocks.",
      categorySlug: "sports",
      condition: "LIKE_NEW",
      pricePerDay: 60,
      securityDeposit: 600,
      pickupLocation: "Indoor Badminton Court",
      pickupInstructions: "Can hand over right at the court before evening practice.",
      rules: "Do not drag racket head on floor.",
      maxDurationDays: 7,
      image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800",
      rating: 4.85,
      ownerIndex: 4, // Kabir
    },
    {
      title: "Yamaha F310 Acoustic Guitar with Padded Gig Bag",
      description: "Rich sounding acoustic guitar with fresh D'Addario strings, digital clip-on tuner, capo, and plectrums.",
      categorySlug: "music-audio",
      condition: "GOOD",
      pricePerDay: 100,
      securityDeposit: 1500,
      pickupLocation: "Music Club Room, SAC",
      pickupInstructions: "Meet during music club timings (5 PM - 7 PM).",
      rules: "Store in padded bag when not playing. Do not expose to direct heat.",
      maxDurationDays: 7,
      image: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=800",
      rating: 4.9,
      ownerIndex: 7, // Aditya
    },
    {
      title: "Bosch Professional Cordless Drill & Screwdriver Kit",
      description: "12V rechargeable cordless driver with 30-piece drill bits, wall plugs, and carrying case. Essential for hostel room setup & tech projects.",
      categorySlug: "tools",
      condition: "LIKE_NEW",
      pricePerDay: 90,
      securityDeposit: 1200,
      pickupLocation: "Mechanical Workshop Block",
      pickupInstructions: "Available anytime after 4 PM.",
      rules: "Charge battery fully before returning. Return all bit pieces.",
      maxDurationDays: 3,
      image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800",
      rating: 5.0,
      ownerIndex: 2, // Rohan
    },
    {
      title: "Imperial A1 Engineering Drawing Board + Mini Drafter",
      description: "Full A1 size wooden drafting board with heavy-duty metal stand and stainless steel mini drafter for Civil & Mechanical 1st/2nd year.",
      categorySlug: "college-essentials",
      condition: "GOOD",
      pricePerDay: 40,
      securityDeposit: 600,
      pickupLocation: "Civil Engineering Department",
      pickupInstructions: "Collect from Drawing Hall 1.",
      rules: "Do not cut paper directly on wooden board surface.",
      maxDurationDays: 14,
      image: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800",
      rating: 4.8,
      ownerIndex: 6, // Devansh
    },
    {
      title: "Temperature Controlled Soldering Station 60W + Accessories",
      description: "Digital temperature adjustment (200°C - 480°C) with solder wire, desoldering pump, flux paste, and safety stand.",
      categorySlug: "project-equipment",
      condition: "LIKE_NEW",
      pricePerDay: 40,
      securityDeposit: 500,
      pickupLocation: "ECE Innovation Lab",
      pickupInstructions: "Handover near lab 104.",
      rules: "Turn off power switch when idle. Wipe tip with wet sponge.",
      maxDurationDays: 5,
      image: "https://images.unsplash.com/photo-1597773150796-e5c14ebecbf5?w=800",
      rating: 4.95,
      ownerIndex: 1, // Ananya
    },
    {
      title: "GATE CSE Exam Solved Papers (2012-2025) + MadeEasy Notes",
      description: "Comprehensive GATE preparation set containing 14 years solved papers + 10 spiral-bound subject formula booklets.",
      categorySlug: "books",
      condition: "GOOD",
      pricePerDay: 25,
      securityDeposit: 400,
      pickupLocation: "Hostel Block C Room 410",
      pickupInstructions: "Call or message 10 mins before arrival.",
      rules: "Handle formula notes with care.",
      maxDurationDays: 30,
      image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800",
      rating: 5.0,
      ownerIndex: 3, // Priya
    },
    {
      title: "Mi 20000mAh Power Bank 3i (18W Fast Charging)",
      description: "Dual USB output with Type-C input. Can charge a laptop or smartphone up to 4 times. Essential for campus hackathons!",
      categorySlug: "electronics",
      condition: "LIKE_NEW",
      pricePerDay: 35,
      securityDeposit: 600,
      pickupLocation: "Computer Lab 2",
      pickupInstructions: "Meet during open lab hours.",
      rules: "Return with at least 80% charge.",
      maxDurationDays: 4,
      image: "https://images.unsplash.com/photo-1609592424109-dd9892f1b177?w=800",
      rating: 4.9,
      ownerIndex: 5, // Sneha
    },
  ];

  const createdItems = [];
  for (const item of itemsData) {
    const owner = allStudents[item.ownerIndex];
    const categoryId = categoryMap[item.categorySlug];
    const createdItem = await prisma.item.create({
      data: {
        title: item.title,
        description: item.description,
        categoryId: categoryId,
        condition: item.condition,
        pricePerDay: item.pricePerDay,
        securityDeposit: item.securityDeposit,
        pickupLocation: item.pickupLocation,
        pickupInstructions: item.pickupInstructions,
        rules: item.rules,
        maxDurationDays: item.maxDurationDays,
        isAvailable: true,
        isApproved: true,
        ownerId: owner.id,
        image: item.image,
        rating: item.rating,
        ratingCount: Math.floor(Math.random() * 10) + 3,
        viewsCount: Math.floor(Math.random() * 80) + 20,
        borrowsCount: Math.floor(Math.random() * 8) + 2,
      },
    });
    createdItems.push(createdItem);
  }

  // 4. Borrow Requests & Transactions & Returns
  const now = new Date();
  
  // Active borrow for Student Demo (borrowed DBMS book from Ananya)
  const startDate1 = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const endDate1 = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
  
  const req1 = await prisma.borrowRequest.create({
    data: {
      itemId: createdItems[0].id,
      borrowerId: studentDemo.id,
      ownerId: createdStudents[0].id, // Ananya
      startDate: startDate1,
      endDate: endDate1,
      totalDays: 7,
      estimatedCost: 140,
      securityDeposit: 300,
      purpose: "Preparing for DBMS Mid-Sem test on Friday.",
      message: "Hi Ananya! Need the Korth textbook for 1 week study prep.",
      status: "BORROWED",
    },
  });

  await prisma.borrowTransaction.create({
    data: {
      borrowRequestId: req1.id,
      borrowedAt: startDate1,
      dueDate: endDate1,
      totalAmount: 140,
      securityDeposit: 300,
      status: "ACTIVE",
    },
  });

  // Pending borrow request received by Student Demo for Arduino kit from Rohan
  const startDate2 = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
  const endDate2 = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);

  const req2 = await prisma.borrowRequest.create({
    data: {
      itemId: createdItems[2].id,
      borrowerId: createdStudents[1].id, // Rohan
      ownerId: studentDemo.id,
      startDate: startDate2,
      endDate: endDate2,
      totalDays: 3,
      estimatedCost: 150,
      securityDeposit: 800,
      purpose: "Building line follower robot for Robotics club presentation.",
      message: "Hey Aarav, can I borrow your Arduino kit for 3 days?",
      status: "REQUESTED",
    },
  });

  // Completed past borrow for Student Demo
  const pastStart = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
  const pastEnd = new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000);

  const req3 = await prisma.borrowRequest.create({
    data: {
      itemId: createdItems[5].id, // DSLR Camera
      borrowerId: studentDemo.id,
      ownerId: createdStudents[5].id, // Devansh
      startDate: pastStart,
      endDate: pastEnd,
      totalDays: 3,
      estimatedCost: 1050,
      securityDeposit: 4000,
      purpose: "Coverage for Hackathon 2026 event.",
      message: "Need the Canon DSLR for college tech fest coverage!",
      status: "RETURNED",
    },
  });

  await prisma.borrowTransaction.create({
    data: {
      borrowRequestId: req3.id,
      borrowedAt: pastStart,
      dueDate: pastEnd,
      returnedAt: pastEnd,
      totalAmount: 1050,
      securityDeposit: 4000,
      status: "COMPLETED",
    },
  });

  await prisma.returnRecord.create({
    data: {
      borrowRequestId: req3.id,
      borrowerNotes: "Camera returned in mint condition with battery fully charged.",
      ownerNotes: "Checked lens and SD card. Everything perfect! Thanks Aarav.",
      conditionStatus: "EXCELLENT",
      damageReported: false,
      requestedAt: pastEnd,
      confirmedAt: pastEnd,
    },
  });

  await prisma.review.create({
    data: {
      borrowRequestId: req3.id,
      reviewerId: studentDemo.id,
      revieweeId: createdStudents[5].id,
      itemId: createdItems[5].id,
      rating: 5,
      comment: "Devansh is an awesome owner! Camera was super clean with dual batteries.",
    },
  });

  await prisma.review.create({
    data: {
      borrowRequestId: req3.id,
      reviewerId: createdStudents[5].id,
      revieweeId: studentDemo.id,
      itemId: createdItems[5].id,
      rating: 5,
      comment: "Aarav took great care of the camera. Highly recommended borrower!",
    },
  });

  // 5. Conversations & Messages
  const conv1 = await prisma.conversation.create({
    data: {
      itemId: createdItems[0].id,
      borrowerId: studentDemo.id,
      ownerId: createdStudents[0].id, // Ananya
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: conv1.id,
        senderId: studentDemo.id,
        text: "Hi Ananya! Is the DBMS textbook available for pickup today?",
        isRead: true,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        conversationId: conv1.id,
        senderId: createdStudents[0].id,
        text: "Yes Aarav! I'm in Hostel Block C, Room 204. You can come by at 5 PM.",
        isRead: true,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 10 * 60 * 1000),
      },
    ],
  });

  // 6. Notifications for studentDemo
  await prisma.notification.createMany({
    data: [
      {
        userId: studentDemo.id,
        title: "New Borrow Request Received 📩",
        message: "Rohan Verma requested to borrow your 'Arduino Uno R3 Starter Kit' for 3 days.",
        type: "BORROW_REQUEST",
        link: "/borrows",
        isRead: false,
      },
      {
        userId: studentDemo.id,
        title: "Borrow Request Approved! ✅",
        message: "Ananya Patel approved your request for 'DBMS Reference Book - Korth'.",
        type: "REQUEST_APPROVED",
        link: "/borrows",
        isRead: true,
      },
    ],
  });

  // 7. Achievements
  const achievements = [
    { code: "FIRST_BORROW", title: "First Borrow", description: "Completed your first item borrowing on campus.", icon: "🔄", metricTarget: 1 },
    { code: "FIRST_LEND", title: "Community Helper", description: "Listed and successfully lent your first item.", icon: "🤝", metricTarget: 1 },
    { code: "ECO_SAVER", title: "Eco Saver", description: "Saved more than ₹5,000 and avoided 10 kg of waste.", icon: "🌱", metricTarget: 5000 },
    { code: "KNOWLEDGE_SHARER", title: "Knowledge Sharer", description: "Lent textbooks or study materials to 5 students.", icon: "📚", metricTarget: 5 },
    { code: "TOP_LENDER", title: "Top Lender", description: "Maintained a 4.9+ rating across 10+ lendings.", icon: "🏆", metricTarget: 10 },
    { code: "10_BORROWS", title: "10 Successful Borrows", description: "Completed 10 borrowing transactions.", icon: "🔥", metricTarget: 10 },
  ];

  for (const ach of achievements) {
    const createdAch = await prisma.achievement.upsert({
      where: { code: ach.code },
      update: ach,
      create: ach,
    });

    if (ach.code === "FIRST_BORROW" || ach.code === "ECO_SAVER" || ach.code === "FIRST_LEND") {
      await prisma.userAchievement.create({
        data: {
          userId: studentDemo.id,
          achievementId: createdAch.id,
        },
      });
    }
  }

  console.log("✅ Seed database refreshed with usernames!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
