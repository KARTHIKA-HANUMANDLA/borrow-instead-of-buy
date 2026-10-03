"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BookOpen, Check, X, ShieldAlert, Trash2 } from "lucide-react";

export default function AdminItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/items");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Fetch items error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleApproval(itemId: string, currentApproved: boolean) {
    try {
      const res = await fetch("/api/admin/items", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, isApproved: !currentApproved }),
      });
      if (res.ok) fetchItems();
    } catch (err) {
      console.error("Toggle approval error:", err);
    }
  }

  async function deleteListing(itemId: string) {
    if (!confirm("Are you sure you want to permanently delete this listing?")) return;
    try {
      const res = await fetch(`/api/items/${itemId}`, { method: "DELETE" });
      if (res.ok) fetchItems();
    } catch (err) {
      console.error("Delete listing error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Admin Control</span>
            <h1 className="text-2xl font-extrabold text-slate-900">Listing Moderation Queue</h1>
            <p className="text-xs text-slate-500 mt-1">Review campus listings for compliance with safety guidelines.</p>
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4">
                <img src={item.image} alt={item.title} className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                      {item.category.name}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase ${item.isApproved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                      {item.isApproved ? "Approved" : "Hidden / Flagged"}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-500">
                    Owner: <strong>{item.owner.name}</strong> ({item.owner.email})
                  </p>
                  <span className="text-xs font-bold text-emerald-700 block">
                    {item.pricePerDay === 0 ? "FREE" : `₹${item.pricePerDay}/day`} • Deposit ₹{item.securityDeposit}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => toggleApproval(item.id, item.isApproved)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    item.isApproved
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      : "bg-emerald-600 text-white hover:bg-emerald-700"
                  }`}
                >
                  {item.isApproved ? "Hide Listing" : "Approve Listing"}
                </button>

                <button
                  onClick={() => deleteListing(item.id)}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition border border-rose-200"
                  title="Remove Listing"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
