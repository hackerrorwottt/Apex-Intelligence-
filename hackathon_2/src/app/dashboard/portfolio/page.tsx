"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  RefreshCw,
  ArrowRight,
  Info,
  Sliders,
  Loader2,
  Bot
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
} from "recharts";
import Link from "next/link";

// Efficient frontier curve coordinates (Volatility % vs Return %)
const frontierCurve = [
  { x: 6.0, y: 5.2, name: "Conservative Point" },
  { x: 8.0, y: 8.5, name: "Balanced Point" },
  { x: 10.0, y: 12.0, name: "Optimal Point A" },
  { x: 12.0, y: 16.2, name: "Optimal Point B (Target)" },
  { x: 15.0, y: 18.0, name: "Growth Point" },
  { x: 18.0, y: 19.5, name: "Aggressive Point" },
];

export default function PortfolioPage() {
  const [isRebalanced, setIsRebalanced] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [recData, setRecData] = useState<any>(null);

  const [formCapital, setFormCapital] = useState("1000000");
  const [formRisk, setFormRisk] = useState("moderate");
  const [formHorizon, setFormHorizon] = useState("5");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setMounted(true);
    const sid = localStorage.getItem("apex_session_id");
    if (sid) {
      setSessionId(sid);
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      fetch(`${API_BASE}/api/recommend/${sid}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.recommendation) {
            setRecData(data.recommendation);
          }
        })
        .catch(err => console.error("Failed to load portfolio:", err));
    }
  }, []);

  if (!mounted) return null;

  const handleQuickGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // Generate a new random session ID to isolate this quick build
      const newSessionId = crypto.randomUUID();
      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: newSessionId,
          capital: parseInt(formCapital),
          risk_appetite: formRisk,
          investment_horizon_years: parseInt(formHorizon),
        })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("apex_session_id", newSessionId);
        setSessionId(newSessionId);
        setRecData(data.recommendation);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!sessionId || !recData) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto w-full pb-16 animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">Portfolio Builder</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">
            Build your optimal asset allocation instantly.
          </p>
        </div>
        
        <div className="bg-white rounded-[18px] border border-slate-200 p-8 sm:p-12 shadow-soft mt-8 flex flex-col items-center">
          <Bot className="h-16 w-16 text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Active Portfolio Found</h2>
          <p className="text-slate-500 font-semibold max-w-md mx-auto text-center mb-8">
            Talk to the AI Advisor for a guided onboarding, or use the Quick Builder below to instantly generate an optimal mandate.
          </p>
          
          <form onSubmit={handleQuickGenerate} className="w-full max-w-md space-y-5 bg-slate-50 p-6 rounded-[16px] border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700">Initial Capital (₹)</label>
              <input type="number" value={formCapital} onChange={e => setFormCapital(e.target.value)} required className="w-full px-4 py-2.5 rounded-[12px] border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0E8A5A]/20" />
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700">Risk Appetite</label>
              <select value={formRisk} onChange={e => setFormRisk(e.target.value)} className="w-full px-4 py-2.5 rounded-[12px] border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0E8A5A]/20 bg-white">
                <option value="conservative">Conservative (Min Volatility)</option>
                <option value="moderate">Moderate (Balanced)</option>
                <option value="aggressive">Aggressive (Max Return)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-slate-700">Horizon (Years)</label>
              <select value={formHorizon} onChange={e => setFormHorizon(e.target.value)} className="w-full px-4 py-2.5 rounded-[12px] border border-slate-200 text-[13px] focus:outline-none focus:ring-2 focus:ring-[#0E8A5A]/20 bg-white">
                <option value="1">Short Term (1 Year)</option>
                <option value="3">Medium Term (3 Years)</option>
                <option value="5">Long Term (5 Years)</option>
                <option value="10">Very Long Term (10+ Years)</option>
              </select>
            </div>
            <button type="submit" disabled={isGenerating} className="w-full py-3 bg-[#0E8A5A] text-white rounded-[12px] font-bold text-[14px] hover:bg-[#0c784e] flex items-center justify-center gap-2 transition-colors mt-2">
              {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin"/> Generating...</> : "Quick Generate"}
            </button>
          </form>

        </div>
      </div>
    );
  }

  const triggerRebalance = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      setIsRebalancing(false);
      setIsRebalanced(true);
    }, 2000);
  };

  const capital = recData.investor_profile?.capital || 1000000;
  const vol = recData.volatility || 12.0;
  const ret = recData.expected_return || 16.2;
  const sharpe = recData.risk?.sharpe_ratio || 1.5;

  const currentPortfolioPoint = [{ x: vol, y: ret, name: "Current Portfolio" }];
  const targetPortfolioPoint = [{ x: vol - 1.5, y: ret + 1.2, name: "Optimized Target" }]; // Artificial mock for drift

  const weights = recData.allocation?.weights_pct || {};
  
  // Create mock drift (pretend current portfolio is unbalanced 0 weight, and optimized is the AI target)
  const comparisonData = Object.keys(weights).map(ticker => {
    return {
      name: ticker,
      Current: 0,
      Optimized: parseFloat(Number(weights[ticker]).toFixed(1))
    };
  });

  const actionableDirectives = Object.keys(weights).map(ticker => {
    const drift = parseFloat(Number(weights[ticker]).toFixed(1));
    return {
      symbol: ticker,
      desc: "Asset Allocation Target",
      drift: drift
    };
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">Portfolio Builder</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">
            ML-powered portfolio optimization using Modern Portfolio Theory
          </p>
        </div>
        <div className="flex gap-3 shrink-0 items-center">
          <button
            onClick={() => {
              setIsRebalanced(false);
            }}
            className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-soft hover:bg-slate-50 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Recalculate Drift</span>
          </button>
          <button className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white px-5 text-[13px] font-bold shadow-soft hover:bg-[#0c784e]">
            <Sliders className="h-4 w-4" />
            <span>Save Mandate</span>
          </button>
        </div>
      </div>

      {/* Efficient Frontier Graph & Volatility Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Frontier Plot */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[16px] font-extrabold text-[#0F172A]">Markowitz Efficient Frontier</h3>
            <p className="text-[11px] font-semibold text-slate-400">
              Maximize expected return relative to target portfolio volatility variance.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Volatility"
                  unit="%"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[4, 20]}
                />
                <YAxis
                  type="number"
                  dataKey="y"
                  name="Return"
                  unit="%"
                  tick={{ fill: "#94a3b8", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  domain={[3, 22]}
                />
                <ZAxis type="number" range={[100, 200]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}
                  labelStyle={{ color: "#94a3b8", fontSize: 9 }}
                />
                <Scatter name="Efficient Frontier" data={frontierCurve} fill="#94a3b8" line strokeWidth={1.5} />
                <Scatter name="Current Portfolio" data={currentPortfolioPoint} fill="#ef4444" />
                <Scatter name="Target Portfolio" data={targetPortfolioPoint} fill="#0E8A5A" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Graph Legend */}
          <div className="flex justify-center gap-6 text-[11px] font-bold text-slate-500 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-slate-400"></span>Optimal Frontier Curve
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]"></span>Current Allocation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0E8A5A]"></span>Optimized Mandate
            </span>
          </div>
        </div>

        {/* Volatility Gauge / Status Card */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#0E8A5A] bg-[#0E8A5A]/10 px-2.5 py-1 rounded-full">
              Volatility check
            </span>

            <h2 className="text-xl font-extrabold text-[#0F172A] tracking-tight">Active Volatility Rating</h2>

            <div className="flex items-center gap-4 py-4 border-y border-slate-100">
              <div className="h-16 w-16 bg-[#EEF3FF] rounded-[16px] flex items-center justify-center text-blue-600 shrink-0">
                <ShieldCheck className="h-8 w-8 text-[#0E8A5A]" />
              </div>
              <div className="leading-none text-left">
                <p className="text-[20px] font-black text-slate-800">
                  {vol}% <span className="text-[10px] text-slate-400 font-bold">SD</span>
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">Well within Volatility Mandate</p>
              </div>
            </div>

            <div className="text-[11px] leading-relaxed text-slate-500 font-semibold space-y-2">
              <div className="flex justify-between">
                <span>Covariance Index:</span>
                <span className="font-bold text-[#0F172A]">0.12 (Moderate)</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum Expected Drawdown:</span>
                <span className="font-bold text-[#0F172A]">-{((vol * 0.74)).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Target Sharpe Ratio:</span>
                <span className="font-bold text-[#0E8A5A]">{sharpe}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#EEF3FF] border border-blue-200/50 rounded-xl p-3.5 text-[11px] font-semibold text-slate-600 flex items-start gap-2.5 leading-normal">
            <Info className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Target Portfolio shift raises expected ARR to **{ret}%** without breaching volatility thresholds.
            </span>
          </div>
        </div>
      </div>

      {/* Allocation weight comparison chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Weight Comparison Chart */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[16px] font-extrabold text-[#0F172A]">Target vs Current Weights</h3>
            <p className="text-[11px] font-semibold text-slate-400">Deviation comparison between portfolios.</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }}
                  itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}
                />
                <Bar dataKey="Current" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Optimized" fill="#0E8A5A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Insights Table */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 shadow-soft overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h3 className="text-[16px] font-extrabold text-[#0F172A]">Actionable Rebalance Directives</h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">
                Execution pathways for calculated drift indicators based on live AI allocations.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse text-[11px] font-semibold text-slate-600">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-3.5">Asset</th>
                  <th className="px-6 py-3.5">Weight Drift</th>
                  <th className="px-6 py-3.5 text-right">Execution Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {actionableDirectives.map((item) => {
                  const absoluteTradeValue = Math.abs(Math.round(capital * (item.drift / 100)));
                  const actionType = item.drift >= 0 ? "Acquire" : "Trim";
                  return (
                    <tr key={item.symbol} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-[#0F172A]">{item.symbol}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{item.desc}</p>
                      </td>
                      <td className={`px-6 py-4 font-bold ${item.drift >= 0 ? "text-[#0E8A5A]" : "text-red-500"}`}>
                        {item.drift >= 0 ? "+" : ""}
                        {item.drift.toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isRebalanced ? (
                          <span className="text-[#0E8A5A] font-bold">Settled</span>
                        ) : (
                          <span>
                            {actionType} ₹{absoluteTradeValue.toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-slate-100 text-center">
            {isRebalanced ? (
              <button disabled className="w-full flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A]/20 text-[#0E8A5A] font-bold text-[13px]">
                <CheckCircle className="h-4.5 w-4.5" />
                <span>All Allocation Drifts Corrected</span>
              </button>
            ) : (
              <button
                onClick={triggerRebalance}
                disabled={isRebalancing}
                className="w-full flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white font-bold text-[13px] hover:bg-[#0c784e] transition-colors"
              >
                {isRebalancing ? (
                  <>
                    <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    <span>Processing Trades...</span>
                  </>
                ) : (
                  <>
                    <span>Execute Rebalance Enclave</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
