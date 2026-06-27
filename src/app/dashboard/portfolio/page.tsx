"use client";

import { useState, useEffect } from "react";
import {
  PieChart as PieIcon,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  FileDown,
  RefreshCw,
  Plus,
  ArrowRight,
  Info,
  Sliders,
  Loader2,
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

// Share sizes matching the dashboard page
const SHARES = {
  SPY: 4000,
  QQQ: 1300,
  IEF: 5000,
  GLD: 1500,
  BTC: 1.5,
};

// Efficient frontier curve coordinates (Volatility % vs Return %)
const frontierCurve = [
  { x: 6.0, y: 5.2, name: "Conservative Point" },
  { x: 8.0, y: 8.5, name: "Balanced Point" },
  { x: 10.0, y: 12.0, name: "Optimal Point A" },
  { x: 12.0, y: 16.2, name: "Optimal Point B (Target)" },
  { x: 15.0, y: 18.0, name: "Growth Point" },
  { x: 18.0, y: 19.5, name: "Aggressive Point" },
];

const targetPortfolioPoint = [
  { x: 12.0, y: 16.2, name: "Optimized Portfolio" },
];

export default function PortfolioPage() {
  const [isRebalanced, setIsRebalanced] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [liveQuotes, setLiveQuotes] = useState<any>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchLiveQuotes = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/stocks?action=quote");
      if (res.ok) {
        const data = await res.json();
        if (data && !data.isFallback) {
          setLiveQuotes(data);
        }
      }
    } catch (err) {
      console.error("Failed to load portfolio live weights from API:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchLiveQuotes();
  }, []);

  if (!mounted) return null;

  const triggerRebalance = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      setIsRebalancing(false);
      setIsRebalanced(true);
    }, 2000);
  };

  // Base values in case API rate limit is reached
  let portfolioValue = 4829190;
  let spyWeight = 45.0;
  let qqqWeight = 20.0;
  let iefWeight = 15.0;
  let gldWeight = 10.0;
  let btcWeight = 10.0;

  if (liveQuotes) {
    const spyPrice = parseFloat(liveQuotes["SPY"]?.close || "728.98");
    const qqqPrice = parseFloat(liveQuotes["QQQ"]?.close || "706.52");
    const iefPrice = parseFloat(liveQuotes["IEF"]?.close || "94.80");
    const gldPrice = parseFloat(liveQuotes["GLD"]?.close || "373.63");
    const btcPrice = parseFloat(liveQuotes["BTC/USD"]?.close || "60324.81");

    const spyVal = spyPrice * SHARES.SPY;
    const qqqVal = qqqPrice * SHARES.QQQ;
    const iefVal = iefPrice * SHARES.IEF;
    const gldVal = gldPrice * SHARES.GLD;
    const btcVal = btcPrice * SHARES.BTC;

    portfolioValue = spyVal + qqqVal + iefVal + gldVal + btcVal;

    spyWeight = (spyVal / portfolioValue) * 100;
    qqqWeight = (qqqVal / portfolioValue) * 100;
    iefWeight = (iefVal / portfolioValue) * 100;
    gldWeight = (gldVal / portfolioValue) * 100;
    btcWeight = (btcVal / portfolioValue) * 100;
  }

  // Current vs Optimized portfolio volatility/return points
  const currentPortfolioPoint = [
    { x: parseFloat((10 + (btcWeight * 0.14)).toFixed(1)) || 11.4, y: parseFloat((12 + (qqqWeight * 0.11)).toFixed(1)) || 14.2, name: "Current Portfolio" },
  ];

  // Target optimal weights under the Moderate mandate
  const comparisonData = [
    { name: "SPY", Current: parseFloat(spyWeight.toFixed(1)), Optimized: 41.8 },
    { name: "QQQ", Current: parseFloat(qqqWeight.toFixed(1)), Optimized: 23.2 },
    { name: "IEF", Current: parseFloat(iefWeight.toFixed(1)), Optimized: 11.5 },
    { name: "GLD", Current: parseFloat(gldWeight.toFixed(1)), Optimized: 12.0 },
    { name: "BTC", Current: parseFloat(btcWeight.toFixed(1)), Optimized: 11.5 },
  ];

  // Dynamic drift calculations
  const drifts = {
    SPY: 41.8 - spyWeight,
    QQQ: 23.2 - qqqWeight,
    IEF: 11.5 - iefWeight,
    GLD: 12.0 - gldWeight,
    BTC: 11.5 - btcWeight,
  };

  const actionableDirectives = [
    { symbol: "SPY", desc: "S&P 500 Index", drift: drifts.SPY },
    { symbol: "QQQ", desc: "Nasdaq 100 ETF", drift: drifts.QQQ },
    { symbol: "IEF", desc: "Treasury Bond ETF", drift: drifts.IEF },
    { symbol: "GLD", desc: "Gold Trust ETF", drift: drifts.GLD },
    { symbol: "BTC", desc: "Bitcoin Core", drift: drifts.BTC },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">AI Quant Portfolio</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">
            ML-powered portfolio optimization using Modern Portfolio Theory
          </p>
        </div>
        <div className="flex gap-3 shrink-0 items-center">
          {isSyncing && <Loader2 className="h-4 w-4 animate-spin text-[#0E8A5A]" />}
          <button
            onClick={() => {
              setIsRebalanced(false);
              fetchLiveQuotes();
            }}
            disabled={isSyncing}
            className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white px-4 text-[13px] font-bold text-slate-700 shadow-soft hover:bg-slate-50 disabled:opacity-75 transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Sync Live Quote</span>
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
                  {currentPortfolioPoint[0].x.toFixed(1)}% <span className="text-[10px] text-slate-400 font-bold">SD</span>
                </p>
                <p className="text-[11px] text-slate-400 font-semibold mt-1">Well within 15% Volatility Mandate</p>
              </div>
            </div>

            <div className="text-[11px] leading-relaxed text-slate-500 font-semibold space-y-2">
              <div className="flex justify-between">
                <span>Covariance Index:</span>
                <span className="font-bold text-[#0F172A]">0.12 (Moderate)</span>
              </div>
              <div className="flex justify-between">
                <span>Maximum Expected Drawdown:</span>
                <span className="font-bold text-[#0F172A]">-{((currentPortfolioPoint[0].x * 0.74)).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Systemic Beta Correlation:</span>
                <span className="font-bold text-[#0E8A5A]">0.62</span>
              </div>
            </div>
          </div>

          <div className="bg-[#EEF3FF] border border-blue-200/50 rounded-xl p-3.5 text-[11px] font-semibold text-slate-600 flex items-start gap-2.5 leading-normal">
            <Info className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
            <span>
              Target Portfolio shift raises expected ARR to **16.2%** without breaching volatility thresholds.
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
                Execution pathways for calculated drift indicators based on live quotes.
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
                  const absoluteTradeValue = Math.abs(Math.round(portfolioValue * (item.drift / 100)));
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
                            {actionType} ${absoluteTradeValue.toLocaleString()}
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
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
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
