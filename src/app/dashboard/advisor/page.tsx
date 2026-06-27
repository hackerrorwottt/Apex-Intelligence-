"use client";

import { useState, useEffect } from "react";
import {
  Brain,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileDown,
  ShieldCheck,
  CheckCircle,
  Database,
  BarChart3,
  Activity,
  Send,
  RefreshCw,
  Sliders,
  DollarSign,
  AlertTriangle,
  Info,
  Layers,
  ChevronRight,
  LineChart as LineChartIcon,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Historical backtesting comparison data (2019 -> Today)
const backtestData = [
  { year: "2019", Portfolio: 100, Nifty: 100 },
  { year: "2020", Portfolio: 92, Nifty: 82 },
  { year: "2021", Portfolio: 135, Nifty: 115 },
  { year: "2022", Portfolio: 150, Nifty: 130 },
  { year: "2023", Portfolio: 175, Nifty: 152 },
  { year: "2024", Portfolio: 193, Nifty: 171 },
];

export default function AIAdvisor() {
  const [mounted, setMounted] = useState(false);
  
  // Profile Form States
  const [capital, setCapital] = useState("10,00,000");
  const [riskAppetite, setRiskAppetite] = useState("Moderate");
  const [horizon, setHorizon] = useState("5 Years");
  const [goal, setGoal] = useState("Long-Term Wealth");
  const [excludedSectors, setExcludedSectors] = useState<string[]>([]);
  
  // Pipeline Execution States
  const [isRunningPipeline, setIsRunningPipeline] = useState(false);
  const [currentPipelineStep, setCurrentPipelineStep] = useState(0);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([]);
  
  // Simulated Results State
  const [expectedReturn, setExpectedReturn] = useState(14.0);
  const [confidenceScore, setConfidenceScore] = useState(84);
  const [sharpeRatio, setSharpeRatio] = useState(1.53);
  const [volatility, setVolatility] = useState(9.4);
  const [cagr, setCagr] = useState(15.2);
  const [maxDrawdown, setMaxDrawdown] = useState(-12.4);
  const [explanationText, setExplanationText] = useState("");
  
  // Allocation weights
  const [allocations, setAllocations] = useState<any[]>([
    { name: "TCS", value: 30, color: "#0E8A5A" },
    { name: "Infosys (INFY)", value: 20, color: "#0F172A" },
    { name: "Reliance (RELIANCE)", value: 20, color: "#3B82F6" },
    { name: "Nifty ETF (NIFTY_BEES)", value: 20, color: "#F59E0B" },
    { name: "Gold ETF (GOLDBEES)", value: 10, color: "#8B5CF6" },
  ]);

  const pipelineSteps = [
    { title: "Fetch Market Data", desc: "yfinance + Finnhub endpoints called for historical sheets.", detail: "TCS, INFY, RELIANCE historical pricing and fundamentals ingested." },
    { title: "Data Processing", desc: "Pandas and NumPy return normalization and missing row removal.", detail: "Daily return logs compiled; arrays merged." },
    { title: "Feature Engineering", desc: "pandas-ta creates ~45 technical & momentum indicators.", detail: "RSI, MACD, Bollinger Bands and ATR indicators generated." },
    { title: "ML Return Prediction", desc: "XGBoost models predict returns and target volatilities.", detail: "TCS forecasts 14% expected return with 84% accuracy score." },
    { title: "PyPortfolioOpt Frontier", desc: "Markowitz MPT models calculate optimal Sharpe weights.", detail: "Efficient frontier solved for Moderate risk cap constraints." },
    { title: "Risk Analysis Engine", desc: "Value at Risk (VaR), Beta, Sharpe and Sortino ratios computed.", detail: "Sharpe ratio optimized to 1.53; volatility capped at 9.4%." },
    { title: "vectorbt Backtester", desc: "Simulates historical performance from 2019 to Today.", detail: "Win rate calculated; backtest yields +93% vs Nifty +71%." },
    { title: "Decision intelligence Fusion", desc: "Merges ML, RAG context, and News Sentiment.", detail: "RAG context and sentiment tags combined into recommendation." },
  ];

  const fetchOptimization = () => {
    setIsRunningPipeline(true);
    setCurrentPipelineStep(0);
    setPipelineLogs(["[System] Launching Quantitative Enclave..."]);
    
    // Simulate pipeline run
    const interval = setInterval(() => {
      setCurrentPipelineStep((prev) => {
        const next = prev + 1;
        if (next < pipelineSteps.length) {
          setPipelineLogs((logs) => [
            ...logs,
            `[Step ${next}] Completed: ${pipelineSteps[prev].title}`,
            `  ➔ ${pipelineSteps[prev].detail}`
          ]);
          return next;
        } else {
          clearInterval(interval);
          setIsRunningPipeline(false);
          updateResults();
          return prev;
        }
      });
    }, 1100);
  };

  const updateResults = () => {
    // Generate values based on risk Appetite
    if (riskAppetite === "Conservative") {
      setExpectedReturn(9.8);
      setConfidenceScore(89);
      setSharpeRatio(1.85);
      setVolatility(6.2);
      setCagr(10.1);
      setMaxDrawdown(-7.5);
      setAllocations([
        { name: "TCS", value: 15, color: "#0E8A5A" },
        { name: "Infosys (INFY)", value: 10, color: "#0F172A" },
        { name: "Reliance (RELIANCE)", value: 15, color: "#3B82F6" },
        { name: "Nifty ETF (NIFTY_BEES)", value: 30, color: "#F59E0B" },
        { name: "Gold ETF (GOLDBEES)", value: 30, color: "#8B5CF6" },
      ]);
      setExplanationText(
        `Based on your conservative-risk profile, our ML model forecasts an expected annual return of 9.8%. PyPortfolioOpt allocated 30% to Gold ETF and Nifty BEES to maximize stability. Volatility is capped at 6.2% with a Sharpe ratio of 1.85, minimizing drawdown exposure during market contractions.`
      );
    } else if (riskAppetite === "Aggressive") {
      setExpectedReturn(18.5);
      setConfidenceScore(76);
      setSharpeRatio(1.22);
      setVolatility(14.8);
      setCagr(20.4);
      setMaxDrawdown(-19.5);
      setAllocations([
        { name: "TCS", value: 40, color: "#0E8A5A" },
        { name: "Infosys (INFY)", value: 25, color: "#0F172A" },
        { name: "Reliance (RELIANCE)", value: 20, color: "#3B82F6" },
        { name: "Nifty ETF (NIFTY_BEES)", value: 10, color: "#F59E0B" },
        { name: "Gold ETF (GOLDBEES)", value: 5, color: "#8B5CF6" },
      ]);
      setExplanationText(
        `Based on your aggressive-risk profile, our ML model forecasts an expected annual return of 18.5%. PyPortfolioOpt allocated 40% to TCS and 25% to Infosys because it aggressively targets high-beta growth weights. Volatility is modeled at 14.8% with an expected Sharpe ratio of 1.22.`
      );
    } else {
      // Moderate (Default flowchart values)
      setExpectedReturn(14.0);
      setConfidenceScore(84);
      setSharpeRatio(1.53);
      setVolatility(9.4);
      setCagr(15.2);
      setMaxDrawdown(-12.4);
      setAllocations([
        { name: "TCS", value: 30, color: "#0E8A5A" },
        { name: "Infosys (INFY)", value: 20, color: "#0F172A" },
        { name: "Reliance (RELIANCE)", value: 20, color: "#3B82F6" },
        { name: "Nifty ETF (NIFTY_BEES)", value: 20, color: "#F59E0B" },
        { name: "Gold ETF (GOLDBEES)", value: 10, color: "#8B5CF6" },
      ]);
      setExplanationText(
        `Based on your moderate-risk profile, our ML model forecasts an expected annual return of 14%. PyPortfolioOpt allocated 30% to TCS because it maximizes the portfolio's Sharpe Ratio while maintaining acceptable volatility. Fundamental analysis shows strong earnings growth and low debt. This recommendation is further supported by evidence retrieved from TCS's annual report and portfolio management literature.`
      );
    }
  };

  useEffect(() => {
    setMounted(true);
    updateResults();
  }, [riskAppetite]);

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">AI Advisor Desk</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">
            Simulate and optimize your investment profile using machine learning and portfolio optimization.
          </p>
        </div>
        <button
          onClick={fetchOptimization}
          disabled={isRunningPipeline}
          className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white px-5 text-[13px] font-bold shadow-soft hover:bg-[#0c784e] transition-all shrink-0"
        >
          <RefreshCw className={`h-4 w-4 ${isRunningPipeline ? "animate-spin" : ""}`} />
          <span>Execute Optimization Pipeline</span>
        </button>
      </div>

      {/* Grid: Left profile Form, Right Pipeline Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Form (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-5">
          <div className="flex items-center gap-2 mb-2">
            <Sliders className="h-5 w-5 text-[#0E8A5A]" />
            <h3 className="text-[15px] font-extrabold text-[#0F172A] tracking-tight">Investment Profile</h3>
          </div>

          <div className="space-y-4">
            {/* Capital */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capital Mandate</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] font-bold text-slate-500">₹</span>
                <input
                  type="text"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] pl-8 pr-4 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none focus:border-[#0E8A5A]/50"
                />
              </div>
            </div>

            {/* Risk Appetite */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Risk Tolerance</label>
              <select
                value={riskAppetite}
                onChange={(e) => setRiskAppetite(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none focus:border-[#0E8A5A]/50 appearance-none"
              >
                <option value="Conservative">Conservative</option>
                <option value="Moderate">Moderate</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </div>

            {/* Horizon */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Investment Horizon</label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none"
              >
                <option value="1 Year">1 Year</option>
                <option value="3 Years">3 Years</option>
                <option value="5 Years">5 Years</option>
                <option value="10 Years">10 Years</option>
              </select>
            </div>

            {/* Goal */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Objective</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none"
              >
                <option value="Capital Preservation">Capital Preservation</option>
                <option value="Balanced Growth">Balanced Growth</option>
                <option value="Long-Term Wealth">Long-Term Wealth</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchOptimization}
            disabled={isRunningPipeline}
            className="w-full flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white font-bold text-[13px] hover:bg-[#0c784e]"
          >
            <span>Run ML Allocator Engine</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        {/* Pipeline Visualizer (7 cols) */}
        <div className="lg:col-span-7 bg-[#0F172A] text-slate-300 rounded-[18px] p-6 shadow-premium relative flex flex-col justify-between overflow-hidden">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 space-y-4 flex-1">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database className="h-4.5 w-4.5 text-[#0E8A5A]" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Quantitative Pipeline Stream</span>
              </div>
              <span className="text-[11px] font-bold text-slate-500 font-mono">
                {isRunningPipeline ? `Stage ${currentPipelineStep + 1}/8` : "Idle Mode"}
              </span>
            </div>

            {/* Pipeline progress map */}
            <div className="grid grid-cols-4 gap-2.5 py-4">
              {pipelineSteps.slice(0, 4).map((step, idx) => (
                <div
                  key={step.title}
                  className={`rounded-lg p-2 text-center border transition-all duration-300 ${
                    isRunningPipeline && currentPipelineStep === idx
                      ? "border-[#0E8A5A] bg-[#0E8A5A]/10 text-white scale-[1.03]"
                      : isRunningPipeline && currentPipelineStep > idx
                      ? "border-[#0E8A5A]/30 text-[#0E8A5A]"
                      : "border-slate-800 text-slate-500"
                  }`}
                >
                  <p className="text-[10px] font-bold leading-tight">{step.title}</p>
                </div>
              ))}
              {pipelineSteps.slice(4, 8).map((step, idx) => (
                <div
                  key={step.title}
                  className={`rounded-lg p-2 text-center border transition-all duration-300 ${
                    isRunningPipeline && currentPipelineStep === idx + 4
                      ? "border-[#0E8A5A] bg-[#0E8A5A]/10 text-white scale-[1.03]"
                      : isRunningPipeline && currentPipelineStep > idx + 4
                      ? "border-[#0E8A5A]/30 text-[#0E8A5A]"
                      : "border-slate-800 text-slate-500"
                  }`}
                >
                  <p className="text-[10px] font-bold leading-tight">{step.title}</p>
                </div>
              ))}
            </div>

            {/* Live Terminal Log screen */}
            <div className="h-44 bg-slate-950/80 rounded-xl border border-slate-800/80 p-4 font-mono text-[11px] space-y-2 overflow-y-auto leading-relaxed text-slate-400">
              {pipelineLogs.map((log, idx) => (
                <div key={idx} className={log.startsWith("[System]") ? "text-[#0E8A5A]" : "text-slate-300"}>
                  {log}
                </div>
              ))}
              {isRunningPipeline && (
                <div className="flex items-center gap-2 text-slate-500 animate-pulse mt-2">
                  <Loader2 className="h-3 w-3 animate-spin text-[#0E8A5A]" />
                  <span>Processing {pipelineSteps[currentPipelineStep]?.title}...</span>
                </div>
              )}
              {pipelineLogs.length === 0 && (
                <div className="text-slate-600 text-center py-10">
                  Ready. Press "Run ML Allocator Engine" to initialize.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decision Intelligence Results Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Risk / Returns Stats (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0E8A5A] bg-[#0E8A5A]/10 px-2.5 py-1 rounded-full">
              Decision Intelligence Summary
            </span>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Expected Return</p>
                <p className="text-xl font-black text-[#0E8A5A] mt-1">{expectedReturn}% <span className="text-[10px] font-bold text-slate-400">ARR</span></p>
              </div>
              <div className="bg-slate-50 p-4.5 rounded-xl border border-slate-100">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Confidence Score</p>
                <p className="text-xl font-black text-[#0F172A] mt-1">{confidenceScore}%</p>
              </div>
            </div>

            <div className="text-[11px] leading-relaxed text-slate-500 font-semibold space-y-2.5">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Sharpe Ratio (MPT Optimized):</span>
                <span className="font-bold text-[#0F172A]">{sharpeRatio}</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Expected Volatility:</span>
                <span className="font-bold text-slate-700">{volatility}%</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span>Value at Risk (VaR):</span>
                <span className="font-bold text-slate-700">{riskAppetite === "Conservative" ? "3.2%" : "6.8%"}</span>
              </div>
              <div className="flex justify-between">
                <span>CAGR (5-Year Simulated):</span>
                <span className="font-bold text-[#0E8A5A]">{cagr}%</span>
              </div>
            </div>
          </div>

          <div className="bg-[#EEF3FF] border border-blue-200/50 rounded-xl p-3.5 text-[11px] font-semibold text-slate-600 space-y-1">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Info className="h-4 w-4 text-blue-500 shrink-0" /> Retrieve RAG context evidence
            </span>
            <p className="text-slate-500 leading-normal">
              "TCS revenue increased 15% with healthy margins... Diversification across GOLDBEES reduces portfolio covariance factor."
            </p>
          </div>
        </div>

        {/* Charts & Allocations Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-[16px] font-extrabold text-[#0F172A]">Target Asset Allocations</h3>
              <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Optimal weights derived from Modern Portfolio Theory.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            {/* Pie Chart */}
            <div className="h-44 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocations}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {allocations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }}
                    itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}
                    formatter={(val: any) => [`${val}%`, "Allocated"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <p className="text-[16px] font-extrabold text-[#0F172A]">₹{capital}</p>
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Active capital</p>
              </div>
            </div>

            {/* Weights List */}
            <div className="space-y-1.5 text-[11px] font-semibold text-slate-600">
              {allocations.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                    {item.name}
                  </span>
                  <span className="font-bold text-[#0F172A]">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Backtesting chart comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recharts Backtest line chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-1 mb-4">
            <h3 className="text-[16px] font-extrabold text-[#0F172A]">Historical Backtesting (vectorbt)</h3>
            <p className="text-[11px] font-semibold text-slate-400">Cumulative yield simulation comparing strategy returns vs Nifty index (2019-Today).</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={backtestData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }}
                  labelStyle={{ color: "#94a3b8", fontWeight: "bold", fontSize: 10 }}
                  itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Portfolio" stroke="#0E8A5A" strokeWidth={2.5} activeDot={{ r: 6 }} name="Portfolio Strategy (+93%)" />
                <Line type="monotone" dataKey="Nifty" stroke="#94a3b8" strokeWidth={1.5} name="Benchmark Nifty (+71%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Monitoring Alerts (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h3 className="text-[15px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <Activity className="h-4.5 w-4.5 text-[#0E8A5A]" /> Live Platform Monitoring
            </h3>
            
            <div className="space-y-3.5">
              <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-3.5 text-[11px] leading-relaxed">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-amber-800 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Sector Volatility Alert
                  </span>
                  <span className="text-[9px] font-bold text-amber-400">Action Required</span>
                </div>
                <p className="text-slate-600 font-medium">
                  ⚠️ Technology sector volatility increased. Recommendation: Reduce TCS weight by **5%**. Increase Gold ETF (GOLDBEES) by **5%**.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button className="w-full flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white font-bold text-[13px]">
              <span>Apply Live Drift Adjustments</span>
            </button>
          </div>
        </div>
      </div>

      {/* GPT Explanation Layer card */}
      <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-[#0E8A5A]" />
          <h3 className="text-[15px] font-extrabold text-[#0F172A] tracking-tight">GPT Explanation Layer</h3>
        </div>
        <div className="text-[13px] leading-relaxed text-slate-600 font-medium space-y-3">
          <p className="whitespace-pre-line bg-slate-50/50 border border-slate-100 rounded-xl p-4.5">
            {explanationText}
          </p>
        </div>
      </div>
    </div>
  );
}
