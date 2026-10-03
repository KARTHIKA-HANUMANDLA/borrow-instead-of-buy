"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, Heart, MapPin, ShieldCheck, Tag, Clock, ArrowRight } from "lucide-react";
import BorrowModal from "@/components/modals/BorrowModal";

export interface ItemCardData {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  securityDeposit: number;
  condition: string;
  pickupLocation: string;
  image: string;
  rating: number;
  borrowsCount?: number;
  isFavorited?: boolean;
  category: {
    name: string;
    slug: string;
  };
  owner: {
    id: string;
    name: string;
    avatar?: string | null;
    department: string;
    year?: string;
    rating: number;
    isVerified: boolean;
  };
}

interface ItemCardProps {
  item: ItemCardData;
  onFavoriteToggle?: (itemId: string, newStatus: boolean) => void;
}

export default function ItemCard({ item, onFavoriteToggle }: ItemCardProps) {
  const [isFav, setIsFav] = useState(item.isFavorited || false);
  const [borrowModalOpen, setBorrowModalOpen] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  async function handleFavClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoadingFav(true);
    try {
      const res = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId: item.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsFav(data.isFavorited);
        if (onFavoriteToggle) onFavoriteToggle(item.id, data.isFavorited);
      }
    } catch (err) {
      console.error("Favorite toggle error:", err);
    } finally {
      setLoadingFav(false);
    }
  }

  const conditionColorMap: Record<string, string> = {
    NEW: "bg-emerald-100 text-emerald-800 border-emerald-300",
    LIKE_NEW: "bg-teal-100 text-teal-800 border-teal-300",
    GOOD: "bg-blue-100 text-blue-800 border-blue-300",
    FAIR: "bg-amber-100 text-amber-800 border-amber-300",
  };

  const conditionTextMap: Record<string, string> = {
    NEW: "Brand New",
    LIKE_NEW: "Like New",
    GOOD: "Good Condition",
    FAIR: "Fair Condition",
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col overflow-hidden relative">
        {/* Favorite Heart Button */}
        <button
          onClick={handleFavClick}
          disabled={loadingFav}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-slate-400 hover:text-rose-500 shadow-md transition-all hover:scale-110"
          title={isFav ? "Remove from wishlist" : "Save to wishlist"}
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              isFav ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"
            }`}
          />
        </button>

        {/* Condition Badge */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border shadow-xs ${
              conditionColorMap[item.condition] || "bg-slate-100 text-slate-800"
            }`}
          >
            {conditionTextMap[item.condition] || item.condition}
          </span>
        </div>

        {/* Image Box */}
        <Link href={`/items/${item.id}`} className="relative h-48 w-full overflow-hidden bg-slate-100">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent opacity-60"></div>

          {/* Pricing tag overlay */}
          <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-700/80 shadow-md">
            {item.pricePerDay === 0 ? (
              <span className="text-emerald-400 font-extrabold text-sm uppercase tracking-wide">
                Free Borrow 🎉
              </span>
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-white font-extrabold text-sm">₹{item.pricePerDay}</span>
                <span className="text-slate-300 text-[11px]">/ day</span>
              </div>
            )}
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Tag className="w-3 h-3" />
                {item.category.name}
              </span>
              {item.borrowsCount !== undefined && item.borrowsCount > 0 && (
                <span className="flex items-center gap-1 text-slate-500 font-medium">
                  <Clock className="w-3 h-3" />
                  {item.borrowsCount} borrows
                </span>
              )}
            </div>

            <Link
              href={`/items/${item.id}`}
              className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition line-clamp-1 block leading-snug"
            >
              {item.title}
            </Link>

            <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Location & Deposit */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="truncate">{item.pickupLocation}</span>
            </div>

            {item.securityDeposit > 0 && (
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Security Deposit:</span>
                <span className="font-semibold text-slate-700">₹{item.securityDeposit} (refundable)</span>
              </div>
            )}
          </div>

          {/* Owner Info Bar */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <img
                src={item.owner.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.owner.name}`}
                alt={item.owner.name}
                className="w-7 h-7 rounded-full object-cover bg-slate-100 shrink-0 border border-slate-200"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-800 truncate block">
                    {item.owner.name}
                  </span>
                  {item.owner.isVerified && (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  )}
                </div>
                <span className="text-[10px] text-slate-400 block truncate">
                  {item.owner.department}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200/60 shrink-0">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-800">{item.owner.rating || 5.0}</span>
            </div>
          </div>

          {/* Borrow Primary Action Button */}
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => setBorrowModalOpen(true)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs py-2.5 px-3 rounded-xl transition-colors shadow-xs shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <span>Request to Borrow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Borrow Modal */}
      {borrowModalOpen && (
        <BorrowModal item={item} isOpen={borrowModalOpen} onClose={() => setBorrowModalOpen(false)} />
      )}
    </>
  );
}
