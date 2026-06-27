"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sliders, ArrowRight, ShieldCheck, TrendingUp, HelpCircle, Layers, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function InvestmentProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Form states
  const [capital, setCapital] = useState(1000000);
  const [riskAppetite, setRiskAppetite] = useState("Moderate");
  const [horizon, setHorizon] = useState("5 Years");
  const [goal, setGoal] = useState("Long-Term Wealth");
  const [excludedSectors, setExcludedSectors] = useState<string[]>([]);
  const [sectors, setSectors] = useState(["Technology", "Financials", "Energy", "Commodities", "Real Estate", "Healthcare"]);
  const [customSectorInput, setCustomSectorInput] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleSector = (sector: string) => {
    if (excludedSectors.includes(sector)) {
      setExcludedSectors(excludedSectors.filter((s) => s !== sector));
    } else {
      setExcludedSectors([...excludedSectors, sector]);
    }
  };

  const handleAddCustomSector = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customSectorInput.trim();
    if (!trimmed) return;

    const formattedSector = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    if (!sectors.includes(formattedSector)) {
      setSectors([...sectors, formattedSector]);
    }

    if (!excludedSectors.includes(formattedSector)) {
      setExcludedSectors([...excludedSectors, formattedSector]);
    }

    setCustomSectorInput("");
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
      style: "currency",
      currency: "INR",
    }).format(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const profile = {
      capital: formatCurrency(capital).replace("₹", "").trim(),
      riskAppetite,
      horizon,
      goal,
      excludedSectors,
    };
    localStorage.setItem("user_onboarding_profile", JSON.stringify(profile));
    router.push("/onboarding/analysis");
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] flex flex-col lg:flex-row">
      {/* Onboarding Sidebar Progress Panel */}
      <div className="lg:w-80 bg-[#0F172A] text-white p-8 lg:p-12 flex flex-col justify-between shrink-0 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        <div className="absolute -top-40 -left-40 h-80 w-80 rounded-full bg-[#0E8A5A]/15 blur-3xl pointer-events-none" />

        <div className="space-y-12 relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#0E8A5A] text-white shadow-soft">
              <TrendingUp className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Apex <span className="font-semibold text-[#0E8A5A]">Intelligence</span>
            </span>
          </div>

          {/* Stepper Progress */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-[#0E8A5A] text-white flex items-center justify-center text-[13px] font-bold shrink-0">
                1
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-white leading-tight">Investment Profile</h4>
                <p className="text-[11px] text-[#0E8A5A] font-semibold mt-1">Configure your quant preferences</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 flex items-center justify-center text-[13px] font-bold shrink-0">
                2
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-400 leading-tight">AI Quant Analysis</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Wait for pipeline generation</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-800 text-slate-400 border border-slate-700/60 flex items-center justify-center text-[13px] font-bold shrink-0">
                3
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-slate-400 leading-tight">Ready for Trade</h4>
                <p className="text-[11px] text-slate-500 font-medium mt-1">Access secure dashboard</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tagline */}
        <div className="space-y-4 pt-12 relative z-10 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-[12px] font-bold text-slate-400 uppercase tracking-wider">
            <ShieldCheck className="h-4.5 w-4.5 text-[#0E8A5A]" /> SECURE SANDBOX PIPELINE
          </div>
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
            All configuration constraints will be compiled into the Markowitz optimization solver and the active risk boundary controls.
          </p>
        </div>
      </div>

      {/* Main Content Area: Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 py-16">
        <div className="max-w-[560px] w-full mx-auto space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E8A5A]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0E8A5A] mb-4">
              <Sliders className="h-3.5 w-3.5" /> Step 1: Open Quantitative Desk
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] leading-tight">
              Create Your Investment Profile
            </h1>
            <p className="text-[14px] font-semibold text-slate-400 mt-2 leading-relaxed">
              We compile your mandate settings dynamically into our machine learning forecasting engines and portfolio frontier optimizer.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Capital Mandate Slider & Input */}
            <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  Capital Allocation Mandate
                </label>
                <span className="text-[16px] font-black text-[#0E8A5A] bg-[#0E8A5A]/5 px-3 py-1 rounded-xl border border-[#0E8A5A]/10">
                  {formatCurrency(capital)}
                </span>
              </div>
              <input
                type="range"
                min="100000"
                max="10000000"
                step="50000"
                value={capital}
                onChange={(e) => setCapital(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#0E8A5A] focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-bold text-slate-400">
                <span>₹1 Lakh</span>
                <span>₹50 Lakhs</span>
                <span>₹1 Crore</span>
              </div>
            </div>

            {/* Risk Appetite Grid */}
            <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-3.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                Target Risk Tolerance
              </label>
              <div className="grid grid-cols-3 gap-3">
                {["Conservative", "Moderate", "Aggressive"].map((risk) => (
                  <button
                    key={risk}
                    type="button"
                    onClick={() => setRiskAppetite(risk)}
                    className={`py-3 rounded-[14px] border text-[13px] font-bold text-center transition-all ${
                      riskAppetite === risk
                        ? "border-[#0E8A5A] bg-[#0E8A5A]/5 text-[#0E8A5A] shadow-soft"
                        : "border-slate-200/60 bg-[#F7F9FC]/40 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {risk}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid for Horizon and Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Horizon Target
                </label>
                <select
                  value={horizon}
                  onChange={(e) => setHorizon(e.target.value)}
                  className="w-full bg-[#F7F9FC]/50 border border-slate-200/80 rounded-[14px] px-3.5 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none"
                >
                  <option value="1 Year">1 Year</option>
                  <option value="3 Years">3 Years</option>
                  <option value="5 Years">5 Years</option>
                  <option value="10 Years">10 Years</option>
                </select>
              </div>

              <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Objective Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full bg-[#F7F9FC]/50 border border-slate-200/80 rounded-[14px] px-3.5 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none"
                >
                  <option value="Capital Preservation">Capital Preservation</option>
                  <option value="Balanced Growth">Balanced Growth</option>
                  <option value="Long-Term Wealth">Long-Term Wealth</option>
                </select>
              </div>
            </div>

            {/* Sector Exclusions Chips */}
            <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  Excluded Sectors (Hedges / Restrictions)
                </label>
                <p className="text-[10px] text-slate-400 font-semibold leading-normal">
                  Sectors selected here will be excluded from the optimizer's allocation algorithm.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sectors.map((sector) => {
                  const isExcluded = excludedSectors.includes(sector);
                  return (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => toggleSector(sector)}
                      className={`h-9 px-4 rounded-full text-[11px] font-bold border transition-colors flex items-center gap-1.5 ${
                        isExcluded
                          ? "bg-red-50 text-red-600 border-red-200"
                          : "bg-slate-50 text-slate-600 border-slate-200/60 hover:bg-slate-100/50"
                      }`}
                    >
                      {sector} {isExcluded && <span>✕</span>}
                    </button>
                  );
                })}
              </div>

              {/* Custom Sector Input */}
              <div className="flex gap-2 items-center pt-2">
                <input
                  type="text"
                  placeholder="Type a custom sector if not listed..."
                  value={customSectorInput}
                  onChange={(e) => setCustomSectorInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddCustomSector(e);
                    }
                  }}
                  className="flex-1 bg-slate-50 border border-slate-200/60 rounded-[12px] px-3.5 py-2 text-[12px] font-semibold focus:outline-none focus:border-[#0E8A5A] transition-colors"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSector}
                  className="h-9 px-4 rounded-[12px] bg-[#0E8A5A] hover:bg-[#0c784e] text-white text-[12px] font-bold transition-all shrink-0 shadow-soft"
                >
                  + Add Exclusion
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full flex h-13 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white font-bold text-[14px] shadow-soft hover:bg-[#0c784e] transition-all hover:shadow-premium hover:-translate-y-0.5 active:translate-y-0 duration-200"
            >
              <span>Build Portfolio & Analyze</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
