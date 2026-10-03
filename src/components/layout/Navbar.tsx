"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Repeat,
  Search,
  PlusCircle,
  Package,
  BookOpen,
  MessageSquare,
  Bell,
  User,
  ShieldCheck,
  LogOut,
  Menu,
  X,
  Sparkles,
  Award,
  Leaf,
  Bot,
  BarChart2,
  Bookmark,
} from "lucide-react";
import DemoBanner from "@/components/ui/DemoBanner";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
  studentId: string;
  avatar?: string | null;
  communityCredits?: number;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  async function fetchUser() {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        if (data.counts) {
          setUnreadNotifications(data.counts.unreadNotifications || 0);
          setUnreadMessages(data.counts.unreadMessages || 0);
        }
      }
    } catch (err) {
      console.error("Fetch me error:", err);
    }
  }

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/");
    window.location.reload();
  }

  const navLinks = [
    { name: "Home", href: "/", icon: Repeat },
    { name: "Browse", href: "/browse", icon: Search },
    { name: "Lend Item", href: "/lend", icon: PlusCircle },
    { name: "My Borrows", href: "/borrows", icon: Package },
    { name: "My Listings", href: "/listings", icon: BookOpen },
    { name: "Impact", href: "/impact", icon: Leaf },
    { name: "BorrowBuddy AI", href: "/borrowbuddy", icon: Bot },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <DemoBanner currentUser={user} onRefresh={fetchUser} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <Repeat className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight">
                Borrow<span className="text-emerald-600">Instead</span>OfBuy
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase block -mt-0.5">
                Campus Sharing Platform
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-emerald-600" : "text-slate-400"}`} />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/admin")
                    ? "bg-amber-50 text-amber-800 font-semibold"
                    : "text-amber-700 hover:bg-amber-50"
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Dashboard</span>
              </Link>
            )}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <>
                {/* Messages Link with Badge */}
                <Link
                  href="/messages"
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                  title="Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                  {unreadMessages > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {unreadMessages}
                    </span>
                  )}
                </Link>

                {/* Notifications Link with Badge */}
                <Link
                  href="/notifications"
                  className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                      {unreadNotifications}
                    </span>
                  )}
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition border border-slate-200"
                  >
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="text-left hidden md:block pr-1">
                      <span className="text-xs font-bold text-slate-800 block leading-tight truncate max-w-[120px]">
                        {user.name}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold block leading-tight">
                        {user.communityCredits || 50} Credits
                      </span>
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50"
                      onMouseLeave={() => setUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                        <span className="inline-block mt-1.5 px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                          {user.role}
                        </span>
                      </div>

                      <Link
                        href="/profile"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <Link
                        href="/favorites"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Bookmark className="w-4 h-4 text-slate-400" />
                        <span>Saved Wishlist</span>
                      </Link>

                      <Link
                        href="/borrow-vs-buy"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <BarChart2 className="w-4 h-4 text-slate-400" />
                        <span>Borrow vs Buy Calculator</span>
                      </Link>

                      <Link
                        href="/leaderboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Award className="w-4 h-4 text-slate-400" />
                        <span>Campus Leaderboard</span>
                      </Link>

                      {user.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-amber-700 hover:bg-amber-50 transition font-medium"
                        >
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          <span>Admin Control Panel</span>
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition font-medium text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs shadow-emerald-600/20 transition"
                >
                  Join Platform
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
              >
                <Icon className="w-5 h-5 text-slate-400" />
                <span>{link.name}</span>
              </Link>
            );
          })}

          <Link
            href="/borrow-vs-buy"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            <BarChart2 className="w-5 h-5 text-slate-400" />
            <span>Borrow vs Buy Calculator</span>
          </Link>

          <Link
            href="/leaderboard"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            <Award className="w-5 h-5 text-slate-400" />
            <span>Campus Leaderboard</span>
          </Link>

          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-amber-700 bg-amber-50"
            >
              <ShieldCheck className="w-5 h-5 text-amber-600" />
              <span>Admin Dashboard</span>
            </Link>
          )}

          {!user && (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-slate-700 font-semibold bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-white font-semibold bg-emerald-600 rounded-xl"
              >
                Register Student Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
