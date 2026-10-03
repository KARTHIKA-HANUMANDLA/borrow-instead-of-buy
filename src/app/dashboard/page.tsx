import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ItemCard from "@/components/items/ItemCard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Search,
  PlusCircle,
  Package,
  BookOpen,
  DollarSign,
  Leaf,
  Award,
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export const revalidate = 0;

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user active borrows
  const activeBorrows = await prisma.borrowRequest.findMany({
    where: {
      borrowerId: user.id,
      status: { in: ["APPROVED", "RESERVED", "BORROWED", "RETURN_REQUESTED"] },
    },
    include: {
      item: { include: { category: true } },
      owner: { select: { id: true, name: true, avatar: true, department: true } },
    },
    orderBy: { endDate: "asc" },
  });

  // Fetch recommended items for user
  const recommendedItems = await prisma.item.findMany({
    where: {
      isApproved: true,
      isAvailable: true,
      ownerId: { not: user.id },
    },
    take: 4,
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
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Header & Search */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-8 text-white shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Student Member Portal
              </span>
              <h1 className="text-3xl font-extrabold">Good day, {user.name} 👋</h1>
              <p className="text-xs text-slate-300 mt-1">
                {user.department} • {user.year} • Roll ID: {user.studentId}
              </p>
            </div>

            <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700/80 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Community Credits</span>
                <span className="text-lg font-black text-amber-400">{user.communityCredits} Credits</span>
              </div>
            </div>
          </div>

          {/* Quick Search Bar */}
          <form action="/browse" method="GET" className="relative max-w-2xl">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              name="search"
              placeholder="What do you need today? (e.g. DBMS Textbook, Calculator, Arduino, Blazer)"
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white text-slate-900 text-xs font-semibold placeholder:text-slate-400 focus:outline-hidden focus:ring-4 focus:ring-emerald-500/30 shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-xs transition"
            >
              Search
            </button>
          </form>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/browse"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Browse Items</h3>
            <p className="text-[11px] text-slate-500">Explore items listed on campus</p>
          </Link>

          <Link
            href="/lend"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Lend an Item</h3>
            <p className="text-[11px] text-slate-500">List unused items & earn credits</p>
          </Link>

          <Link
            href="/borrows"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">My Borrows</h3>
            <p className="text-[11px] text-slate-500">Track active & past borrowings</p>
          </Link>

          <Link
            href="/listings"
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 hover:shadow-md transition space-y-2 group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">My Listings</h3>
            <p className="text-[11px] text-slate-500">Manage items & borrow requests</p>
          </Link>
        </div>

        {/* ACTIVE BORROWS SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Active Borrows</h2>
            <Link href="/borrows" className="text-xs font-bold text-emerald-600 hover:underline">
              View All Borrows →
            </Link>
          </div>

          {activeBorrows.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
              <Package className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-700">You haven&apos;t borrowed anything yet.</p>
              <p className="text-[11px] text-slate-500">Need something for lab or exams? Browse items available on campus.</p>
              <Link
                href="/browse"
                className="inline-block mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
              >
                Browse Items Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {activeBorrows.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={req.item.image}
                      alt={req.item.title}
                      className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{req.item.title}</h4>
                      <p className="text-xs text-slate-500">
                        Owner: <strong>{req.owner.name}</strong> ({req.owner.department})
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Due: {new Date(req.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {req.status}
                    </span>
                    <Link
                      href="/borrows"
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Manage / Return</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* YOUR SUSTAINABILITY & SAVINGS IMPACT */}
        <div className="bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-emerald-400" />
              <h2 className="text-base font-bold text-white">Your Campus Impact & Savings</h2>
            </div>
            <Link href="/impact" className="text-xs text-emerald-300 font-bold hover:underline">
              Detailed Analytics →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
              <span className="text-2xl font-black text-emerald-400 block">₹{user.totalSavings}</span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold">Money Saved</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
              <span className="text-2xl font-black text-teal-300 block">{user.itemsReusedCount}</span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold">Items Reused</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
              <span className="text-2xl font-black text-cyan-300 block">{user.wasteAvoidedKg} kg</span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold">Waste Avoided</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
              <span className="text-2xl font-black text-amber-300 block">{user.communityCredits}</span>
              <span className="text-[10px] text-slate-300 uppercase font-semibold">Community Credits</span>
            </div>
          </div>
        </div>

        {/* RECOMMENDED FOR YOU SECTION */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-600">Personalized</span>
              <h2 className="text-xl font-extrabold text-slate-900">Recommended For You</h2>
            </div>
            <Link href="/browse" className="text-xs font-bold text-emerald-600 hover:underline">
              Browse All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
