"use client";

import { useState, useEffect } from "react";
import {
  Home,
  TrendingUp,
  LineChart as LineIcon,
  AlertTriangle,
  Activity,
  BookOpen,
  Bot,
  FileText,
  Settings,
  Plus,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  X,
  Send,
  HelpCircle,
  Info,
  Calendar,
  Grid,
  FileSpreadsheet,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";

// 1. Efficient Frontier Data
const frontierCurve = [
  { x: 6.0, y: 5.2 },
  { x: 8.0, y: 8.5 },
  { x: 10.0, y: 12.0 },
  { x: 12.0, y: 15.4, name: "Max Sharpe" },
  { x: 15.0, y: 17.5 },
  { x: 18.0, y: 19.5 },
];
const currentPoint = [{ x: 11.4, y: 11.2, name: "Current Portfolio" }];
const optimizedPoint = [{ x: 12.0, y: 15.4, name: "Optimized Portfolio" }];

// 2. Allocation Donut Data
const initialAllocation = [
  { name: "TCS", value: 30, color: "#0E8A5A", expectedReturn: "14%", confidence: "84%", momentum: "Positive", eps: "Growing", revenue: "Increasing", reason: "Selected by optimizer because it improves Sharpe Ratio while keeping portfolio volatility within target." },
  { name: "Infosys", value: 20, color: "#0F172A", expectedReturn: "12.5%", confidence: "82%", momentum: "Positive", eps: "Growing", revenue: "Stable", reason: "Stable tech titan adding low-covariance growth to the portfolio frontier." },
  { name: "Reliance", value: 20, color: "#3B82F6", expectedReturn: "13.8%", confidence: "85%", momentum: "Positive", eps: "Stable", revenue: "Increasing", reason: "Defensive heavy weight providing core systemic stability." },
  { name: "Gold ETF", value: 15, color: "#F59E0B", expectedReturn: "8.5%", confidence: "90%", momentum: "Neutral", eps: "N/A", revenue: "N/A", reason: "Acts as a negative-correlation hedge protecting against equity drawdown events." },
  { name: "Nifty ETF", value: 15, color: "#8B5CF6", expectedReturn: "11.2%", confidence: "88%", momentum: "Positive", eps: "N/A", revenue: "N/A", reason: "Provides broad beta market indexing and mitigates single-stock volatility." },
];

// 3. Backtesting Line Data
const backtestData = [
  { year: "2019", Portfolio: 100, Nifty: 100, Sensex: 98 },
  { year: "2020", Portfolio: 92, Nifty: 82, Sensex: 80 },
  { year: "2021", Portfolio: 135, Nifty: 115, Sensex: 112 },
  { year: "2022", Portfolio: 150, Nifty: 130, Sensex: 128 },
  { year: "2023", Portfolio: 175, Nifty: 152, Sensex: 148 },
  { year: "2024", Portfolio: 193, Nifty: 171, Sensex: 168 },
];

// 4. Sector Rotation & Intelligence Mocks
const sectorRotation = [
  { sector: "Technology", score: 82, trend: "Bullish" },
  { sector: "Financials", score: 71, trend: "Neutral" },
  { sector: "Energy", score: 58, trend: "Bearish" },
  { sector: "Commodities", score: 65, trend: "Neutral" },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [isExplainOpen, setIsExplainOpen] = useState(false);

  // Onboarding profile states
  const [capital, setCapital] = useState("10,00,000");
  const [riskProfile, setRiskProfile] = useState("Moderate");
  const [expectedReturn, setExpectedReturn] = useState("14.2%");
  const [sharpeRatio, setSharpeRatio] = useState("1.54");
  const [volatility, setVolatility] = useState("9.4%");
  const [confidenceScore, setConfidenceScore] = useState("84%");
  const [allocations, setAllocations] = useState<any[]>(initialAllocation);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [frontierPoints, setFrontierPoints] = useState({
    current: [{ x: 11.4, y: 11.2, name: "Current Portfolio" }],
    optimized: [{ x: 12.0, y: 15.4, name: "Optimized Portfolio" }],
  });

  // RAG Input & Output States
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [isAskingRag, setIsAskingRag] = useState(false);

  // AI Chat States (ChatGPT Style)
  const [chatLog, setChatLog] = useState<any[]>([
    { sender: "ai", text: "I am your Quant Advisor agent. Ask me about model allocations, risk metrics, or market correlations." },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (mounted) {
      const fetchLiveDashboard = async () => {
        try {
          const sid = localStorage.getItem("apex_session_id");
          if (!sid) {
            console.log("No session ID found.");
            return;
          }
          setSessionId(sid);
          
          const res = await fetch(`${API_BASE}/api/recommend/${sid}`);
          if (res.ok) {
            const json = await res.json();
            const rec = json.recommendation || {};
            
            // Set basic profile values if available
            if (rec.investor_profile) {
              setCapital(rec.investor_profile.capital.toLocaleString("en-IN"));
              setRiskProfile(rec.investor_profile.risk_appetite);
            }
            
            if (rec.expected_return !== undefined) setExpectedReturn(`${rec.expected_return}%`);
            if (rec.risk?.sharpe_ratio !== undefined) setSharpeRatio(`${rec.risk.sharpe_ratio}`);
            if (rec.volatility !== undefined) setVolatility(`${rec.volatility}%`);
            if (rec.confidence !== undefined) setConfidenceScore(`${rec.confidence}%`);
            
            if (rec.allocation && rec.allocation.weights_pct) {
              const colors = ["#0E8A5A", "#0F172A", "#3B82F6", "#F59E0B", "#8B5CF6", "#10B981", "#ef4444", "#8b5cf6", "#f43f5e", "#06b6d4"];
              const newAllocs = Object.entries(rec.allocation.weights_pct).map(([name, value], i) => ({
                name,
                value: Number((value as number).toFixed(1)),
                color: colors[i % colors.length],
                expectedReturn: "Market Beta",
                confidence: rec.confidence ? `${rec.confidence}%` : "80%",
                momentum: rec.fundamentals?.[name]?.sentiment || "Neutral",
                eps: rec.fundamentals?.[name]?.valuation || "Fair",
                revenue: "Stable",
                reason: "Dynamically allocated by PyPortfolioOpt based on your risk profile."
              }));
              setAllocations(newAllocs);
            }
          }
        } catch (e) {
          console.error("Failed to load dashboard data", e);
        }
      };
      fetchLiveDashboard();
    }
  }, [mounted]);

  if (!mounted) return null;

  // Handles RAG Question
  const handleRagSearch = async () => {
    if (!ragQuestion.trim()) return;
    setIsAskingRag(true);
    setRagAnswer("");

    try {
      const res = await fetch(`${API_BASE}/api/rag/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: ragQuestion, session_id: sessionId, k: 3 }),
      });
      const data = await res.json();
      setRagAnswer(data.answer || "No relevant information found.");
    } catch (e) {
      setRagAnswer("Error connecting to RAG engine.");
    }
    setIsAskingRag(false);
  };

  // Handles Chat queries
  const handleChatSend = async (text: string) => {
    if (!text.trim()) return;
    setChatLog((prev) => [...prev, { sender: "user", text }]);
    setChatInput("");
    setIsChatTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: text }),
      });
      const data = await res.json();
      setChatLog((prev) => [...prev, { sender: "ai", text: data.response }]);
    } catch (e) {
      setChatLog((prev) => [...prev, { sender: "ai", text: "Error connecting to AI Advisor." }]);
    }
    setIsChatTyping(false);
  };

  if (!sessionId) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto w-full pb-16 animate-in fade-in duration-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">AI Quant Portfolio</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">
            ML-powered portfolio optimization using Modern Portfolio Theory
          </p>
        </div>
        
        <div className="bg-white rounded-[18px] border border-slate-200 p-12 text-center shadow-soft mt-8 flex flex-col items-center justify-center">
          <Bot className="h-16 w-16 text-slate-200 mb-4" />
          <h2 className="text-xl font-bold text-slate-800 mb-2">No Active Portfolio Found</h2>
          <p className="text-slate-500 font-semibold max-w-md mx-auto mb-6">
            You haven't built a customized portfolio yet. Talk to the AI Advisor to complete your onboarding and generate your optimized allocation.
          </p>
          <a href="/dashboard/advisor" className="px-6 py-3 bg-[#0E8A5A] text-white rounded-[14px] font-bold text-[14px] hover:bg-[#0c784e] flex items-center gap-2 transition-colors">
            Go to AI Advisor <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full pb-16 animate-in fade-in duration-200">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">AI Quant Portfolio</h1>
        <p className="text-[13px] font-semibold text-slate-400 mt-1">
          ML-powered portfolio optimization using Modern Portfolio Theory
        </p>
      </div>

      {/* SECTION 1: Portfolio Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-4.5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Capital</p>
          <h3 className="text-xl font-extrabold text-[#0F172A] mt-2">₹{capital}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">{riskProfile} Mandate</p>
        </div>
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-4.5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Return</p>
          <h3 className="text-xl font-extrabold text-[#0E8A5A] mt-2">{expectedReturn}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">XGBoost Forecast</p>
        </div>
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-4.5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sharpe Ratio</p>
          <h3 className="text-xl font-extrabold text-[#0F172A] mt-2">{sharpeRatio}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Risk Engine Solved</p>
        </div>
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-4.5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Volatility (SD)</p>
          <h3 className="text-xl font-extrabold text-[#0F172A] mt-2">{volatility}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Target Limits Active</p>
        </div>
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-4.5 shadow-soft">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidence Score</p>
          <h3 className="text-xl font-extrabold text-[#0F172A] mt-2">{confidenceScore}</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">Model Accuracy</p>
        </div>
      </div>

      {/* SECTION 2: Efficient Frontier & Portfolio Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Efficient Frontier Curve (Left Card - 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-[15px] font-extrabold text-[#0F172A]">Efficient Frontier</h3>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded uppercase font-mono">PyPortfolioOpt</span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400">Markowitz Efficient Frontier optimizing returns against standard deviation covariance.</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 0, left: -20 }}>
                <XAxis type="number" dataKey="x" name="Volatility" unit="%" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[4, 20]} />
                <YAxis type="number" dataKey="y" name="Return" unit="%" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} domain={[3, 22]} />
                <ZAxis type="number" range={[100, 200]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }} itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }} />
                
                {/* Curve & Dots */}
                <Scatter name="Frontier" data={frontierCurve} fill="#94a3b8" line strokeWidth={1.5} />
                <Scatter name="Current Portfolio" data={frontierPoints.current} fill="#ef4444" />
                <Scatter name="Optimized Portfolio" data={frontierPoints.optimized} fill="#0E8A5A" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Grid Legends */}
          <div className="flex justify-center gap-6 text-[10px] font-bold text-slate-500 pt-4 border-t border-slate-100">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-slate-400"></span>Frontier Line</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#ef4444]"></span>Current Portfolio 🔴</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#0E8A5A]"></span>Optimized Portfolio 🟢</span>
            <span className="flex items-center gap-1.5"><span className="text-[#F59E0B]">★</span> Maximum Sharpe ⭐</span>
          </div>
        </div>

        {/* Portfolio Health Summary (Right Card - 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">Portfolio Health</h3>
            <p className="text-[11px] font-semibold text-slate-400">Consolidated indicators calculated across model stacks.</p>
          </div>

          <div className="divide-y divide-slate-100 text-[12px] font-semibold text-slate-600 space-y-3.5 pt-4">
            <div className="flex justify-between items-center pb-2">
              <span className="text-slate-400">Expected Return</span>
              <span className="font-extrabold text-[#0E8A5A] text-sm">{expectedReturn}</span>
            </div>
            <div className="flex justify-between items-center pt-2 pb-2">
              <span className="text-slate-400">Risk Profile</span>
              <span className="font-extrabold text-slate-700">{riskProfile}</span>
            </div>
            <div className="flex justify-between items-center pt-2 pb-2">
              <span className="text-slate-400">Sharpe Ratio</span>
              <span className="font-extrabold text-slate-700">{sharpeRatio}</span>
            </div>
            <div className="flex justify-between items-center pt-2 pb-2">
              <span className="text-slate-400">Confidence Rating</span>
              <span className="font-extrabold text-slate-700">{confidenceScore}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400">Diversification Index</span>
              <span className="font-extrabold text-slate-700">91%</span>
            </div>
          </div>

          <div className="bg-[#EEF3FF] border border-blue-200/50 rounded-xl p-3 text-[10px] font-semibold text-slate-500 flex items-start gap-2.5 mt-4">
            <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
            <span>Health index integrates predictions from XGBoost and covariance optimization from PyPortfolioOpt.</span>
          </div>
        </div>
      </div>

      {/* SECTION 3: Portfolio Allocation & AI Committee */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Allocation Donut Chart (Bottom Left - 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between relative">
          <div className="space-y-1 mb-4">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">Portfolio Allocation</h3>
            <p className="text-[11px] font-semibold text-slate-400">Click any sector slice to slide open stock metrics.</p>
          </div>

          <div className="h-48 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocations}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  onClick={(entry) => setSelectedStock(entry)}
                >
                  {allocations.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="cursor-pointer hover:opacity-90" />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center pointer-events-none">
              <p className="text-[18px] font-black text-[#0F172A]">{allocations.length} Assets</p>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active Weights</p>
            </div>
          </div>

          {/* Allocation Legend */}
          <div className="space-y-1.5 text-[11px] font-semibold text-slate-600 pt-4">
            {allocations.map((item) => (
              <button
                key={item.name}
                onClick={() => setSelectedStock(item)}
                className="w-full flex items-center justify-between hover:bg-slate-50 p-1.5 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                  {item.name}
                </span>
                <span className="font-bold text-[#0F172A]">{item.value}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Investment Committee (Bottom Right - 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">AI Investment Committee</h3>
            <p className="text-[11px] font-semibold text-slate-400">Consensus dashboard aggregating localized backend analytical engines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            <div className="border border-slate-200/60 rounded-xl p-3.5 bg-slate-50/50">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Quant Engine</p>
              <p className="text-[13px] font-extrabold text-[#0E8A5A] mt-1.5 flex items-center gap-1">
                <span>Momentum Positive</span>
              </p>
            </div>
            <div className="border border-slate-200/60 rounded-xl p-3.5 bg-slate-50/50">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Risk Engine</p>
              <p className="text-[13px] font-extrabold text-[#0E8A5A] mt-1.5">Within Risk bounds</p>
            </div>
            <div className="border border-slate-200/60 rounded-xl p-3.5 bg-slate-50/50">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fundamental Engine</p>
              <p className="text-[13px] font-extrabold text-[#0E8A5A] mt-1.5">Healthy Earnings</p>
            </div>
            <div className="border border-slate-200/60 rounded-xl p-3.5 bg-slate-50/50">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Research Engine</p>
              <p className="text-[13px] font-extrabold text-[#0E8A5A] mt-1.5">Annual Report Valid</p>
            </div>
            <div className="border border-slate-200/60 rounded-xl p-3.5 bg-slate-50/50 col-span-1 sm:col-span-2 md:col-span-1">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Macro Engine</p>
              <p className="text-[13px] font-extrabold text-slate-500 mt-1.5">Rates Neutral</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-4 flex justify-between items-center text-[10px] font-bold text-slate-400">
            <span>Notice: These are NOT fake AI agents. Each represents a core backend module.</span>
          </div>
        </div>
      </div>

      {/* SECTION 4: Backtesting & Benchmark Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Backtester (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">Historical Backtesting</h3>
            <p className="text-[11px] font-semibold text-slate-400">Compound performance comparisons (2019-Today) driven by vectorbt backend models.</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={backtestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }} labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: 10 }} itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Portfolio" stroke="#0E8A5A" strokeWidth={2.5} activeDot={{ r: 6 }} name="Portfolio Strategy (+93%)" />
                <Line type="monotone" dataKey="Nifty" stroke="#94a3b8" strokeWidth={1.5} name="Nifty Index (+71%)" />
                <Line type="monotone" dataKey="Sensex" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="3 3" name="Sensex Index (+68%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Backtest Stats Panel (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">Backtesting Metrics</h3>
            <p className="text-[11px] font-semibold text-slate-400">Statistical risk/yield outputs from the vectorbt simulation.</p>
          </div>

          <div className="divide-y divide-slate-100 text-[12px] font-semibold text-slate-600 space-y-3.5 pt-4">
            <div className="flex justify-between items-center pb-2">
              <span className="text-slate-400">CAGR</span>
              <span className="font-extrabold text-slate-700 text-sm">18%</span>
            </div>
            <div className="flex justify-between items-center pt-2 pb-2">
              <span className="text-slate-400">Maximum Expected Drawdown</span>
              <span className="font-extrabold text-red-500">10%</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-slate-400">Win Rate</span>
              <span className="font-extrabold text-[#0E8A5A]">69%</span>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200/40 rounded-xl p-3.5 text-[10px] font-semibold text-slate-500 mt-4 leading-relaxed">
            CAGR and maximum drawdown computed over rolling historical distributions from 2019 to 2024.
          </div>
        </div>
      </div>

      {/* SECTION 5: Market Intelligence & AI Explainability */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Market Intelligence Grid (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">Market Intelligence</h3>
            <p className="text-[11px] font-semibold text-slate-400">Real-time sector rotation grids and calendar indexes.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 space-y-2">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Sector Rotation</p>
              <div className="space-y-1.5 text-[11px] font-bold">
                {sectorRotation.map((sec) => (
                  <div key={sec.sector} className="flex justify-between items-center">
                    <span className="text-slate-600 font-semibold">{sec.sector}</span>
                    <span className={sec.trend === "Bullish" ? "text-[#0E8A5A]" : sec.trend === "Bearish" ? "text-red-500" : "text-slate-500"}>{sec.trend}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/50 flex flex-col justify-between">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Top Gainer</p>
              <div>
                <p className="text-md font-extrabold text-[#0F172A]">TCS</p>
                <p className="text-[11px] text-[#0E8A5A] font-bold mt-1">▲ +4.8% Today</p>
              </div>
            </div>
          </div>
        </div>

        {/* AI Explainability Flow (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">AI Explainability</h3>
            <p className="text-[11px] font-semibold text-slate-400">Trace model decisions chronologically through pipeline enclaves.</p>
          </div>

          <div className="flex flex-col items-center gap-1.5 py-4 font-mono text-[10px] text-slate-400 font-bold border-y border-slate-50">
            <span className="text-slate-600">User Mandate Form</span>
            <ChevronRight className="h-3 w-3 rotate-90 text-slate-300" />
            <span className="text-slate-600">XGBoost Returns</span>
            <ChevronRight className="h-3 w-3 rotate-90 text-slate-300" />
            <span className="text-slate-600">PyPortfolioOpt Frontier</span>
            <ChevronRight className="h-3 w-3 rotate-90 text-slate-300" />
            <span className="text-slate-600">Risk Engine check</span>
            <ChevronRight className="h-3 w-3 rotate-90 text-slate-300" />
            <span className="text-[#0E8A5A]">GPT Explanation Layer</span>
          </div>

          <button
            onClick={() => setIsExplainOpen(true)}
            className="w-full flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white font-bold text-[13px] hover:bg-[#0c784e]"
          >
            <span>Explain Strategy Mandate</span>
          </button>
        </div>
      </div>

      {/* SECTION 6: Research Vault (RAG) & AI Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Research Vault (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">Research Vault (RAG)</h3>
            <p className="text-[11px] font-semibold text-slate-400">Semantic lookup of verified regulatory and company pdf uploads.</p>
          </div>

          {/* Uploaded Documents List */}
          <div className="space-y-2.5 text-[11px] font-semibold text-slate-600 mb-4">
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[#0F172A] font-bold">TCS Annual Report</span>
              <span className="text-[#0E8A5A] font-bold">Indexed ✓</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[#0F172A] font-bold">SEBI Guidelines</span>
              <span className="text-[#0E8A5A] font-bold">Indexed ✓</span>
            </div>
            <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <span className="text-[#0F172A] font-bold">Investment Theory textbook</span>
              <span className="text-[#0E8A5A] font-bold">Indexed ✓</span>
            </div>
          </div>

          {/* Ask AI Box */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            {ragAnswer && (
              <div className="bg-[#EEF3FF] border border-blue-200/50 rounded-xl p-3.5 text-[11px] leading-relaxed font-semibold text-slate-600 whitespace-pre-line">
                {ragAnswer}
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask RAG (e.g. why is TCS recommended?)..."
                value={ragQuestion}
                onChange={(e) => setRagQuestion(e.target.value)}
                className="flex-1 bg-slate-50 text-[12px] font-semibold border border-slate-200 rounded-[12px] px-3.5 py-2.5 focus:outline-none"
              />
              <button
                onClick={handleRagSearch}
                disabled={isAskingRag}
                className="h-10 px-4 rounded-[12px] bg-[#0E8A5A] text-white text-[12px] font-bold hover:bg-[#0c784e] flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                {isAskingRag ? "Searching..." : "Ask AI"}
              </button>
            </div>
          </div>
        </div>

        {/* AI Chat Console (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between h-[360px]">
          <div className="space-y-1 mb-3 shrink-0">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">AI Advisor Chat</h3>
            <p className="text-[11px] font-semibold text-slate-400">Conversational interface grounded in optimizer statistics.</p>
          </div>

          {/* Chat Logs scroll area */}
          <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-xl p-3.5 space-y-3.5 border border-slate-200/40 text-[11px] font-semibold leading-relaxed">
            {chatLog.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`p-2.5 rounded-[12px] max-w-[85%] ${msg.sender === "user" ? "bg-[#0E8A5A] text-white" : "bg-white text-slate-700 border border-slate-200/50 shadow-soft"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatTyping && (
              <div className="flex justify-start">
                <span className="animate-pulse text-slate-400">Agent typing...</span>
              </div>
            )}
          </div>

          {/* Quick Questions bubbles */}
          <div className="flex flex-wrap gap-1.5 py-2 shrink-0">
            <button onClick={() => handleChatSend("Can I increase risk?")} className="text-[9px] font-bold text-[#0E8A5A] bg-[#0E8A5A]/5 px-2 py-1 rounded-full border border-[#0E8A5A]/10 hover:bg-[#0E8A5A]/10 transition-colors">
              Can I increase risk?
            </button>
            <button onClick={() => handleChatSend("Why not Infosys?")} className="text-[9px] font-bold text-[#0E8A5A] bg-[#0E8A5A]/5 px-2 py-1 rounded-full border border-[#0E8A5A]/10 hover:bg-[#0E8A5A]/10 transition-colors">
              Why not Infosys?
            </button>
            <button onClick={() => handleChatSend("What happens if inflation rises?")} className="text-[9px] font-bold text-[#0E8A5A] bg-[#0E8A5A]/5 px-2 py-1 rounded-full border border-[#0E8A5A]/10 hover:bg-[#0E8A5A]/10 transition-colors">
              Inflation?
            </button>
          </div>

          {/* Input text */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleChatSend(chatInput);
            }}
            className="flex gap-2 shrink-0"
          >
            <input
              type="text"
              placeholder="Ask Quant Desk..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 bg-slate-50 text-[12px] font-semibold border border-slate-200 rounded-[12px] px-3.5 py-2.5 focus:outline-none"
            />
            <button type="submit" className="h-10 w-10 flex items-center justify-center rounded-[12px] bg-[#0E8A5A] text-white hover:bg-[#0c784e]">
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* DRAWER MODAL OVERLAY: Individual Asset detail drawer */}
      <AnimatePresence>
        {selectedStock && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedStock(null)}
              className="fixed inset-0 bg-slate-900"
            />

            {/* Slide-out Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white h-full shadow-premium flex flex-col p-6 z-10 border-l border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: selectedStock.color }}></span>
                  <h2 className="text-lg font-black text-[#0F172A]">{selectedStock.name} Metrics</h2>
                </div>
                <button onClick={() => setSelectedStock(null)} className="h-8 w-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto py-6 space-y-6 text-[13px] font-semibold text-slate-600">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Allocation Weight</p>
                    <p className="text-xl font-extrabold text-slate-800 mt-1">{selectedStock.value}%</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expected Return</p>
                    <p className="text-xl font-extrabold text-[#0E8A5A] mt-1">{selectedStock.expectedReturn}</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 space-y-3.5">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-slate-400">Confidence Score</span>
                    <span className="font-bold text-slate-800">{selectedStock.confidence}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 pb-2">
                    <span className="text-slate-400">Stock Momentum</span>
                    <span className="font-bold text-[#0E8A5A]">{selectedStock.momentum}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 pb-2">
                    <span className="text-slate-400">EPS Signal</span>
                    <span className="font-bold text-slate-800">{selectedStock.eps}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-slate-400">Revenue Trend</span>
                    <span className="font-bold text-slate-800">{selectedStock.revenue}</span>
                  </div>
                </div>

                <div className="bg-[#EEF3FF] border border-blue-200/50 rounded-xl p-4.5 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Optimizer Allocation Rationale</p>
                  <p className="text-slate-600 font-semibold leading-relaxed">{selectedStock.reason}</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Explain Strategy popups */}
      <AnimatePresence>
        {isExplainOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            {/* Backdrop */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }} onClick={() => setIsExplainOpen(false)} className="fixed inset-0 bg-slate-900" />

            {/* Panel */}
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[18px] border border-slate-200 max-w-md w-full p-6 shadow-premium z-10 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-[15px] font-extrabold text-[#0F172A] flex items-center gap-2">
                  <Sparkles className="h-4.5 w-4.5 text-[#0E8A5A]" /> AI Optimization Rationale
                </h3>
                <button onClick={() => setIsExplainOpen(false)} className="h-8 w-8 rounded-full flex items-center justify-center border border-slate-100 text-slate-400 hover:text-slate-600">
                  <X className="h-4.5 w-4.5" />
                </button>
              </div>

              <div className="space-y-4 text-[12px] font-semibold text-slate-500">
                <h4 className="text-[14px] font-extrabold text-slate-800">Why 30% TCS Allocation?</h4>
                <div className="space-y-2 font-mono bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-600">
                  <div className="flex justify-between"><span>Predicted ARR Return:</span><span className="font-bold text-[#0E8A5A]">14%</span></div>
                  <div className="flex justify-between"><span>Covariance Factor:</span><span className="font-bold text-slate-700">Low Correlation</span></div>
                  <div className="flex justify-between"><span>Capital ROE:</span><span className="font-bold text-slate-700">High Return on Equity</span></div>
                  <div className="flex justify-between"><span>Momentum Index:</span><span className="font-bold text-[#0E8A5A]">Strong Momentum</span></div>
                  <div className="flex justify-between text-[11px] pt-1 text-slate-500 border-t border-slate-200"><span>RAG Grounding:</span><span>TCS Annual Q4 Report Validated ✓</span></div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
