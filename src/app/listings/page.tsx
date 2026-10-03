"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  BookOpen,
  PlusCircle,
  CheckCircle,
  XCircle,
  Clock,
  RotateCcw,
  DollarSign,
  ShieldCheck,
  Award,
  Trash2,
  Check,
} from "lucide-react";

export default function MyListingsPage() {
  const [tab, setTab] = useState<"items" | "requests">("requests");
  const [requests, setRequests] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Confirm return state
  const [confirmReturnReq, setConfirmReturnReq] = useState<any>(null);
  const [ownerNotes, setOwnerNotes] = useState("");
  const [conditionStatus, setConditionStatus] = useState("GOOD");
  const [confirmLoading, setConfirmLoading] = useState(false);

  useEffect(() => {
    fetchLenderData();
  }, [tab]);

  async function fetchLenderData() {
    setLoading(true);
    try {
      const [reqRes, itemsRes] = await Promise.all([
        fetch("/api/borrow-requests?role=lender&status=all"),
        fetch("/api/items"),
      ]);

      if (reqRes.ok) {
        const reqData = await reqRes.json();
        setRequests(reqData.requests || []);
      }
    } catch (err) {
      console.error("Fetch lender data error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateRequest(id: string, action: "APPROVE" | "REJECT" | "MARK_BORROWED") {
    try {
      const res = await fetch(`/api/borrow-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) fetchLenderData();
    } catch (err) {
      console.error("Update request error:", err);
    }
  }

  async function handleConfirmReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmReturnReq) return;
    setConfirmLoading(true);

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowRequestId: confirmReturnReq.id,
          action: "CONFIRM_RETURN",
          ownerNotes,
          conditionStatus,
        }),
      });

      if (res.ok) {
        setConfirmReturnReq(null);
        setOwnerNotes("");
        fetchLenderData();
      }
    } catch (err) {
      console.error("Confirm return error:", err);
    } finally {
      setConfirmLoading(false);
    }
  }

  const pendingRequests = requests.filter((r) => r.status === "REQUESTED");
  const activeLendings = requests.filter((r) => r.status === "BORROWED" || r.status === "APPROVED");
  const returnRequestedList = requests.filter((r) => r.status === "RETURN_REQUESTED");

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Lender Management</span>
            <h1 className="text-3xl font-extrabold text-slate-900">My Item Listings & Requests</h1>
            <p className="text-xs text-slate-500 mt-1">Accept borrow requests, track lent items, and confirm returns.</p>
          </div>

          <Link
            href="/lend"
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List a New Item</span>
          </Link>
        </div>

        {/* Pending Action Alerts */}
        {returnRequestedList.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-4 flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2 text-purple-900 font-bold">
              <RotateCcw className="w-5 h-5 text-purple-600" />
              <span>{returnRequestedList.length} Borrower(s) requested return confirmation!</span>
            </div>
            <button
              onClick={() => setTab("requests")}
              className="px-3 py-1.5 bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              Review Returns
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 text-xs font-bold">
          <button
            onClick={() => setTab("requests")}
            className={`pb-3 px-4 border-b-2 transition ${
              tab === "requests"
                ? "border-emerald-600 text-emerald-600"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Borrow Requests ({pendingRequests.length} Pending)
          </button>
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No borrow requests received yet</h3>
            <p className="text-xs text-slate-500">When students request your items, they will appear here for your approval.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={req.item.image}
                    alt={req.item.title}
                    className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border">
                        {req.status}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{req.item.title}</h3>

                    <p className="text-xs text-slate-600">
                      Requested by: <strong>{req.borrower.name}</strong> ({req.borrower.department})
                    </p>

                    {req.purpose && (
                      <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-xl border border-slate-100">
                        Purpose: &ldquo;{req.purpose}&rdquo;
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()} ({req.totalDays} days)
                      </span>
                      <span>Earn Total: <strong>₹{req.estimatedCost}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Lender Decision Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {req.status === "REQUESTED" && (
                    <>
                      <button
                        onClick={() => handleUpdateRequest(req.id, "REJECT")}
                        className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1 border border-rose-200"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => handleUpdateRequest(req.id, "APPROVE")}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1"
                      >
                        <Check className="w-4 h-4" />
                        <span>Accept Request</span>
                      </button>
                    </>
                  )}

                  {req.status === "APPROVED" && (
                    <button
                      onClick={() => handleUpdateRequest(req.id, "MARK_BORROWED")}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Handed Over & Mark Borrowed</span>
                    </button>
                  )}

                  {(req.status === "RETURN_REQUESTED" || req.status === "BORROWED") && (
                    <button
                      onClick={() => setConfirmReturnReq(req)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Confirm Return Received</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Confirm Return Modal */}
      {confirmReturnReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Confirm Item Return</h3>
            <p className="text-xs text-slate-500">
              Confirm that <strong>{confirmReturnReq.borrower.name}</strong> returned <strong>{confirmReturnReq.item.title}</strong> in good condition.
            </p>

            <form onSubmit={handleConfirmReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Returned Condition</label>
                <select
                  value={conditionStatus}
                  onChange={(e) => setConditionStatus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-bold"
                >
                  <option value="EXCELLENT">Excellent (Mint condition)</option>
                  <option value="GOOD">Good (Normal wear & tear)</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Owner Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter notes (e.g. Checked item and accessories. All good!)"
                  value={ownerNotes}
                  onChange={(e) => setOwnerNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmReturnReq(null)}
                  className="w-1/2 py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={confirmLoading}
                  className="w-1/2 py-2 px-3 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  {confirmLoading ? "Confirming..." : "Confirm & Award Impact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
