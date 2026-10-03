"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  PlusCircle,
  CheckCircle2,
  Tag,
  DollarSign,
  MapPin,
  Clock,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function LendItemPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state - EMPTY initial values
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [condition, setCondition] = useState("GOOD");
  const [isFree, setIsFree] = useState(false);
  const [pricePerDay, setPricePerDay] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [rules, setRules] = useState("");
  const [maxDurationDays, setMaxDurationDays] = useState("7");
  const [image, setImage] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
        if (data.categories?.length > 0) {
          setCategoryId(data.categories[0].id);
        }
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  }

  const presetImages = [
    { title: "DBMS / Textbook", url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800" },
    { title: "Scientific Calculator", url: "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e48b?w=800" },
    { title: "Arduino Starter Kit", url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?w=800" },
    { title: "Raspberry Pi 4", url: "https://images.unsplash.com/photo-1608564697071-ddf911d81370?w=800" },
    { title: "Oscilloscope / Lab", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800" },
    { title: "Canon DSLR Camera", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800" },
    { title: "Formal Blazer", url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800" },
    { title: "Drawing Board", url: "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!title.trim() || !description.trim() || !categoryId || !pickupLocation.trim()) {
      setError("Please complete all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          categoryId,
          condition,
          pricePerDay: isFree ? 0 : pricePerDay || 0,
          securityDeposit: securityDeposit || 0,
          pickupLocation,
          pickupInstructions,
          rules,
          maxDurationDays,
          image: image || presetImages[0].url,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data.error || "Failed to list item");
      }

      router.push("/listings");
    } catch (err: any) {
      setError(err.message || "An error occurred while publishing");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step Indicator Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-8 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Multi-Step Listing Wizard
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">Lend an Item on Campus</h1>
          <p className="text-xs text-slate-300">
            List your unused textbooks, electronics, project gear, or formal clothes. Earn 20 Community Credits!
          </p>

          {/* Steps Progress Bar */}
          <div className="grid grid-cols-7 gap-1 pt-2">
            {[1, 2, 3, 4, 5, 6, 7].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s <= step ? "bg-emerald-400" : "bg-slate-800"
                }`}
              ></div>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-semibold block">Step {step} of 7</span>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-slate-900">Step 1: Item Information</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Item Title *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter item title (e.g. DBMS Reference Book - Korth 7th Edition)"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="text-black bg-white font-medium">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter description, condition details, included accessories, or semester notes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Image Selection */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-slate-900">Step 2: Select Item Image</h3>
              <p className="text-xs text-slate-500">
                Choose a sample photo preset or enter a custom image URL.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {presetImages.map((img, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => setImage(img.url)}
                    className={`p-2 rounded-2xl border text-left transition overflow-hidden ${
                      image === img.url ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500" : "border-slate-200"
                    }`}
                  >
                    <img src={img.url} alt={img.title} className="w-full h-24 object-cover rounded-xl" />
                    <span className="text-[11px] font-bold text-slate-800 block mt-1 truncate">{img.title}</span>
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Or Enter Custom Image URL</label>
                <input
                  type="url"
                  placeholder="Enter image URL (e.g. https://images.unsplash.com/...)"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Condition */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-slate-900">Step 3: Item Condition</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "NEW", label: "Brand New", desc: "Never used, in original box" },
                  { value: "LIKE_NEW", label: "Like New", desc: "Minimal use, no scratches or marks" },
                  { value: "GOOD", label: "Good Condition", desc: "Slightly used, works 100% perfectly" },
                  { value: "FAIR", label: "Fair Condition", desc: "Visible wear, fully functional" },
                ].map((c) => (
                  <button
                    type="button"
                    key={c.value}
                    onClick={() => setCondition(c.value)}
                    className={`p-4 rounded-2xl border text-left transition ${
                      condition === c.value
                        ? "border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500"
                        : "border-slate-200 bg-slate-50 hover:bg-white"
                    }`}
                  >
                    <span className="font-bold text-slate-900 block text-sm">{c.label}</span>
                    <span className="text-xs text-slate-500 block mt-0.5">{c.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Pricing */}
          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-slate-900">Step 4: Pricing & Security Deposit</h3>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <input
                  type="checkbox"
                  id="isFree"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  className="rounded-md text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isFree" className="font-bold text-slate-800 cursor-pointer">
                  Lend for FREE 🎉 (Community Contribution)
                </label>
              </div>

              {!isFree && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Borrow Rate per Day (₹)</label>
                  <input
                    type="number"
                    min="0"
                    max="2000"
                    placeholder="Enter price per day (e.g. 50)"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Refundable Security Deposit (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  placeholder="Enter security deposit (e.g. 500)"
                  value={securityDeposit}
                  onChange={(e) => setSecurityDeposit(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-[11px] text-slate-400 block mt-1">
                  This deposit is held temporarily and returned to borrower upon item return.
                </span>
              </div>
            </div>
          )}

          {/* STEP 5: Availability */}
          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-slate-900">Step 5: Maximum Borrow Duration</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Duration (Days)</label>
                <select
                  value={maxDurationDays}
                  onChange={(e) => setMaxDurationDays(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="3" className="text-black bg-white font-medium">3 Days (Quick Study / Exam)</option>
                  <option value="7" className="text-black bg-white font-medium">7 Days (1 Week standard)</option>
                  <option value="14" className="text-black bg-white font-medium">14 Days (2 Weeks)</option>
                  <option value="30" className="text-black bg-white font-medium">30 Days (Full Semester Prep)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 6: Pickup Info */}
          {step === 6 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-slate-900">Step 6: Campus Pickup Information</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Location *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter campus location (e.g. Hostel Block C Room 204 / Library Desk)"
                  value={pickupLocation}
                  onChange={(e) => setPickupLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pickup Instructions</label>
                <input
                  type="text"
                  placeholder="Enter pickup times or instructions (e.g. Available weekdays after 5 PM)"
                  value={pickupInstructions}
                  onChange={(e) => setPickupInstructions(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          {/* STEP 7: Rules & Preview */}
          {step === 7 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="text-lg font-bold text-slate-900">Step 7: Item Rules & Final Preview</h3>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Borrowing Rules</label>
                <input
                  type="text"
                  placeholder="Enter rules (e.g. Handle with care. Return on time.)"
                  value={rules}
                  onChange={(e) => setRules(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Preview Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live Listing Preview:</span>
                <div className="flex items-center gap-3">
                  <img src={image || presetImages[0].url} alt="Preview" className="w-16 h-16 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{title || "Item Title Preview"}</h4>
                    <span className="text-xs font-bold text-emerald-600">
                      {isFree ? "FREE" : `₹${pricePerDay || 0}/day`} • Deposit ₹{securityDeposit || 0}
                    </span>
                    <p className="text-[11px] text-slate-500 truncate">{pickupLocation || "Campus location"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-100">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs flex items-center gap-1 hover:bg-slate-50 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous Step</span>
              </button>
            ) : (
              <div></div>
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-600/20 transition"
              >
                <span>Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/25 transition"
              >
                {loading ? "Publishing Listing..." : "Publish Item Listing 🎉"}
              </button>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
