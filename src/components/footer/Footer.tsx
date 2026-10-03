import Link from "next/link";
import { Repeat, Heart, Shield, Leaf, Sparkles, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-slate-900 font-bold">
                <Repeat className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Borrow<span className="text-emerald-400">Instead</span>OfBuy
              </span>
            </Link>
            <p className="text-slate-400 text-xs leading-relaxed">
              &ldquo;Why buy it when you can borrow it?&rdquo;
              <br />
              Share what you have. Borrow what you need. Save money, reduce waste, and build a better college community.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span>Campus Sustainability Verified</span>
            </div>
          </div>

          {/* Quick Marketplace */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Marketplace</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/browse" className="hover:text-emerald-400 transition">Browse All Items</Link>
              </li>
              <li>
                <Link href="/browse?category=books" className="hover:text-emerald-400 transition">Books & Study Material</Link>
              </li>
              <li>
                <Link href="/browse?category=electronics" className="hover:text-emerald-400 transition">Electronics & Calculators</Link>
              </li>
              <li>
                <Link href="/browse?category=project-equipment" className="hover:text-emerald-400 transition">Arduino & Project Equipment</Link>
              </li>
              <li>
                <Link href="/browse?category=fashion" className="hover:text-emerald-400 transition">Formal Blazers & Suits</Link>
              </li>
            </ul>
          </div>

          {/* Features & Tools */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Campus Tools</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/lend" className="hover:text-emerald-400 transition">Lend an Item & Earn Credits</Link>
              </li>
              <li>
                <Link href="/borrow-vs-buy" className="hover:text-emerald-400 transition">Borrow vs Buy Calculator</Link>
              </li>
              <li>
                <Link href="/borrowbuddy" className="hover:text-emerald-400 transition">BorrowBuddy AI Assistant</Link>
              </li>
              <li>
                <Link href="/impact" className="hover:text-emerald-400 transition">Sustainability Impact & Metrics</Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-emerald-400 transition">Campus Leaderboard</Link>
              </li>
            </ul>
          </div>

          {/* College Project Note */}
          <div className="space-y-3">
            <h4 className="text-white font-semibold text-xs tracking-wider uppercase">Project Info</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Built specifically as a <strong>BTech Major Project</strong> for campus resource optimization, peer-to-peer sharing, and carbon footprint reduction.
            </p>
            <div className="pt-2 text-xs text-slate-500 flex items-center gap-1">
              <Shield className="w-4 h-4 text-emerald-500" />
              <span>Verified Student Community</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Borrow Instead of Buy. BTech Major Project Platform.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Made with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for College Students
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
