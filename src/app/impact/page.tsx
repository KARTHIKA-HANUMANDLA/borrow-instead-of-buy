"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Leaf, DollarSign, Repeat, Users, TrendingUp, BarChart2, PieChart } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

export default function ImpactPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchImpact();
  }, []);

  async function fetchImpact() {
    setLoading(true);
    try {
      const res = await fetch("/api/impact");
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error("Fetch impact error:", err);
    } finally {
      setLoading(false);
    }
  }

  const COLORS = ["#10b981", "#14b8a6", "#06b6d4", "#f59e0b", "#6366f1", "#ec4899", "#8b5cf6", "#64748b"];

  if (loading || !data) {
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

  const { campusTotal, charts } = data;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-8 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Campus Environmental & Economic Metrics
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">Your Campus Sustainability Impact</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Every item borrowed is one less item that needs to be manufactured, packaged, and purchased. Here is our collective campus progress!
          </p>
        </div>

        {/* Aggregate Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-slate-900 block">
              ₹{campusTotal.totalSavings.toLocaleString()}
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase">Total Money Saved</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
              <Repeat className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-slate-900 block">
              {campusTotal.itemsReusedCount}
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase">Items Reused</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              <Leaf className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-slate-900 block">
              {campusTotal.wasteAvoidedKg} kg
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase">Estimated Waste Avoided</span>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-3xl font-black text-slate-900 block">
              {campusTotal.studentsCount}
            </span>
            <span className="text-xs text-slate-500 font-bold uppercase">Active Students</span>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Monthly Borrowing Growth Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Monthly Borrowing Growth</h3>
                <p className="text-xs text-slate-500">Track of borrowings per month on campus</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="h-72 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={charts.monthlyBorrows}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{ borderRadius: "16px", borderColor: "#cbd5e1" }}
                    formatter={(value: any) => [`${value} Borrows`, "Borrowings"]}
                  />
                  <Bar dataKey="borrows" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Popularity Pie Chart */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Popular Categories</h3>
            <p className="text-xs text-slate-500">Distribution of items listed across categories</p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={charts.categoryBreakdown}
                    dataKey="itemsCount"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {charts.categoryBreakdown.map((_: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: "12px" }} />
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 italic">
          * Environmental savings and waste avoidance numbers are calculated as estimates based on general lifecycle assessment benchmarks for college consumer goods.
        </p>
      </main>

      <Footer />
    </div>
  );
}
