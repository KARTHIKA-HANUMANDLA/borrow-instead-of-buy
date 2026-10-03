import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import { Award, Trophy, Star, ShieldCheck, Leaf } from "lucide-react";

export const revalidate = 0;

export default async function LeaderboardPage() {
  const topLenders = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: [{ communityCredits: "desc" }, { itemsReusedCount: "desc" }],
    take: 10,
    select: {
      id: true,
      name: true,
      avatar: true,
      department: true,
      year: true,
      rating: true,
      ratingCount: true,
      totalSavings: true,
      itemsReusedCount: true,
      communityCredits: true,
      isVerified: true,
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-8 text-white shadow-xl space-y-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Campus Sharing Recognition
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">Campus Community Leaderboard</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Honoring top student lenders and eco-contributors based on items shared, verified ratings, and Community Credits earned.
          </p>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Rank & Student</span>
            <span className="hidden sm:inline">Department</span>
            <span>Community Contribution</span>
          </div>

          <div className="divide-y divide-slate-100">
            {topLenders.map((user, idx) => (
              <div
                key={user.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition"
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                      idx === 0
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : idx === 1
                        ? "bg-slate-200 text-slate-800"
                        : idx === 2
                        ? "bg-amber-700/20 text-amber-800"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    #{idx + 1}
                  </span>

                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />

                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-slate-900">{user.name}</h4>
                      {user.isVerified && (
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      {user.department} • {user.year}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div className="hidden sm:block text-right">
                    <div className="flex items-center gap-1 text-xs text-amber-600 font-bold justify-end">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{user.rating || 5.0} Rating</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block">
                      {user.itemsReusedCount} Items Shared
                    </span>
                  </div>

                  <div className="bg-emerald-50 px-3.5 py-1.5 rounded-xl border border-emerald-200 text-center">
                    <span className="text-sm font-black text-emerald-800 block">
                      {user.communityCredits}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold uppercase block">Credits</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
