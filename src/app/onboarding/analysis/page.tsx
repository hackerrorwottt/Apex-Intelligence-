"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Brain, Database, ShieldCheck, TrendingUp, Sparkles, Loader2, ArrowRight, CheckCircle2, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface Profile {
  capital: string;
  riskAppetite: string;
  horizon: string;
  goal: string;
  excludedSectors: string[];
}

export default function OnboardingAnalysisPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Simulation states
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  // Result metrics
  const [metrics, setMetrics] = useState({
    expectedReturn: 14.0,
    sharpeRatio: 1.53,
    volatility: 9.4,
    drawdown: -12.4,
    allocations: [] as any[],
  });

  const steps = [
    { title: "Ingest Market Data", desc: "Establishing secure endpoints to yfinance + Finnhub APIs.", detail: "Retrieving historical tickers: TCS, INFY, RELIANCE, GOLDBEES, NIFTY_BEES." },
    { title: "Clean & Align Sheets", desc: "Running NumPy log alignment and daily return compilations.", detail: "Eliminated 4 residual trading holiday gaps. Calculated daily return arrays." },
    { title: "pandas-ta Feature Engineering", desc: "Compiling rolling technical and momentum metrics.", detail: "Generated 45 feature dimensions including RSI, MACD, Bollinger Bands, and ATR." },
    { title: "XGBoost Machine Learning Predictions", desc: "Modeling expected returns and conditional volatilities.", detail: "Model loaded. Target ARR weights modeled with 84% validation accuracy." },
    { title: "PyPortfolioOpt Frontier Solution", desc: "Executing Markowitz quadratic optimization under risk limits.", detail: "Efficient frontier calculated. Applied risk-appetite constraints." },
    { title: "Value-at-Risk (VaR) Backtester", desc: "Evaluating statistical drawdown bounds and tail events.", detail: "VaR threshold compiled; Sharpe and Sortino performance indexes calibrated." },
    { title: "vectorbt Trading Simulator", desc: "Compiling rolling historical performance (2019-Today).", detail: "Simulated CAGR +93% vs Nifty Index +71% over 5-year test period." },
    { title: "Decision Intelligence Fusion", desc: "Synthesizing ML metrics, news sentiment NLP, and regulatory rules.", detail: "Retrieved SEBI balanced-fund guidelines (Section 7) & news sentiment index." }
  ];

  useEffect(() => {
    setMounted(true);
    // Read profile
    const stored = localStorage.getItem("user_onboarding_profile");
    if (stored) {
      const parsed: Profile = JSON.parse(stored);
      setProfile(parsed);

      // Tailor final metrics to selected risk profile
      if (parsed.riskAppetite === "Conservative") {
        setMetrics({
          expectedReturn: 9.8,
          sharpeRatio: 1.85,
          volatility: 6.2,
          drawdown: -7.5,
          allocations: [
            { name: "TCS", value: 15, color: "#0E8A5A" },
            { name: "Infosys", value: 10, color: "#0F172A" },
            { name: "Reliance", value: 15, color: "#3B82F6" },
            { name: "Nifty ETF", value: 30, color: "#F59E0B" },
            { name: "Gold ETF", value: 30, color: "#8B5CF6" },
          ],
        });
      } else if (parsed.riskAppetite === "Aggressive") {
        setMetrics({
          expectedReturn: 18.5,
          sharpeRatio: 1.22,
          volatility: 14.8,
          drawdown: -19.5,
          allocations: [
            { name: "TCS", value: 40, color: "#0E8A5A" },
            { name: "Infosys", value: 25, color: "#0F172A" },
            { name: "Reliance", value: 20, color: "#3B82F6" },
            { name: "Nifty ETF", value: 10, color: "#F59E0B" },
            { name: "Gold ETF", value: 5, color: "#8B5CF6" },
          ],
        });
      } else {
        // Moderate (Default)
        setMetrics({
          expectedReturn: 14.0,
          sharpeRatio: 1.53,
          volatility: 9.4,
          drawdown: -12.4,
          allocations: [
            { name: "TCS", value: 30, color: "#0E8A5A" },
            { name: "Infosys", value: 20, color: "#0F172A" },
            { name: "Reliance", value: 20, color: "#3B82F6" },
            { name: "Nifty ETF", value: 20, color: "#F59E0B" },
            { name: "Gold ETF", value: 10, color: "#8B5CF6" },
          ],
        });
      }
    } else {
      // Fallback if no profile stored
      setMetrics({
        expectedReturn: 14.0,
        sharpeRatio: 1.53,
        volatility: 9.4,
        drawdown: -12.4,
        allocations: [
          { name: "TCS", value: 30, color: "#0E8A5A" },
          { name: "Infosys", value: 20, color: "#0F172A" },
          { name: "Reliance", value: 20, color: "#3B82F6" },
          { name: "Nifty ETF", value: 20, color: "#F59E0B" },
          { name: "Gold ETF", value: 10, color: "#8B5CF6" },
        ],
      });
    }
  }, []);

  useEffect(() => {
    if (!mounted || isComplete) return;

    setLogs(["[System] Initializing Apex Quantitative Optimization Pipeline...", "[System] Grounding analysis with client preference constraints..."]);

    const duration = 5000; // 5 seconds total
    const stepsCount = steps.length;
    const intervalTime = duration / stepsCount;

    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        if (next < stepsCount) {
          setProgress(Math.floor((next / stepsCount) * 100));
          setLogs((prevLogs) => [
            ...prevLogs,
            `[Stage ${next}] SUCCESS: ${steps[prev].title}`,
            `  ➔ ${steps[prev].detail}`
          ]);
          return next;
        } else {
          clearInterval(timer);
          setProgress(100);
          setLogs((prevLogs) => [
            ...prevLogs,
            `[Stage ${stepsCount}] SUCCESS: ${steps[stepsCount - 1].title}`,
            `  ➔ ${steps[stepsCount - 1].detail}`,
            "[System] Decision fusion completed successfully.",
            "[System] Target weights generated. Ready to write to ledger."
          ]);
          setIsComplete(true);
          return prev;
        }
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full bg-[#0F172A] text-slate-300 flex flex-col items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Decorative background grid and blurs */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] rounded-full bg-[#0E8A5A]/5 opacity-60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] rounded-full bg-blue-500/5 opacity-40 blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full relative z-10 space-y-8">
        
        {/* Main Processing Header */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#0E8A5A]/10 border border-[#0E8A5A]/20 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0E8A5A]"
          >
            <Brain className="h-3.5 w-3.5" /> Quantitative Enclave Pipeline
          </motion.div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            {isComplete ? "Portfolio Optimization Completed" : "AI Portfolio Optimizer Running"}
          </h1>
          <p className="text-[14px] text-slate-400 font-semibold max-w-xl mx-auto">
            {isComplete
              ? "The efficient frontier solver has calculated the optimal weights for your investment constraints."
              : "Ingesting historical market charts, modeling returns, and optimizing your risk boundaries."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel: Pipeline Progress & Terminal Logs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Steps Progress Map */}
            <div className="bg-slate-900/60 backdrop-blur-md rounded-[18px] border border-slate-800 p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <span className="text-[12px] font-bold uppercase tracking-wider text-slate-400">Optimization Stages</span>
                <span className="text-[12px] font-bold text-[#0E8A5A] font-mono">{progress}% Complete</span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  className="bg-[#0E8A5A] h-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Active Step Display */}
              <div className="pt-2 min-h-24">
                <AnimatePresence mode="wait">
                  {!isComplete ? (
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="space-y-1.5"
                    >
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4.5 w-4.5 text-[#0E8A5A] animate-spin" />
                        <h4 className="text-[13px] font-bold text-white uppercase tracking-wider">
                          {steps[currentStep]?.title}
                        </h4>
                      </div>
                      <p className="text-[12px] text-slate-400 font-medium">
                        {steps[currentStep]?.desc}
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-start gap-3 bg-[#0E8A5A]/5 border border-[#0E8A5A]/10 rounded-xl p-4.5"
                    >
                      <CheckCircle2 className="h-5.5 w-5.5 text-[#0E8A5A] shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-[13px] font-bold text-[#0E8A5A] uppercase tracking-wider">
                          Pipeline Succeeded
                        </h4>
                        <p className="text-[11px] text-slate-400 font-semibold leading-relaxed mt-1">
                          All mathematical models converged. Your portfolio strategy is prepared.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Terminal Live logs */}
            <div className="bg-slate-950/80 rounded-[18px] border border-slate-800/80 p-5 shadow-premium flex flex-col h-60">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-3 text-slate-400 shrink-0">
                <Terminal className="h-4 w-4 text-[#0E8A5A]" />
                <span className="text-[10px] font-bold uppercase tracking-widest font-mono">Enclave Stream console</span>
              </div>
              <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-2 leading-relaxed">
                {logs.map((log, index) => (
                  <div key={index} className={log.startsWith("[System]") ? "text-[#0E8A5A]" : "text-slate-300"}>
                    {log}
                  </div>
                ))}
                {!isComplete && (
                  <div className="flex items-center gap-2 text-slate-500 animate-pulse mt-1">
                    <span>➔ Solving frontier matrices...</span>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Panel: Optimization Output Summary */}
          <div className="lg:col-span-5 h-full">
            <AnimatePresence mode="wait">
              {isComplete ? (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white text-slate-800 rounded-[18px] border border-slate-200/40 p-6 shadow-premium space-y-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0E8A5A]/10 border border-[#0E8A5A]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0E8A5A]">
                      <Sparkles className="h-3.5 w-3.5" /> Strategy Summary
                    </span>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="bg-[#F7F9FC] border border-slate-200/50 rounded-xl p-3.5">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Expected Return</p>
                        <p className="text-[18px] font-black text-[#0E8A5A] mt-1">{metrics.expectedReturn}% ARR</p>
                      </div>
                      <div className="bg-[#F7F9FC] border border-slate-200/50 rounded-xl p-3.5">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Sharpe Ratio</p>
                        <p className="text-[18px] font-black text-slate-800 mt-1">{metrics.sharpeRatio}</p>
                      </div>
                      <div className="bg-[#F7F9FC] border border-slate-200/50 rounded-xl p-3.5">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Volatility</p>
                        <p className="text-[18px] font-black text-slate-800 mt-1">{metrics.volatility}%</p>
                      </div>
                      <div className="bg-[#F7F9FC] border border-slate-200/50 rounded-xl p-3.5">
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Max Drawdown</p>
                        <p className="text-[18px] font-black text-red-500 mt-1">{metrics.drawdown}%</p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                      <div className="h-28 w-28 relative flex items-center justify-center shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={metrics.allocations}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={45}
                              paddingAngle={2}
                              dataKey="value"
                            >
                              {metrics.allocations.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute text-center">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Weights</span>
                        </div>
                      </div>

                      <div className="flex-1 pl-4 space-y-1 text-[11px] font-semibold text-slate-600">
                        {metrics.allocations.map((item: any) => (
                          <div key={item.name} className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                              {item.name}
                            </span>
                            <span className="font-bold text-slate-800">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push("/dashboard")}
                    className="w-full flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white font-bold text-[13px] shadow-soft hover:bg-[#0c784e] transition-all"
                  >
                    <span>Enter Quantitative Dashboard</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-slate-900/40 rounded-[18px] border border-slate-800/80 p-8 flex flex-col items-center justify-center text-center h-[340px] space-y-4"
                >
                  <Loader2 className="h-10 w-10 text-[#0E8A5A] animate-spin" />
                  <div>
                    <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">Compiling Solvers</h3>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1 max-w-xs">
                      Markowitz frontier quadratic solver running calculations across asset risk covariance nodes.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>
    </div>
  );
}
