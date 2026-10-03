"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(reportId: string, status: string) {
    try {
      const res = await fetch("/api/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportId, status }),
      });
      if (res.ok) fetchReports();
    } catch (err) {
      console.error("Update report status error:", err);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Admin Control</span>
          <h1 className="text-2xl font-extrabold text-slate-900">User & Item Reports Queue</h1>
          <p className="text-xs text-slate-500 mt-1">Investigate user reports for safety, disputes, or policy violations.</p>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-2xl"></div>
            ))}
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
            <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No pending reports!</h3>
            <p className="text-xs text-slate-500">All student reports have been investigated and resolved.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.map((r) => (
              <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-900">
                    Reason: {r.reason}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Reported by: <strong>{r.reporter.name}</strong> ({r.reporter.email})
                  </span>
                </div>

                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100 font-medium">
                  &ldquo;{r.description}&rdquo;
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500">
                    Status: <strong className="uppercase">{r.status}</strong>
                  </span>

                  {r.status === "PENDING" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateStatus(r.id, "RESOLVED")}
                        className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
                      >
                        Mark Resolved
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(r.id, "DISMISSED")}
                        className="px-3 py-1.5 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-300 transition"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
