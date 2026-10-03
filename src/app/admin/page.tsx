"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ShieldCheck,
  Users,
  BookOpen,
  Package,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Leaf,
  BarChart2,
  TrendingUp,
  Tag,
  FileText,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [categoryStats, setCategoryStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  async function fetchAdminStats() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setCategoryStats(data.categoryStats || []);
      }
    } catch (err) {
      console.error("Fetch admin stats error:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        <Navbar />
        <main className="max-w-7xl mx-auto w-full p-8">
          <div className="h-96 bg-slate-200 animate-pulse rounded-3xl"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Admin Header */}
        <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-950 rounded-3xl p-8 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Faculty & Administrator Portal
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">Platform Governance & Analytics</h1>
          <p className="text-xs text-slate-300 max-w-xl">
            Monitor campus borrowing activity, verify student accounts, moderate item listings, and resolve disputes.
          </p>

          {/* Quick Subnav Tabs */}
          <div className="flex flex-wrap gap-2 pt-2">
            <Link
              href="/admin/users"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
            >
              User Verification
            </Link>
            <Link
              href="/admin/items"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
            >
              Listing Moderation
            </Link>
            <Link
              href="/admin/categories"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
            >
              Category Manager
            </Link>
            <Link
              href="/admin/reports"
              className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition"
            >
              Reports Queue
            </Link>
          </div>
        </div>

        {/* Core Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-slate-900 block">{stats.totalStudents}</span>
            <span className="text-xs text-slate-500 font-bold uppercase">Total Registered Students</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-slate-900 block">{stats.totalListings}</span>
            <span className="text-xs text-slate-500 font-bold uppercase">Active Marketplace Items</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-slate-900 block">{stats.activeBorrowsCount}</span>
            <span className="text-xs text-slate-500 font-bold uppercase">Active Ongoing Borrows</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <CheckCircle className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-slate-900 block">{stats.completedBorrowsCount}</span>
            <span className="text-xs text-slate-500 font-bold uppercase">Completed Borrowings</span>
          </div>
        </div>

        {/* Secondary Impact & Safety Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-emerald-950 text-white p-6 rounded-3xl border border-emerald-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase">Estimated Money Saved</span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-3xl font-black text-emerald-400">₹{stats.totalSavings.toLocaleString()}</span>
            <p className="text-[11px] text-slate-300">Total student expenses avoided across campus</p>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-400 uppercase">Estimated Waste Avoided</span>
              <Leaf className="w-5 h-5 text-teal-400" />
            </div>
            <span className="text-3xl font-black text-teal-300">{stats.totalWasteAvoidedKg} kg</span>
            <p className="text-[11px] text-slate-300">Reduced electronics & textbook waste</p>
          </div>

          <div className="bg-rose-950 text-white p-6 rounded-3xl border border-rose-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-400 uppercase">Pending Reports</span>
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-3xl font-black text-rose-300">
              {stats.reportedItemsCount + stats.reportedUsersCount} Reports
            </span>
            <p className="text-[11px] text-rose-200">User or item safety issues flagged for review</p>
          </div>
        </div>

        {/* Category Breakdown Graph */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Listings per Category</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ borderRadius: "12px" }} />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
