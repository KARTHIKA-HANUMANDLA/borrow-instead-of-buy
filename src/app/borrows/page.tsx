"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  RotateCcw,
  Star,
  MessageSquare,
  XCircle,
  ShieldCheck,
} from "lucide-react";

export default function MyBorrowsPage() {
  const [requests, setRequests] = useState<any[]>([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [selectedReq, setSelectedReq] = useState<any>(null);
  const [returnNotes, setReturnNotes] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  // Review modal state
  const [reviewReq, setReviewReq] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    fetchBorrows();
  }, [tab]);

  async function fetchBorrows() {
    setLoading(true);
    try {
      const res = await fetch(`/api/borrow-requests?role=borrower&status=${tab}`);
      if (res.ok) {
        const data = await res.json();
        setRequests(data.requests || []);
      }
    } catch (err) {
      console.error("Fetch borrows error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancelRequest(id: string) {
    if (!confirm("Are you sure you want to cancel this borrow request?")) return;
    try {
      const res = await fetch(`/api/borrow-requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" }),
      });
      if (res.ok) fetchBorrows();
    } catch (err) {
      console.error("Cancel error:", err);
    }
  }

  async function handleRequestReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedReq) return;
    setReturnLoading(true);

    try {
      const res = await fetch("/api/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowRequestId: selectedReq.id,
          action: "REQUEST_RETURN",
          borrowerNotes: returnNotes,
        }),
      });
      if (res.ok) {
        setSelectedReq(null);
        setReturnNotes("");
        fetchBorrows();
      }
    } catch (err) {
      console.error("Return request error:", err);
    } finally {
      setReturnLoading(false);
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!reviewReq) return;
    setReviewLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          borrowRequestId: reviewReq.id,
          rating,
          comment,
        }),
      });
      if (res.ok) {
        setReviewReq(null);
        setComment("");
        fetchBorrows();
      }
    } catch (err) {
      console.error("Review error:", err);
    } finally {
      setReviewLoading(false);
    }
  }

  const statusBadgeColor: Record<string, string> = {
    REQUESTED: "bg-amber-100 text-amber-800 border-amber-300",
    APPROVED: "bg-teal-100 text-teal-800 border-teal-300",
    BORROWED: "bg-emerald-100 text-emerald-800 border-emerald-300",
    RETURN_REQUESTED: "bg-purple-100 text-purple-800 border-purple-300",
    RETURNED: "bg-blue-100 text-blue-800 border-blue-300",
    REJECTED: "bg-rose-100 text-rose-800 border-rose-300",
    CANCELLED: "bg-slate-100 text-slate-600 border-slate-300",
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Borrower Dashboard</span>
            <h1 className="text-3xl font-extrabold text-slate-900">My Borrows</h1>
            <p className="text-xs text-slate-500 mt-1">Manage active borrowings, return requests, and reviews.</p>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
            {["all", "requested", "active", "due_soon", "returned"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-3 py-1.5 rounded-xl capitalize transition ${
                  tab === t ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {t.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Borrows List */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <Package className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No borrowing records found</h3>
            <p className="text-xs text-slate-500">You don&apos;t have any requests under this tab.</p>
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
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${statusBadgeColor[req.status] || "bg-slate-100 text-slate-800"}`}>
                        {req.status}
                      </span>
                      <span className="text-xs text-slate-400">ID: #{req.id.substring(0, 8)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{req.item.title}</h3>

                    <p className="text-xs text-slate-600">
                      Owner: <strong>{req.owner.name}</strong> ({req.owner.department})
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1 font-semibold text-emerald-700">
                        <Clock className="w-3.5 h-3.5" />
                        {new Date(req.startDate).toLocaleDateString()} → {new Date(req.endDate).toLocaleDateString()} ({req.totalDays} days)
                      </span>
                      <span>Estimated Cost: <strong>₹{req.estimatedCost}</strong></span>
                      <span>Deposit: <strong>₹{req.securityDeposit}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {req.status === "REQUESTED" && (
                    <button
                      onClick={() => handleCancelRequest(req.id)}
                      className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4 text-rose-500" />
                      <span>Cancel Request</span>
                    </button>
                  )}

                  {(req.status === "BORROWED" || req.status === "APPROVED") && (
                    <button
                      onClick={() => setSelectedReq(req)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center gap-1"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Request Item Return</span>
                    </button>
                  )}

                  {req.status === "RETURNED" && req.reviews.length === 0 && (
                    <button
                      onClick={() => setReviewReq(req)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1"
                    >
                      <Star className="w-4 h-4 fill-white" />
                      <span>Rate & Review Owner</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Return Request Modal */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Request Item Return</h3>
            <p className="text-xs text-slate-500">
              Submit your return request for <strong>{selectedReq.item.title}</strong>. The owner will inspect and confirm.
            </p>

            <form onSubmit={handleRequestReturn} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Return Condition Notes</label>
                <textarea
                  rows={3}
                  placeholder="Enter condition notes (e.g. Returned in mint condition with all cords packed)"
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedReq(null)}
                  className="w-1/2 py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnLoading}
                  className="w-1/2 py-2 px-3 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  {returnLoading ? "Submitting..." : "Submit Return"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Leave a Review</h3>
            <p className="text-xs text-slate-500">
              Rate your experience borrowing from <strong>{reviewReq.owner.name}</strong>.
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Star Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setRating(s)}
                      className="p-1 hover:scale-125 transition"
                    >
                      <Star className={`w-6 h-6 ${s <= rating ? "fill-amber-500 text-amber-500" : "text-slate-300"}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Written Review</label>
                <textarea
                  rows={3}
                  placeholder="Enter review (e.g. Great owner! Item was super clean and pickup was hassle free)"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setReviewReq(null)}
                  className="w-1/2 py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewLoading}
                  className="w-1/2 py-2 px-3 rounded-xl bg-amber-500 text-white font-bold text-xs"
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
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
