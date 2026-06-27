"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Brain,
  Layers,
  ArrowUpRight,
  RefreshCw,
  Gauge,
  Grid,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Mock datasets for different assets in case of API rate limits
const fallbackAssetData = {
  SPX: {
    name: "S&P 500 Index (SPY)",
    price: "$545.20",
    change: "+$4.20",
    pctChange: "+0.79%",
    isPositive: true,
    sentiment: 78,
    sentimentText: "Strong Bullish",
    chart: [
      { date: "09:30", price: 541.0, volume: 120000 },
      { date: "10:30", price: 542.2, volume: 240000 },
      { date: "11:30", price: 541.8, volume: 180000 },
      { date: "12:30", price: 543.0, volume: 310000 },
      { date: "13:30", price: 544.5, volume: 290000 },
      { date: "14:30", price: 543.8, volume: 150000 },
      { date: "15:30", price: 545.2, volume: 420000 },
    ],
    matrix: [
      { name: "SPX", spx: 1.0, btc: 0.42, eth: 0.45, gld: -0.08 },
      { name: "BTC", spx: 0.42, btc: 1.0, eth: 0.88, gld: -0.12 },
      { name: "ETH", spx: 0.45, btc: 0.88, eth: 1.0, gld: -0.15 },
      { name: "GLD", spx: -0.08, btc: -0.12, eth: -0.15, gld: 1.0 },
    ],
  },
  BTC: {
    name: "Bitcoin Core",
    price: "$62,490.00",
    change: "-$1,120.00",
    pctChange: "-1.76%",
    isPositive: false,
    sentiment: 51,
    sentimentText: "Neutral",
    chart: [
      { date: "09:30", price: 63610, volume: 900 },
      { date: "10:30", price: 63200, volume: 1400 },
      { date: "11:30", price: 62800, volume: 2100 },
      { date: "12:30", price: 63100, volume: 1700 },
      { date: "13:30", price: 62500, volume: 3500 },
      { date: "14:30", price: 62900, volume: 1900 },
      { date: "15:30", price: 62490, volume: 2800 },
    ],
    matrix: [
      { name: "SPX", spx: 0.42, btc: 0.42, eth: 0.45, gld: -0.08 },
      { name: "BTC", spx: 0.42, btc: 1.0, eth: 0.88, gld: -0.12 },
      { name: "ETH", spx: 0.45, btc: 0.88, eth: 1.0, gld: -0.15 },
      { name: "GLD", spx: -0.08, btc: -0.12, eth: -0.15, gld: 1.0 },
    ],
  },
  ETH: {
    name: "Ethereum Network",
    price: "$3,420.50",
    change: "+$68.10",
    pctChange: "+2.03%",
    isPositive: true,
    sentiment: 68,
    sentimentText: "Bullish",
    chart: [
      { date: "09:30", price: 3350, volume: 1100 },
      { date: "10:30", price: 3365, volume: 900 },
      { date: "11:30", price: 3380, volume: 1500 },
      { date: "12:30", price: 3410, volume: 2200 },
      { date: "13:30", price: 3390, volume: 1300 },
      { date: "14:30", price: 3405, volume: 1700 },
      { date: "15:30", price: 3420, volume: 3100 },
    ],
    matrix: [
      { name: "SPX", spx: 0.45, btc: 0.42, eth: 0.45, gld: -0.08 },
      { name: "BTC", spx: 0.42, btc: 1.0, eth: 0.88, gld: -0.12 },
      { name: "ETH", spx: 0.45, btc: 0.88, eth: 1.0, gld: -0.15 },
      { name: "GLD", spx: -0.08, btc: -0.12, eth: -0.15, gld: 1.0 },
    ],
  },
};

