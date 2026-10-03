"use client";

import { useState } from "react";
import { UserCheck, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

interface DemoBannerProps {
  currentUser?: {
    name: string;
    email: string;
    role: string;
  } | null;
  onRefresh?: () => void;
}

export default function DemoBanner({ currentUser, onRefresh }: DemoBannerProps) {
  const [loading, setLoading] = useState(false);

  async function loginDemo(role: "STUDENT" | "ADMIN") {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        if (onRefresh) onRefresh();
        window.location.reload();
      }
    } catch (err) {
      console.error("Demo login error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 shadow-inner border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 font-medium">
        <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
        <span className="text-emerald-400 font-semibold uppercase tracking-wider">Campus Demo Mode:</span>
        <span className="hidden md:inline text-slate-300">
          Switch roles instantly to test student & admin workflows
        </span>
      </div>

      <div className="flex items-center gap-3">
        {currentUser ? (
          <div className="flex items-center gap-2 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Logged in as: <strong>{currentUser.name}</strong> ({currentUser.role})</span>
          </div>
        ) : (
          <span className="text-slate-400 hidden sm:inline">Try preset accounts:</span>
        )}

        <button
          onClick={() => loginDemo("STUDENT")}
          disabled={loading}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-md transition font-medium text-xs shadow"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Student Demo</span>
        </button>

        <button
          onClick={() => loginDemo("ADMIN")}
          disabled={loading}
          className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded-md transition font-medium text-xs shadow"
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Admin Demo</span>
        </button>
      </div>
    </div>
  );
}
