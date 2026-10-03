"use client";

import { useState } from "react";
import { X, Calendar, Clock, DollarSign, ShieldCheck, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface Item {
  id: string;
  title: string;
  pricePerDay: number;
  securityDeposit: number;
  maxDurationDays?: number;
  owner: {
    name: string;
    department: string;
  };
}

interface BorrowModalProps {
  item: Item;
  isOpen: boolean;
  onClose: () => void;
}

export default function BorrowModal({ item, isOpen, onClose }: BorrowModalProps) {
  const router = useRouter();
  const todayStr = new Date().toISOString().split("T")[0];
  const defaultEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(defaultEnd);

  // EMPTY initial purpose and message
  const [purpose, setPurpose] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Calculate days & total
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end.getTime() - start.getTime();
  const totalDays = diffTime > 0 ? Math.ceil(diffTime / (1000 * 60 * 60 * 24)) : 0;
  const estimatedCost = totalDays * item.pricePerDay;
  const maxDays = item.maxDurationDays || 7;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (totalDays <= 0) {
      setError("Return date must be at least 1 day after start date.");
      return;
    }

    if (totalDays > maxDays) {
      setError(`Maximum borrow duration for this item is ${maxDays} days.`);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/borrow-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          startDate,
          endDate,
          purpose,
          message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to submit borrow request");
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.push("/borrows");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 px-6 py-4 text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
              Send Borrow Request
            </span>
            <h3 className="text-lg font-bold truncate max-w-xs">{item.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success ? (
            <div className="text-center py-8 space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h4 className="text-xl font-bold text-slate-900">Request Sent Successfully!</h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                {item.owner.name} has been notified. Redirecting to your borrows dashboard...
              </p>
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Owner Info Bar */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <span className="text-slate-500 block">Item Owner:</span>
                  <span className="font-bold text-slate-800">{item.owner.name} ({item.owner.department})</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Max Duration:</span>
                  <span className="font-semibold text-emerald-700">{maxDays} Days</span>
                </div>
              </div>

              {/* Date Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      min={todayStr}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Return Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      min={startDate || todayStr}
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Cost Calculation Summary */}
              <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/80 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Borrow Duration:</span>
                  <span className="font-bold text-emerald-800">{totalDays} Day(s)</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Daily Rate:</span>
                  <span className="font-bold">{item.pricePerDay === 0 ? "FREE" : `₹${item.pricePerDay}/day`}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-bold text-slate-800">₹{item.securityDeposit}</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-sm font-extrabold text-emerald-950">
                  <span>Estimated Total Cost:</span>
                  <span className="text-emerald-700 text-base">₹{estimatedCost}</span>
                </div>
              </div>

              {/* Purpose & Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Purpose / Exam / Project Use
                </label>
                <input
                  type="text"
                  placeholder="Enter purpose (e.g. Preparing for DBMS mid-sem test / Lab project)"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message to Owner (Pickup time preference, etc.)
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter message to owner (e.g. Can I collect at 5 PM outside central library?)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-slate-300 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || totalDays <= 0}
                  className="w-2/3 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
                >
                  {loading ? "Sending Request..." : "Send Borrow Request"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