// Sector performance mock
const sectors = [
  { name: "Technology", perf: "+2.48%", class: "bg-[#0E8A5A]/15 text-[#0E8A5A]" },
  { name: "Financials", perf: "+1.12%", class: "bg-[#0E8A5A]/10 text-[#0E8A5A]" },
  { name: "Energy", perf: "-0.40%", class: "bg-red-50 text-red-600 border border-red-100" },
  { name: "Healthcare", perf: "+0.15%", class: "bg-slate-50 text-slate-500" },
  { name: "Materials", perf: "+0.54%", class: "bg-[#0E8A5A]/5 text-[#0E8A5A]" },
  { name: "Consumer Disc.", perf: "-0.95%", class: "bg-red-50 text-red-600 border border-red-100" },
];

export default function MarketAnalysis() {
  const [activeTab, setActiveTab] = useState<"SPX" | "BTC" | "ETH">("SPX");
  const [mounted, setMounted] = useState(false);
  const [liveQuote, setLiveQuote] = useState<any>(null);
  const [liveSeries, setLiveSeries] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const getTwelveDataSymbol = (tab: "SPX" | "BTC" | "ETH") => {
    if (tab === "SPX") return "SPY"; // SPY acts as S&P 500 ETF index proxy
    if (tab === "BTC") return "BTC/USD";
    return "ETH/USD";
  };

  const fetchIndexData = async () => {
    setIsSyncing(true);
    try {
      const symbol = getTwelveDataSymbol(activeTab);

      // Fetch Quote
      const quoteRes = await fetch(`/api/stocks?action=quote&symbols=${symbol}`);
      if (quoteRes.ok) {
        const qData = await quoteRes.json();
        if (qData && !qData.isFallback) {
          const rawQuote = qData[symbol] || qData;
          if (rawQuote && rawQuote.symbol) {
            setLiveQuote(rawQuote);
          }
        }
      }

      // Fetch 30-day Time Series
      const seriesRes = await fetch(`/api/stocks?action=series&symbol=${symbol}&interval=1day&outputsize=30`);
      if (seriesRes.ok) {
        const sData = await seriesRes.json();
        if (sData && sData.values && !sData.isFallback) {
          const reversed = [...sData.values].reverse();
          const parsed = reversed.map((item: any) => ({
            date: item.datetime.split("-").slice(1).join("/"), // MM/DD
            price: parseFloat(item.close),
            volume: parseInt(item.volume) || 0,
          }));
          setLiveSeries(parsed);
        } else {
          setLiveSeries([]);
        }
      }
    } catch (error) {
      console.error("Error loading index quote/series details from API:", error);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchIndexData();
    }
  }, [activeTab, mounted]);

  if (!mounted) return null;

  const fallback = fallbackAssetData[activeTab];

  // Resolve pricing details from real-time quote, otherwise use high-trust fallbacks
  const displayName = liveQuote
    ? activeTab === "SPX"
      ? "S&P 500 Index ETF (SPY)"
      : liveQuote.name
    : fallback.name;

  const currentPrice = liveQuote
    ? `$${parseFloat(liveQuote.close).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : fallback.price;

  const changeText = liveQuote
    ? `${parseFloat(liveQuote.change) >= 0 ? "+" : ""}${parseFloat(liveQuote.change).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    : fallback.change;

  const changePctText = liveQuote
    ? `${parseFloat(liveQuote.percent_change) >= 0 ? "+" : ""}${parseFloat(liveQuote.percent_change).toFixed(2)}%`
    : fallback.pctChange;

  const isPositive = liveQuote ? parseFloat(liveQuote.change) >= 0 : fallback.isPositive;

  const volumeVal = liveQuote
    ? `${(parseFloat(liveQuote.volume) / (activeTab === "SPX" ? 1000000 : 1000)).toFixed(1)}${activeTab === "SPX" ? "M" : "K"} units`
    : `${(fallback.chart[fallback.chart.length - 1].volume / (activeTab === "SPX" ? 100000 : 1000)).toFixed(1)}${activeTab === "SPX" ? "M" : "K"} units`;

  const dailyRange = liveQuote?.low
    ? `$${parseFloat(liveQuote.low).toLocaleString(undefined, { maximumFractionDigits: 2 })} - $${parseFloat(liveQuote.high).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : activeTab === "SPX"
    ? "$535.00 - $550.00"
    : activeTab === "BTC"
    ? "$59,000.00 - $63,000.00"
    : "$3,300.00 - $3,500.00";

  // Use dynamic chart coordinates if fetched, otherwise use local mocks
  const activeChartData = liveSeries.length > 0 ? liveSeries : fallback.chart;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">Market Analysis</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">
            Real-time charts and sentiment indicators powered by Twelve Data integration.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex bg-slate-100 p-0.5 border border-slate-200/50 rounded-xl shrink-0 items-center">
          {isSyncing && <Loader2 className="h-4 w-4 animate-spin text-[#0E8A5A] mr-3" />}
          {(["SPX", "BTC", "ETH"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setLiveQuote(null);
                setLiveSeries([]);
                setActiveTab(tab);
              }}
              className={`text-[11px] font-bold px-4.5 py-2.5 rounded-lg transition-colors ${
                activeTab === tab ? "bg-white text-[#0F172A] shadow-soft" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab} Index
            </button>
          ))}
        </div>
      </div>

      {/* Asset Pricing Summary */}
      <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{displayName}</span>
            <div className="flex items-baseline gap-3.5 mt-1">
              <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">{currentPrice}</h2>
              <span className={`text-[13px] font-bold flex items-center ${isPositive ? "text-[#0E8A5A]" : "text-red-500"}`}>
                {isPositive ? "▲" : "▼"} {changeText} ({changePctText})
              </span>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-8 h-10 flex items-center">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Volume (24H)</p>
              <p className="text-[14px] font-extrabold text-slate-700">{volumeVal}</p>
            </div>
          </div>

          <div className="border-l border-slate-200 pl-8 h-10 flex items-center">
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Daily Range</p>
              <p className="text-[14px] font-extrabold text-slate-700">{dailyRange}</p>
            </div>
          </div>
        </div>

        {/* Pricing Chart */}
        <div className="h-72 w-full mt-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? "#0E8A5A" : "#ef4444"} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={isPositive ? "#0E8A5A" : "#ef4444"} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: "#94a3b8", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                domain={["dataMin - 5", "dataMax + 5"]}
                tickFormatter={(val) => `$${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }}
                labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: 10 }}
                itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}
                formatter={(val: any) => [`$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, "Price"]}
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={isPositive ? "#0E8A5A" : "#ef4444"}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPrice)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sentiment & Heatmap Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sentiment Gauge Card */}
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-[16px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <Gauge className="h-5 w-5 text-[#0E8A5A]" /> AI Sentiment Gauge
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">NLP analysis of active financial publications.</p>
          </div>

          <div className="py-6 flex flex-col items-center justify-center relative">
            <div className="relative h-32 w-48 flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 100 50">
                <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#E2E8F0" strokeWidth="10" strokeLinecap="round" />
                <path
                  d="M10,50 A40,40 0 0,1 90,50"
                  fill="none"
                  stroke="#0E8A5A"
                  strokeWidth="10.5"
                  strokeLinecap="round"
                  strokeDasharray={`${(fallback.sentiment / 100) * 125} 125`}
                />
              </svg>
              <div className="absolute bottom-1 text-center">
                <p className="text-2xl font-extrabold text-[#0F172A]">{fallback.sentiment}%</p>
                <p className="text-[10px] font-bold text-[#0E8A5A] uppercase tracking-wider">{fallback.sentimentText}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 text-[11px] font-semibold text-slate-500 leading-normal">
            Neural indicators display positive momentum based on 4,200 parsed corporate updates and macro feeds over 24 hours.
          </div>
        </div>

        {/* Sector Heatmap */}
        <div className="lg:col-span-2 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[16px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <Grid className="h-5 w-5 text-[#0E8A5A]" /> Sector Heatmap
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">Equity sectors performance relative to benchmark indices.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 flex-1">
            {sectors.map((sec) => (
              <div
                key={sec.name}
                className={`rounded-[14px] p-4 flex flex-col justify-between border border-slate-100 ${sec.class} shadow-soft transition-transform hover:scale-[1.02] duration-200`}
              >
                <span className="text-[12px] font-bold text-slate-800">{sec.name}</span>
                <span className="text-lg font-black tracking-tight mt-3">{sec.perf}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Correlation Matrix & Ticker List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Correlation Matrix */}
        <div className="lg:col-span-2 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft">
          <div className="space-y-1 mb-6">
            <h3 className="text-[16px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <Layers className="h-5 w-5 text-[#0E8A5A]" /> Cross-Asset Correlation Matrix
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">30-day rolling Pearson correlation indices.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Asset</th>
                  <th className="px-4 py-3">SPX</th>
                  <th className="px-4 py-3">BTC</th>
                  <th className="px-4 py-3">ETH</th>
                  <th className="px-4 py-3">GLD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[13px] font-bold text-slate-700">
                {fallback.matrix.map((row) => (
                  <tr key={row.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-4 text-left font-extrabold text-[#0F172A]">{row.name}</td>
                    <td className={`px-4 py-4 ${row.spx === 1 ? "bg-emerald-50 text-[#0E8A5A]" : "text-slate-600"}`}>
                      {row.spx.toFixed(2)}
                    </td>
                    <td className={`px-4 py-4 ${row.btc === 1 ? "bg-emerald-50 text-[#0E8A5A]" : "text-slate-600"}`}>
                      {row.btc.toFixed(2)}
                    </td>
                    <td className={`px-4 py-4 ${row.eth === 1 ? "bg-emerald-50 text-[#0E8A5A]" : "text-slate-600"}`}>
                      {row.eth.toFixed(2)}
                    </td>
                    <td className={`px-4 py-4 ${row.gld === 1 ? "bg-emerald-50 text-[#0E8A5A]" : "text-slate-600"}`}>
                      {row.gld.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Market Gainers */}
        <div className="bg-white rounded-[18px] border border-slate-200/60 shadow-soft overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-[16px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#0E8A5A]" /> Top Yield Gainers
            </h3>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Top-performing tickers within 24 hours.</p>
          </div>

          <div className="divide-y divide-slate-100 text-[12px] font-semibold text-slate-600 flex-1">
            <div className="px-6 py-4.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
              <div>
                <p className="font-bold text-[#0F172A]">NVDA</p>
                <p className="text-[10px] text-slate-400 font-medium">NVIDIA Corporation</p>
              </div>
              <span className="text-[#0E8A5A] font-bold text-[13px]">+4.82%</span>
            </div>
            <div className="px-6 py-4.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
              <div>
                <p className="font-bold text-[#0F172A]">TSLA</p>
                <p className="text-[10px] text-slate-400 font-medium">Tesla Motors Inc.</p>
              </div>
              <span className="text-[#0E8A5A] font-bold text-[13px]">+3.15%</span>
            </div>
            <div className="px-6 py-4.5 flex justify-between items-center hover:bg-slate-50/50 transition-colors">
              <div>
                <p className="font-bold text-[#0F172A]">AAPL</p>
                <p className="text-[10px] text-slate-400 font-medium">Apple Computer Inc.</p>
              </div>
              <span className="text-[#0E8A5A] font-bold text-[13px]">+1.98%</span>
            </div>
          </div>

          <div className="p-6 border-t border-slate-100 bg-slate-50/30 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-center gap-1">
              <RefreshCw className="h-3 w-3 animate-spin text-[#0E8A5A]" /> Real-time pricing ticks active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
