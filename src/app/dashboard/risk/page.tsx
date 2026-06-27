"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, ShieldCheck, Info, RefreshCw, BarChart3, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";

const riskBreakdown = [
  { name: "TCS", Volatility: 12.4, Beta: 0.85, VaR: 2.1 },
  { name: "Infosys", Volatility: 14.2, Beta: 0.95, VaR: 2.8 },
  { name: "Reliance", Volatility: 10.8, Beta: 0.72, VaR: 1.5 },
  { name: "Gold ETF", Volatility: 4.5, Beta: -0.12, VaR: 0.5 },
  { name: "Nifty ETF", Volatility: 8.8, Beta: 1.00, VaR: 1.2 },
];

export default function RiskCenterPage() {
  const [mounted, setMounted] = useState(false);
  const [stressFactor, setStressFactor] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">Risk Center</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">Multi-factor risk analysis and covariance monitoring.</p>
        </div>
        <button className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-white border border-slate-200 text-slate-700 px-4 text-[13px] font-bold shadow-soft hover:bg-slate-50">
          <RefreshCw className="h-4 w-4" />
          <span>Recalculate Covariance</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Value at Risk (VaR)</p>
          <h3 className="text-xl font-extrabold text-slate-800 mt-1.5">₹64,200</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">99% Confidence (1-Day)</p>
        </div>
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Systemic Beta</p>
          <h3 className="text-xl font-extrabold text-slate-800 mt-1.5">0.62</h3>
          <p className="text-[10px] text-[#0E8A5A] font-bold mt-1">Low Correlation Index</p>
        </div>
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sortino Ratio</p>
          <h3 className="text-xl font-extrabold text-[#0E8A5A] mt-1.5">1.82</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Downside Deviation Optimized</p>
        </div>
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Score</p>
          <h3 className="text-xl font-extrabold text-[#0E8A5A] mt-1.5">Optimal</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Moderate Risk Mandate</p>
        </div>
      </div>

      {/* Chart: Asset Risk Contribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft">
          <h3 className="text-[15px] font-extrabold text-[#0F172A] mb-4">Volatility & Beta Contribution</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskBreakdown} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }} itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Volatility" fill="#94a3b8" name="Volatility (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Beta" fill="#0E8A5A" name="Systemic Beta" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stress Testing Enclave (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="text-[15px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <AlertTriangle className="h-4.5 w-4.5 text-[#0E8A5A]" /> Stress Testing Enclave
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">Simulate market shock conditions to test covariance bounds.</p>
          </div>

          <div className="space-y-4 my-6">
            <div className="space-y-1.5">
              <div className="flex justify-between text-[11px] font-bold">
                <span className="text-slate-500">Market Drawdown Shock</span>
                <span className="text-[#0E8A5A]">{stressFactor}% shock</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                value={stressFactor}
                onChange={(e) => setStressFactor(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0E8A5A]"
              />
            </div>

            <div className="space-y-2 text-[11px] font-semibold text-slate-600 leading-normal bg-slate-50 p-3.5 border border-slate-100 rounded-xl">
              <div className="flex justify-between">
                <span>Volatility Shift:</span>
                <span>+{ (stressFactor * 0.45).toFixed(2) }%</span>
              </div>
              <div className="flex justify-between">
                <span>Est. VaR Increase:</span>
                <span>+₹{ (stressFactor * 4200).toLocaleString() }</span>
              </div>
              <div className="flex justify-between">
                <span>Frontier Threshold:</span>
                <span className={stressFactor > 15 ? "text-red-500 font-bold" : "text-[#0E8A5A] font-bold"}>
                  {stressFactor > 15 ? "Mandate Breached" : "Safe Bounds"}
                </span>
              </div>
            </div>
          </div>

          <button className="w-full flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white font-bold text-[13px] hover:bg-[#0c784e]">
            <span>Save Stress Thresholds</span>
          </button>
        </div>
      </div>
    </div>
  );
}
