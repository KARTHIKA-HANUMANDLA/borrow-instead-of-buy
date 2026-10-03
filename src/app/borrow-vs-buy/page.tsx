"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { BarChart2, DollarSign, TrendingDown, Leaf, Sparkles, HelpCircle } from "lucide-react";

export default function BorrowVsBuyPage() {
  const [itemName, setItemName] = useState("");
  const [purchasePrice, setPurchasePrice] = useState<number | "">(50000);
  const [borrowRate, setBorrowRate] = useState<number | "">(800);
  const [usageDays, setUsageDays] = useState(3);

  const numBuy = typeof purchasePrice === "number" ? purchasePrice : 0;
  const numRate = typeof borrowRate === "number" ? borrowRate : 0;

  const borrowingCost = Math.max(numRate * usageDays, 0);
  const savings = Math.max(numBuy - borrowingCost, 0);
  const savingsPercentage = numBuy > 0 ? Math.round((savings / numBuy) * 100) : 0;
  const estimatedCarbonSaved = (usageDays * 1.5).toFixed(1);

  const presetExamples = [
    { title: "Casio fx-991EX Calculator", buy: 1800, borrow: 30, days: 5 },
    { title: "DBMS Korth Textbook", buy: 950, borrow: 20, days: 7 },
    { title: "Arduino Starter Kit", buy: 3500, borrow: 50, days: 4 },
    { title: "Canon DSLR Camera", buy: 42000, borrow: 350, days: 3 },
    { title: "Raymond Formal Blazer", buy: 6500, borrow: 150, days: 2 },
  ];

  function loadPreset(p: typeof presetExamples[0]) {
    setItemName(p.title);
    setPurchasePrice(p.buy);
    setBorrowRate(p.borrow);
    setUsageDays(p.days);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 rounded-3xl p-8 text-white shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Interactive Financial & Sustainability Calculator
            </span>
          </div>
          <h1 className="text-3xl font-extrabold">&ldquo;Should I Borrow or Buy?&rdquo;</h1>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Compare the total upfront cost of buying an item versus borrowing it on campus for temporary exam or project use.
          </p>
        </div>

        {/* Quick Presets */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Try Common Campus Examples:</span>
          <div className="flex flex-wrap gap-2">
            {presetExamples.map((p, idx) => (
              <button
                key={idx}
                onClick={() => loadPreset(p)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700 text-xs font-bold shadow-xs transition"
              >
                {p.title}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Left Form Inputs */}
          <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">Calculator Inputs</h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Item Description</label>
              <input
                type="text"
                placeholder="Enter item description (e.g. Scientific Calculator)"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Purchase Price (₹)</span>
                <span className="text-slate-900 font-black">₹{numBuy.toLocaleString()}</span>
              </div>
              <input
                type="number"
                min="0"
                placeholder="Enter purchase price"
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Borrowing Cost per Day (₹)</span>
                <span className="text-emerald-700 font-black">₹{numRate}/day</span>
              </div>
              <input
                type="number"
                min="0"
                placeholder="Enter borrowing rate per day"
                value={borrowRate}
                onChange={(e) => setBorrowRate(e.target.value === "" ? "" : parseFloat(e.target.value))}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-black font-semibold placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Expected Usage Duration</span>
                <span className="text-emerald-700 font-black">{usageDays} Days</span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                value={usageDays}
                onChange={(e) => setUsageDays(parseInt(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>
          </div>

          {/* Right Results & Visual Comparison */}
          <div className="md:col-span-6 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl space-y-6">
            <h3 className="text-base font-bold text-slate-900">Cost & Environmental Comparison</h3>

            {/* Visual Bars */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-rose-700">Buying Cost:</span>
                  <span className="text-rose-700">₹{numBuy.toLocaleString()}</span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden p-1 border border-slate-200">
                  <div className="h-full bg-rose-500 rounded-lg w-full"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold mb-1">
                  <span className="text-emerald-700">Borrowing Cost:</span>
                  <span className="text-emerald-700">₹{borrowingCost.toLocaleString()}</span>
                </div>
                <div className="h-6 w-full bg-slate-100 rounded-xl overflow-hidden p-1 border border-slate-200">
                  <div
                    className="h-full bg-emerald-500 rounded-lg transition-all duration-300"
                    style={{ width: `${numBuy > 0 ? Math.max(Math.min((borrowingCost / numBuy) * 100, 100), 5) : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Savings Banner Card */}
            <div className="bg-emerald-950 text-white p-5 rounded-2xl border border-emerald-800 space-y-2">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-widest">
                Estimated Net Savings
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-black text-emerald-400">₹{savings.toLocaleString()}</span>
                <span className="text-xs font-extrabold bg-emerald-800 text-emerald-200 px-3 py-1 rounded-full">
                  Save {savingsPercentage}%
                </span>
              </div>
              <p className="text-[11px] text-slate-300 pt-1">
                You keep <strong>₹{savings.toLocaleString()}</strong> in your wallet by borrowing on campus!
              </p>
            </div>

            {/* Carbon Impact */}
            <div className="bg-teal-50 p-4 rounded-2xl border border-teal-200 flex items-center justify-between text-xs text-teal-900">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-teal-600" />
                <span>Estimated CO₂ Carbon Footprint Avoided:</span>
              </div>
              <span className="font-extrabold text-sm text-teal-700">{estimatedCarbonSaved} kg CO₂e</span>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              Note: This tool provides cost comparison calculations based on user-entered parameters. It is intended for educational and decision-support purposes on campus.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
