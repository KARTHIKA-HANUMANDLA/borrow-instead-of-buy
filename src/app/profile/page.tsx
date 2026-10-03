import Link from "next/link";
import { redirect } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ItemCard from "@/components/items/ItemCard";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  User,
  ShieldCheck,
  Star,
  DollarSign,
  Leaf,
  Award,
  BookOpen,
  Package,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
} from "lucide-react";

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch user items, borrow requests, reviews, and achievements
  const [userItems, borrowHistory, reviewsReceived, userAchievements] = await Promise.all([
    prisma.item.findMany({
      where: { ownerId: user.id },
      include: {
        category: true,
        owner: {
          select: {
            id: true,
            name: true,
            avatar: true,
            department: true,
            rating: true,
            isVerified: true,
          },
        },
      },
    }),
    prisma.borrowRequest.findMany({
      where: { borrowerId: user.id },
      include: {
        item: { include: { category: true } },
        owner: { select: { name: true, department: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.review.findMany({
      where: { revieweeId: user.id },
      include: {
        reviewer: { select: { name: true, avatar: true, department: true } },
        item: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userAchievement.findMany({
      where: { userId: user.id },
      include: { achievement: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                alt={user.name}
                className="w-20 h-20 rounded-3xl object-cover bg-slate-100 border-2 border-emerald-500 shadow-md"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
                  {user.isVerified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Verified Student
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {user.department} • {user.year} • Roll ID: {user.studentId}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-bold bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{user.rating || 5.0} Trust Rating ({user.ratingCount} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="/lend"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition"
            >
              + Lend New Item
            </Link>
          </div>

          {/* User Bio */}
          {user.bio && (
            <p className="text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100 italic leading-relaxed">
              &ldquo;{user.bio}&rdquo;
            </p>
          )}

          {/* Quick Impact Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200/60 text-center">
              <span className="text-2xl font-black text-emerald-700 block">₹{user.totalSavings}</span>
              <span className="text-[10px] text-emerald-800 font-bold uppercase">Total Money Saved</span>
            </div>

            <div className="bg-teal-50/60 p-4 rounded-2xl border border-teal-200/60 text-center">
              <span className="text-2xl font-black text-teal-700 block">{user.itemsReusedCount}</span>
              <span className="text-[10px] text-teal-800 font-bold uppercase">Items Reused</span>
            </div>

            <div className="bg-cyan-50/60 p-4 rounded-2xl border border-cyan-200/60 text-center">
              <span className="text-2xl font-black text-cyan-700 block">{user.wasteAvoidedKg} kg</span>
              <span className="text-[10px] text-cyan-800 font-bold uppercase">Waste Avoided</span>
            </div>

            <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/60 text-center">
              <span className="text-2xl font-black text-amber-700 block">{user.communityCredits}</span>
              <span className="text-[10px] text-amber-800 font-bold uppercase">Community Credits</span>
            </div>
          </div>
        </div>

        {/* Achievements Badges */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-slate-900">Unlocked Achievements & Badges</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {userAchievements.map((ua) => (
              <div
                key={ua.id}
                className="bg-amber-50/60 border border-amber-200 p-3.5 rounded-2xl text-center space-y-1"
              >
                <span className="text-2xl block">{ua.achievement.icon}</span>
                <span className="text-xs font-bold text-slate-900 block truncate">{ua.achievement.title}</span>
                <span className="text-[10px] text-slate-500 block line-clamp-1">{ua.achievement.description}</span>
              </div>
            ))}
          </div>
        </div>

        {/* My Listed Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">My Listed Items ({userItems.length})</h2>
            <Link href="/lend" className="text-xs font-bold text-emerald-600 hover:underline">
              + Add New Listing
            </Link>
          </div>

          {userItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center text-xs text-slate-500">
              You haven&apos;t listed any items for lending yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {userItems.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Reviews Received */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Reviews Received ({reviewsReceived.length})</h2>
          {reviewsReceived.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No reviews written by peers yet.</p>
          ) : (
            <div className="space-y-3">
              {reviewsReceived.map((rev) => (
                <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={rev.reviewer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.reviewer.name}`}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="text-xs font-bold text-slate-800">{rev.reviewer.name}</span>
                    </div>
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-xs text-slate-600">{rev.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
