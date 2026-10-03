"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AvailabilityCalendar from "@/components/items/AvailabilityCalendar";
import BorrowModal from "@/components/modals/BorrowModal";
import {
  Star,
  Heart,
  MapPin,
  ShieldCheck,
  Tag,
  Clock,
  MessageSquare,
  AlertCircle,
  Share2,
  Calendar as CalendarIcon,
  BookOpen,
  User,
  ArrowLeft,
  CheckCircle,
} from "lucide-react";

export default function ItemDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isFav, setIsFav] = useState(false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);

  useEffect(() => {
    fetchItemDetails();
  }, [id]);

  async function fetchItemDetails() {
    setLoading(true);
    try {
      const res = await fetch(`/api/items/${id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data.item);
        setIsFav(data.item.isFavorited || false);
      } else {
        setError("Item not found");
      }
    } catch (err) {
      setError("Failed to load item details");
    } finally {
      setLoading(false);
    }
  }

  async function toggleFavorite() {
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFav(data.isFavorited);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    }
  }

  function startChat() {
    if (item?.owner?.id) {
      router.push(`/messages?recipientId=${item.owner.id}&itemId=${item.id}`);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        <Navbar />
        <main className="max-w-5xl mx-auto w-full p-8">
          <div className="h-96 bg-slate-200 animate-pulse rounded-3xl"></div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
        <Navbar />
        <main className="max-w-md mx-auto w-full p-8 text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Item Not Found</h2>
          <p className="text-xs text-slate-500">The listing you requested may have been removed or is unavailable.</p>
          <Link
            href="/browse"
            className="inline-block px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
          >
            Back to Marketplace
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/browse"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace Browse</span>
        </Link>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Image Gallery & Details */}
          <div className="lg:col-span-7 space-y-6">
            {/* Image Container */}
            <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs relative">
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-96 object-cover bg-slate-100"
              />

              <button
                onClick={toggleFavorite}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-md transition"
              >
                <Heart className={`w-5 h-5 ${isFav ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            </div>

            {/* Item Info Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  {item.category.name}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                  Condition: {item.condition}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">{item.title}</h1>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Description</h3>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Pickup & Rules */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    Pickup Location
                  </span>
                  <p className="text-slate-600">{item.pickupLocation}</p>
                  {item.pickupInstructions && (
                    <p className="text-[11px] text-slate-500 pt-1 italic">{item.pickupInstructions}</p>
                  )}
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1">
                  <span className="font-bold text-slate-800 block flex items-center gap-1">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    Rules & Duration
                  </span>
                  <p className="text-slate-600">Max Duration: {item.maxDurationDays} Days</p>
                  {item.rules && <p className="text-[11px] text-slate-500 pt-1">{item.rules}</p>}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">Student Reviews ({item.reviews.length})</h3>
                <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-amber-900">{item.rating || 5.0} / 5.0</span>
                </div>
              </div>

              {item.reviews.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No reviews written for this item yet.</p>
              ) : (
                <div className="space-y-3">
                  {item.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img
                            src={rev.reviewer.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${rev.reviewer.name}`}
                            alt={rev.reviewer.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-bold text-slate-800">{rev.reviewer.name}</span>
                        </div>
                        <div className="flex items-center text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      {rev.comment && <p className="text-xs text-slate-600">{rev.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Pricing, Owner Profile, Action Box, Calendar */}
          <div className="lg:col-span-5 space-y-6">
            {/* Pricing & Borrow Action Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-xs text-slate-500 font-semibold block">Borrowing Rate</span>
                  {item.pricePerDay === 0 ? (
                    <span className="text-2xl font-black text-emerald-600">FREE BORROW 🎉</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">₹{item.pricePerDay}</span>
                      <span className="text-xs text-slate-500 font-semibold">/ day</span>
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Security Deposit</span>
                  <span className="text-sm font-bold text-slate-700">₹{item.securityDeposit} (Refundable)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={() => setBorrowModalOpen(true)}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-2"
                >
                  <CalendarIcon className="w-5 h-5" />
                  <span>Request to Borrow Item</span>
                </button>

                <button
                  onClick={startChat}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>Message Owner ({item.owner.name})</span>
                </button>
              </div>
            </div>

            {/* Owner Trust Profile Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <span className="text-xs font-bold uppercase text-slate-400 block">Listed By</span>
              <div className="flex items-center gap-3">
                <img
                  src={item.owner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.owner.name}`}
                  alt={item.owner.name}
                  className="w-12 h-12 rounded-2xl object-cover bg-slate-100 border border-slate-200"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-bold text-slate-900">{item.owner.name}</h4>
                    {item.owner.isVerified && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.owner.department} • {item.owner.year}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-amber-600 font-bold mt-0.5">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{item.owner.rating || 5.0} Owner Rating</span>
                  </div>
                </div>
              </div>

              {item.owner.bio && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                  &ldquo;{item.owner.bio}&rdquo;
                </p>
              )}
            </div>

            {/* Availability Calendar */}
            <AvailabilityCalendar bookedRanges={item.borrowRequests} />
          </div>
        </div>
      </main>

      {/* Borrow Request Modal */}
      {borrowModalOpen && (
        <BorrowModal item={item} isOpen={borrowModalOpen} onClose={() => setBorrowModalOpen(false)} />
      )}

      <Footer />
    </div>
  );
}
