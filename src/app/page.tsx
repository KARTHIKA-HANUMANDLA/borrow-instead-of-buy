import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ItemCard from "@/components/items/ItemCard";
import { prisma } from "@/lib/prisma";
import {
  Repeat,
  Search,
  PlusCircle,
  BookOpen,
  Laptop,
  Cpu,
  Shirt,
  Backpack,
  Trophy,
  Compass,
  Wrench,
  ShieldCheck,
  Leaf,
  Users,
  DollarSign,
  ArrowRight,
  Sparkles,
  Bot,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export const revalidate = 0;

export default async function HomePage() {
  // Fetch real featured items & categories from DB
  const [featuredItems, categories, totalStats] = await Promise.all([
    prisma.item.findMany({
      where: { isApproved: true, isAvailable: true },
      take: 8,
      orderBy: { rating: "desc" },
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
      },
    }),
    prisma.category.findMany({
      take: 8,
      include: {
        _count: {
          select: { items: true },
        },
      },
    }),
    prisma.user.aggregate({
      _sum: {
        totalSavings: true,
        wasteAvoidedKg: true,
        itemsReusedCount: true,
      },
      _count: { id: true },
    }),
  ]);

  const categoryIconMap: Record<string, any> = {
    books: BookOpen,
    electronics: Laptop,
    "project-equipment": Cpu,
    fashion: Shirt,
    "college-essentials": Backpack,
    sports: Trophy,
    travel: Compass,
    tools: Wrench,
  };

  const calculatedSavings = (totalStats._sum.totalSavings || 0) + 94600;
  const calculatedWaste = (totalStats._sum.wasteAvoidedKg || 0) + 228;
  const calculatedReused = (totalStats._sum.itemsReusedCount || 0) + 184;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-24 lg:pt-24 lg:pb-32">
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Hero Text Content */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 text-xs font-semibold tracking-wide shadow-inner">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>College Peer-to-Peer Borrowing Network</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
                  Borrow Instead <br className="hidden sm:inline" />
                  of <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Buy</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Share what you have. Borrow what you need. <br className="hidden sm:inline" />
                  Save money. Reduce waste. Build a better campus community.
                </p>

                <p className="text-sm font-semibold text-emerald-400 tracking-wide uppercase">
                  &ldquo;Why buy it when you can borrow it?&rdquo;
                </p>

                {/* Hero Action Buttons */}
                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                  <Link
                    href="/browse"
                    className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold rounded-2xl shadow-xl shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 text-base group"
                  >
                    <Search className="w-5 h-5" />
                    <span>Browse Campus Items</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>

                  <Link
                    href="/lend"
                    className="w-full sm:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white font-bold rounded-2xl border border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 text-base"
                  >
                    <PlusCircle className="w-5 h-5 text-emerald-400" />
                    <span>Lend an Item</span>
                  </Link>
                </div>

                {/* Verified Campus Badges */}
                <div className="pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Verified Student IDs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-emerald-400" />
                    <span>Zero Waste Impact</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>1,200+ Campus Members</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Visual Card Stack */}
              <div className="lg:col-span-5 relative">
                <div className="relative mx-auto max-w-sm lg:max-w-none">
                  {/* Floating Assistant Card */}
                  <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                          <Bot className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">BorrowBuddy Assistant</h4>
                          <span className="text-[11px] text-emerald-400 font-semibold">Live Campus Matcher</span>
                        </div>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 text-xs text-slate-300 space-y-2">
                      <p className="font-semibold text-slate-200">&ldquo;I need an Arduino for my IoT mini project&rdquo;</p>
                      <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-medium">
                        Found 3 available items in ECE & CSE Depts starting at ₹50/day!
                      </div>
                    </div>

                    {/* Quick Stats Grid inside Hero */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                        <span className="text-xl font-extrabold text-emerald-400 block">₹{calculatedSavings.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Money Saved</span>
                      </div>
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-center">
                        <span className="text-xl font-extrabold text-teal-400 block">{calculatedReused}</span>
                        <span className="text-[10px] text-slate-400 font-semibold uppercase">Items Reused</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES SECTION */}
        <section className="py-16 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Explore Categories
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                What do you need for campus today?
              </h2>
              <p className="text-sm text-slate-600">
                From textbooks to lab tools and formal wear, borrow everything you need directly from fellow students.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((cat) => {
                const Icon = categoryIconMap[cat.slug] || BookOpen;
                return (
                  <Link
                    key={cat.id}
                    href={`/browse?category=${cat.slug}`}
                    className="group bg-slate-50 hover:bg-emerald-50/80 border border-slate-200/80 hover:border-emerald-300 p-5 rounded-2xl transition-all duration-300 flex flex-col justify-between shadow-xs hover:shadow-md"
                  >
                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-emerald-600 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="mt-4">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        {cat.description}
                      </p>
                      <span className="inline-block mt-3 text-[11px] font-bold text-emerald-700">
                        {cat._count.items} Available Items →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-16 bg-slate-100/70 border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Simple 4-Step Process
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                How Borrow Instead of Buy Works
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: "01",
                  title: "Find what you need",
                  desc: "Search for textbooks, calculators, project components, or formal blazers listed by college students.",
                  icon: Search,
                },
                {
                  step: "02",
                  title: "Send a borrow request",
                  desc: "Select your start date and end date. Our system calculates estimated cost and refundable deposit.",
                  icon: Repeat,
                },
                {
                  step: "03",
                  title: "Pick it up on campus",
                  desc: "Chat with the owner to arrange pickup at designated campus spots like library desk or hostel entrance.",
                  icon: CheckCircle2,
                },
                {
                  step: "04",
                  title: "Return & Rate",
                  desc: "Return the item on time, log your savings, rate your experience, and earn Community Credits!",
                  icon: Sparkles,
                },
              ].map((s, idx) => {
                const StepIcon = s.icon;
                return (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs relative space-y-3"
                  >
                    <span className="text-4xl font-black text-slate-200 block font-mono">
                      {s.step}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <StepIcon className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURED ITEMS FROM DATABASE */}
        <section className="py-16 bg-white border-b border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  Real Campus Listings
                </span>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  Featured Items Available Now
                </h2>
              </div>
              <Link
                href="/browse"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 transition"
              >
                <span>View All Marketplace Items</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        {/* WHY BORROW? SUSTAINABILITY IMPACT */}
        <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Campus Environmental & Economic Impact
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Every item borrowed is one less item that needs to be purchased.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                By enabling students to share resources, Borrow Instead of Buy reduces e-waste, cuts financial strain for engineering students, and fosters campus community trust.
              </p>
            </div>

            {/* Impact Metric Counter Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-white block">
                  ₹{calculatedSavings.toLocaleString()}
                </span>
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
                  Estimated Money Saved
                </span>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 mx-auto flex items-center justify-center">
                  <Repeat className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-white block">
                  {calculatedReused}+
                </span>
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
                  Items Reused
                </span>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center">
                  <Leaf className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-white block">
                  {calculatedWaste} kg
                </span>
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
                  Estimated Waste Avoided
                </span>
              </div>

              <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700 text-center space-y-2">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <span className="text-3xl sm:text-4xl font-black text-white block">
                  1,250+
                </span>
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider block">
                  Students Connected
                </span>
              </div>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/impact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl transition shadow-lg shadow-emerald-500/20"
              >
                <span>View Complete Campus Impact Analytics</span>
                <TrendingUp className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-20 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white">
          <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Have something sitting unused in your hostel room?
            </h2>
            <p className="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto font-medium">
              Lend your textbooks, calculators, project kits, or formal clothes to fellow students. Earn money and Community Credits while helping others!
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/lend"
                className="px-8 py-4 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-base rounded-2xl shadow-xl transition flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                <span>List an Item Now</span>
              </Link>

              <Link
                href="/borrow-vs-buy"
                className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-2xl backdrop-blur-md border border-white/30 transition flex items-center gap-2"
              >
                <span>Try Borrow vs Buy Calculator</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
