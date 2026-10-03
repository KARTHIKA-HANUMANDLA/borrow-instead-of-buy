"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Users, ShieldCheck, ShieldAlert, Check, X, Search } from "lucide-react";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  }

  async function toggleVerification(userId: string, currentVerified: boolean) {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isVerified: !currentVerified }),
      });
      if (res.ok) fetchUsers();
    } catch (err) {
      console.error("Toggle verification error:", err);
    }
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.studentId.toLowerCase().includes(search.toLowerCase()) ||
      u.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Admin Control</span>
            <h1 className="text-2xl font-extrabold text-slate-900">Student Account Verification</h1>
            <p className="text-xs text-slate-500 mt-1">Verify student IDs, manage permissions, and enforce campus safety.</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search student or Roll ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll ID & Dept</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Rating</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                        className="w-9 h-9 rounded-full object-cover bg-slate-100"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block">{u.name}</span>
                        <span className="text-[11px] text-slate-400">{u.email}</span>
                      </div>
                    </td>

                    <td className="p-4 font-medium">
                      <span className="font-bold text-slate-800 block">{u.studentId}</span>
                      <span className="text-[11px] text-slate-500">{u.department}</span>
                    </td>

                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${u.role === "ADMIN" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Unverified
                        </span>
                      )}
                    </td>

                    <td className="p-4 font-bold text-slate-900">
                      {u.rating || 5.0} ★ ({u.ratingCount})
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => toggleVerification(u.id, u.isVerified)}
                        className={`px-3 py-1.5 rounded-xl font-bold text-xs transition ${
                          u.isVerified
                            ? "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                            : "bg-emerald-600 text-white hover:bg-emerald-700"
                        }`}
                      >
                        {u.isVerified ? "Revoke Verification" : "Verify Student ID"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
