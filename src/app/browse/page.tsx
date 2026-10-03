"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ItemCard from "@/components/items/ItemCard";
import { Search, Filter, SlidersHorizontal, Tag, RefreshCw, X, AlertCircle } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { items: number };
}

export default function BrowsePage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCondition, setSelectedCondition] = useState("all");
  const [priceType, setPriceType] = useState<"all" | "free" | "paid">("all");
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  const [minRating, setMinRating] = useState<number>(0);
  const [sort, setSort] = useState("recent");

  // Mobile sidebar filter toggle
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchItems();
  }, [search, selectedCategory, selectedCondition, priceType, maxPrice, minRating, sort]);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  }

  async function fetchItems() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedCategory !== "all") params.set("category", selectedCategory);
      if (selectedCondition !== "all") params.set("condition", selectedCondition);
      if (priceType === "free") params.set("free", "true");
      if (priceType === "paid") params.set("maxPrice", maxPrice.toString());
      if (minRating > 0) params.set("minRating", minRating.toString());
      params.set("sort", sort);

      const res = await fetch(`/api/items?${params.toString()}`);
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

  function resetFilters() {
    setSearch("");
    setSelectedCategory("all");
    setSelectedCondition("all");
    setPriceType("all");
    setMaxPrice(1000);
    setMinRating(0);
    setSort("recent");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Top Title & Search Banner */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Campus Marketplace
              </span>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Browse Campus Items</h1>
              <p className="text-xs text-slate-500 mt-1">
                Search & borrow textbooks, calculators, laptops, lab gear, and formal blazers from fellow students.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
                className="lg:hidden px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-2 transition"
              >
                <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                <span>Filters</span>
              </button>

              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-black focus:outline-hidden"
              >
                <option value="recent" className="text-black bg-white">Sort: Recently Added</option>
                <option value="rating" className="text-black bg-white">Sort: Highest Rated</option>
                <option value="most-borrowed" className="text-black bg-white">Sort: Most Borrowed</option>
                <option value="price-low" className="text-black bg-white">Sort: Price Low → High</option>
                <option value="price-high" className="text-black bg-white">Sort: Price High → Low</option>
              </select>
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search items, keywords, model numbers, or campus pickup locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-2xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Layout (Sidebar + Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Sidebar Filter Panel */}
          <aside
            className={`bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6 lg:block ${
              filterDrawerOpen ? "block" : "hidden"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Filter Items</h3>
              </div>
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-black focus:outline-hidden"
              >
                <option value="all" className="text-black bg-white">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.slug} className="text-black bg-white font-medium">
                    {c.name} ({c._count?.items || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Price Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Pricing Option</label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setPriceType("all")}
                  className={`py-1.5 rounded-lg transition ${
                    priceType === "all" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500"
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setPriceType("free")}
                  className={`py-1.5 rounded-lg transition ${
                    priceType === "free" ? "bg-emerald-600 text-white shadow-xs font-black" : "text-slate-500"
                  }`}
                >
                  Free 🎉
                </button>
                <button
                  onClick={() => setPriceType("paid")}
                  className={`py-1.5 rounded-lg transition ${
                    priceType === "paid" ? "bg-white text-slate-900 shadow-xs font-black" : "text-slate-500"
                  }`}
                >
                  Paid
                </button>
              </div>
            </div>

            {priceType === "paid" && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Max Price/Day:</span>
                  <span className="text-emerald-700">₹{maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="1000"
                  step="20"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                  className="w-full accent-emerald-600"
                />
              </div>
            )}

            {/* Condition Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Item Condition</label>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-black focus:outline-hidden"
              >
                <option value="all" className="text-black bg-white">Any Condition</option>
                <option value="NEW" className="text-black bg-white">Brand New</option>
                <option value="LIKE_NEW" className="text-black bg-white">Like New</option>
                <option value="GOOD" className="text-black bg-white">Good Condition</option>
                <option value="FAIR" className="text-black bg-white">Fair Condition</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">Minimum Rating</label>
              <div className="flex items-center gap-2">
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button
                    key={r}
                    onClick={() => setMinRating(r)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                      minRating === r
                        ? "bg-amber-100 border-amber-300 text-amber-900"
                        : "bg-slate-50 border-slate-200 text-slate-600"
                    }`}
                  >
                    {r === 0 ? "All" : `${r}★+`}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Right Items Grid */}
          <div className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 rounded-2xl bg-slate-200 animate-pulse"></div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
                <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900">No items match your search</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try adjusting your search keywords, category filters, or price range.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-block px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
