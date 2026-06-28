"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Brain,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  Lock,
  Play,
  ArrowRight,
  Sparkles,
  PieChart,
  BarChart3,
  TrendingDown,
  MessageSquare,
  Activity,
  Layers,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#F7F9FC] overflow-x-hidden">
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Decorative Light Background Accents */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-tr from-[#EEF3FF] to-white opacity-60 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-40 left-10 -z-10 h-[300px] w-[300px] rounded-full bg-emerald-500/5 opacity-40 blur-3xl"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero Left Content */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#0E8A5A]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[#0E8A5A]"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Institutional Grade AI
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[46px] font-extrabold tracking-tight text-[#0F172A] leading-[1.1]"
            >
              The Intelligence Layer for Global Finance
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-500 font-medium leading-relaxed max-w-xl"
            >
              Neural-driven portfolio optimization, market intelligence, sentiment analysis, and AI advisory for institutional investors.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link
                href="/login?flow=open-account"
                className="inline-flex h-12 items-center justify-center rounded-[14px] bg-[#0E8A5A] px-7 text-[14px] font-bold text-white shadow-soft transition-all hover:bg-[#0c784e] hover:shadow-premium hover:-translate-y-0.5"
              >
                Open Account
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("demo")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex h-12 items-center justify-center rounded-[14px] border border-slate-200 bg-white px-7 text-[14px] font-bold text-slate-700 shadow-soft transition-all hover:bg-slate-50 hover:-translate-y-0.5 cursor-pointer"
              >
                View Demo
              </button>
            </motion.div>
          </div>

          {/* Hero Right Dashboard Preview */}
          <div className="lg:col-span-7 relative flex justify-center items-center">
            {/* Main Canvas Dashboard container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-full max-w-[620px] rounded-[18px] border border-slate-200 bg-white p-6 shadow-premium relative overflow-hidden"
            >
              {/* Fake top window bar */}
              <div className="flex items-center gap-1.5 pb-4 mb-4 border-b border-slate-100">
                <span className="h-3 w-3 rounded-full bg-red-400"></span>
                <span className="h-3 w-3 rounded-full bg-yellow-400"></span>
                <span className="h-3 w-3 rounded-full bg-emerald-400"></span>
                <span className="ml-3 text-[11px] font-bold text-slate-400">Apex Terminal v4.2 - Portfolio Overview</span>
              </div>

              {/* Performance Graph Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="bg-[#F7F9FC] p-4.5 rounded-[16px] border border-slate-200/50 space-y-3">
                  <div className="flex justify-between items-center">
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Apex Yield Index</p>
                    <span className="text-[11px] font-bold text-[#0E8A5A] bg-[#0E8A5A]/10 px-2 py-0.5 rounded-full">+24.8% YTD</span>
                  </div>
                  <div className="leading-none">
                    <h3 className="text-2xl font-bold tracking-tight text-[#0F172A]">$4,829,190.00</h3>
                    <p className="text-[11px] text-[#0E8A5A] font-semibold mt-1">▲ +$32,490 (0.68%) Today</p>
                  </div>
                  {/* Miniature SVG Chart */}
                  <div className="h-16 w-full pt-2">
                    <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0E8A5A" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#0E8A5A" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d="M0,25 Q15,22 30,12 T60,18 T90,2 T100,5"
                        fill="none"
                        stroke="#0E8A5A"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M0,25 Q15,22 30,12 T60,18 T90,2 T100,5 L100,30 L0,30 Z"
                        fill="url(#chartGrad)"
                      />
                    </svg>
                  </div>
                </div>

                {/* Portfolio Optimization donut chart representation */}
                <div className="bg-[#F7F9FC] p-4.5 rounded-[16px] border border-slate-200/50 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider">Asset Allocation</p>
                    <PieChart className="h-4.5 w-4.5 text-slate-400" />
                  </div>
                  <div className="flex items-center gap-4">
                    {/* SVG Donut */}
                    <div className="h-16 w-16 shrink-0 relative flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#E2E8F0" strokeWidth="3" />
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#0E8A5A" strokeWidth="3.2" strokeDasharray="45 100" />
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#0F172A" strokeWidth="3" strokeDasharray="30 100" strokeDashoffset="-45" />
                        <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3B82F6" strokeWidth="3" strokeDasharray="25 100" strokeDashoffset="-75" />
                      </svg>
                      <div className="absolute text-[10px] font-extrabold text-[#0F172A]">AI</div>
                    </div>
                    {/* Legend */}
                    <div className="text-[11px] font-semibold space-y-1 text-slate-600 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#0E8A5A]"></span>Equities</span>
                        <span className="font-bold text-slate-800">45%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#0F172A]"></span>Bonds</span>
                        <span className="font-bold text-slate-800">30%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>Digital</span>
                        <span className="font-bold text-slate-800">25%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Table Preview */}
              <div className="bg-slate-50 border border-slate-200/40 rounded-[16px] overflow-hidden text-[11px] font-semibold text-slate-600">
                <div className="bg-slate-100/80 px-4 py-2 text-[10px] uppercase font-bold text-slate-400 tracking-wider flex justify-between">
                  <span>Target Assets</span>
                  <span>Weight & P&L</span>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="px-4 py-2.5 flex justify-between items-center hover:bg-slate-100/30 transition-colors">
                    <span className="font-bold text-[#0F172A]">SPY (S&P 500 Index)</span>
                    <div className="flex items-center gap-4">
                      <span>45.0%</span>
                      <span className="text-[#0E8A5A] font-bold">+$12,490</span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between items-center hover:bg-slate-100/30 transition-colors">
                    <span className="font-bold text-[#0F172A]">BTC (Bitcoin Core)</span>
                    <div className="flex items-center gap-4">
                      <span>15.0%</span>
                      <span className="text-[#0E8A5A] font-bold">+$8,920</span>
                    </div>
                  </div>
                  <div className="px-4 py-2.5 flex justify-between items-center hover:bg-slate-100/30 transition-colors">
                    <span className="font-bold text-[#0F172A]">GLD (SPDR Gold Trust)</span>
                    <div className="flex items-center gap-4">
                      <span>10.0%</span>
                      <span className="text-slate-400 font-bold">+$0.00</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Soft Floating Cards */}
            {/* Card 1: NLP Sentiment Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{
                opacity: 1,
                x: 0,
                y: [0, -10, 0]
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.4 },
                x: { duration: 0.6, delay: 0.4 },
                y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }
              }}
              className="absolute -right-4 top-10 bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-[18px] p-4.5 shadow-premium max-w-[210px] hidden sm:block pointer-events-none hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#0E8A5A]">
                  <Brain className="h-4 w-4" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">NLP Sentiment</span>
              </div>
              <p className="text-[13px] font-bold text-slate-800 leading-tight">Strong Institutional Buying Signal detected in SPX</p>
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#0E8A5A] bg-[#0E8A5A]/10 px-2 py-0.5 rounded-full">Score: 78.4</span>
                <span className="text-[10px] text-slate-400">92% confidence</span>
              </div>
            </motion.div>

            {/* Card 2: Risk Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{
                opacity: 1,
                y: [0, 8, 0]
              }}
              transition={{
                opacity: { duration: 0.6, delay: 0.5 },
                y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1.2 }
              }}
              className="absolute -left-6 bottom-4 bg-[#0F172A] text-white rounded-[18px] p-4.5 shadow-premium min-w-[220px] hidden sm:block pointer-events-none hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4.5 w-4.5 text-[#0E8A5A]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Risk Model - Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-left">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Volatility</p>
                  <p className="text-[13px] font-bold text-slate-200">11.4% (Low)</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">Sharpe Ratio</p>
                  <p className="text-[13px] font-bold text-[#0E8A5A]">2.14</p>
                </div>
                <div className="col-span-2">
                  <div className="w-full bg-slate-800 rounded-full h-1 mt-1">
                    <div className="bg-[#0E8A5A] h-1 rounded-full w-[78%]"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. TRUST SECTION */}
      <section className="bg-white border-y border-slate-200/50 py-16 px-6 lg:px-8 w-full">
        <div className="max-w-7xl mx-auto flex flex-col items-center">
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 text-center mb-8">
            Trusted by the Vanguard of Capital Management
          </p>

          {/* Logo grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 items-center justify-center w-full max-w-4xl text-center opacity-70 mb-12">
            <span className="text-[17px] font-extrabold tracking-tight text-slate-500">Metro <span className="font-semibold text-slate-400">Capital</span></span>
            <span className="text-[17px] font-black tracking-tight text-slate-500">EQUITY <span className="font-light">STRAT</span></span>
            <span className="text-[17px] font-bold tracking-tight text-slate-500">Finance.io</span>
            <span className="text-[17px] font-extrabold tracking-tight text-slate-500">VERTEX <span className="font-medium text-[#0E8A5A]">ASSET</span></span>
          </div>

          <div className="w-full border-t border-slate-100 pt-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 max-w-4xl mx-auto text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
              <div className="py-4 md:py-0">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A]">$1.2B+</h3>
                <p className="text-[13px] font-semibold text-slate-500 mt-2">Assets Analyzed</p>
              </div>
              <div className="py-4 md:py-0">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0E8A5A]">50K+</h3>
                <p className="text-[13px] font-semibold text-slate-500 mt-2">Daily Predictions</p>
              </div>
              <div className="py-4 md:py-0">
                <h3 className="text-3xl sm:text-4xl font-extrabold text-[#0F172A]">99.9%</h3>
                <p className="text-[13px] font-semibold text-slate-500 mt-2">Infrastructure Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES SECTION */}
      <section id="features" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#0E8A5A] bg-[#0E8A5A]/10 px-3 py-1 rounded-full">Core Technologies</span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#0F172A]">Next-Gen Investment Infrastructure</h2>
          <p className="text-[15px] font-semibold text-slate-500 leading-relaxed">
            Harness proprietary natural language processing and advanced mathematical optimization models built for professional desks.
          </p>
        </div>

        {/* Exactly 3 Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            whileHover={{ y: -6 }}
            transition={{
              opacity: { duration: 0.5 },
              y: { type: "spring", stiffness: 300, damping: 20 },
              default: { duration: 0.5, delay: 0.1 }
            }}
            className="bg-white rounded-[18px] border border-slate-200/80 p-8 shadow-soft flex flex-col justify-between hover:shadow-premium group transition-all"
          >
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#0E8A5A]/10 text-[#0E8A5A] group-hover:scale-110 transition-transform duration-300">
                <PieChart className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[18px] font-extrabold text-[#0F172A] tracking-tight">AI Portfolio Optimization</h3>
                <p className="text-[14px] leading-relaxed text-slate-500 font-medium">
                  Dynamic rebalancing using AI optimization models. Automatically calculate the efficient frontier based on systemic volatility changes and target risk tolerance metrics.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100">
              <Link href="/dashboard/portfolio" className="text-[12px] font-bold text-[#0E8A5A] inline-flex items-center gap-1 hover:gap-2 transition-all">
                Test Allocation Frontier <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            whileHover={{ y: -6 }}
            transition={{
              opacity: { duration: 0.5 },
              y: { type: "spring", stiffness: 300, damping: 20 },
              default: { duration: 0.5, delay: 0.2 }
            }}
            className="bg-white rounded-[18px] border border-slate-200/80 p-8 shadow-soft flex flex-col justify-between hover:shadow-premium group transition-all"
          >
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#0E8A5A]/10 text-[#0E8A5A] group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[18px] font-extrabold text-[#0F172A] tracking-tight">Market Sentiment Engine</h3>
                <p className="text-[14px] leading-relaxed text-slate-500 font-medium">
                  Real-time NLP-based institutional sentiment. Crawl and analyze financial transcripts, macro announcements, and institutional flows to compile live market indicators.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100">
              <Link href="/dashboard/markets" className="text-[12px] font-bold text-[#0E8A5A] inline-flex items-center gap-1 hover:gap-2 transition-all">
                Explore Sentiment Heatmap <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            whileHover={{ y: -6 }}
            transition={{
              opacity: { duration: 0.5 },
              y: { type: "spring", stiffness: 300, damping: 20 },
              default: { duration: 0.5, delay: 0.3 }
            }}
            className="bg-white rounded-[18px] border border-slate-200/80 p-8 shadow-soft flex flex-col justify-between hover:shadow-premium group transition-all"
          >
            <div className="space-y-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-[14px] bg-[#0E8A5A]/10 text-[#0E8A5A] group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-[18px] font-extrabold text-[#0F172A] tracking-tight">24/7 AI Strategy Assistant</h3>
                <p className="text-[14px] leading-relaxed text-slate-500 font-medium">
                  Always-on AI advisor with conversational investment insights. Instantly query allocation scenarios, asset covariance matrices, and risk factors using plain language.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100">
              <Link href="/dashboard/advisor" className="text-[12px] font-bold text-[#0E8A5A] inline-flex items-center gap-1 hover:gap-2 transition-all">
                Chat With Advisor <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 4. VIDEO SECTION */}
      <section id="demo" className="py-16 bg-white w-full border-y border-slate-200/50 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A]">Transcend Traditional Quantitative Analysis</h2>
            <p className="text-[14px] font-semibold text-slate-500 max-w-xl mx-auto">
              Watch a quick 2-minute overview of the Apex platform interfaces, model configurations, and custom report exporters.
            </p>
          </div>

          {/* Large rounded video card */}
          <div className="relative group rounded-[18px] overflow-hidden shadow-lift border border-slate-200 aspect-[16/9] w-full bg-[#0F172A]">
            {/* Dummy Thumbnail */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(14,138,90,0.15)_0%,rgba(15,23,42,1)_100%)] flex items-center justify-center">
              <div className="text-left space-y-4 max-w-lg px-8">
                <div className="flex items-center gap-2 justify-center opacity-85">
                  <div className="h-6 w-6 rounded bg-[#0E8A5A] flex items-center justify-center text-white"><TrendingUp className="h-3.5 w-3.5" /></div>
                  <span className="text-[12px] font-bold text-slate-300 uppercase tracking-widest">Apex Advisor Platform Demo</span>
                </div>
                <div className="border border-slate-800 rounded-xl p-4 bg-slate-900/60 backdrop-blur-md text-center flex flex-col items-center">
                  <Activity className="h-6 w-6 text-[#0E8A5A] animate-pulse mb-2" />
                  <p className="text-[11px] font-mono text-slate-400">CONNECTING TO QUANT FRONT-END PIPELINE...</p>
                  <p className="text-[10px] text-slate-500 mt-1">Status: Simulated Client Node Active</p>
                </div>
              </div>
            </div>

            {/* Pulsing Play Button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="h-16 w-16 flex items-center justify-center rounded-full bg-[#0E8A5A] text-white shadow-lift transition-all hover:bg-[#0c784e] hover:scale-110 active:scale-95 duration-250 relative z-10 group-hover:shadow-[0_0_30px_rgba(14,138,90,0.5)]"
              >
                <Play className="h-6 w-6 fill-current translate-x-0.5" />
              </button>
            </div>

            {/* Glowing effect frame */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#0E8A5A]/30 transition-colors pointer-events-none rounded-[18px]" />
          </div>
        </div>
      </section>

      {/* 5. WHY CHOOSE APEX */}
      <section id="why-choose-apex" className="py-24 px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column: Benefits list */}
          <div className="space-y-8 text-left">
            <div className="space-y-4">
              <span className="inline-block text-[13px] font-extrabold uppercase tracking-widest text-[#0E8A5A] bg-[#0E8A5A]/10 px-5 py-2 rounded-full shadow-soft">Why Choose Apex</span>
              <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#0F172A] leading-[1.15]">
                Institutional-grade investment intelligence, built for everyday investors.
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-6 pt-2">
              <div className="flex gap-4 items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-[#0E8A5A]">
                  <TrendingUp className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#0F172A]">AI Portfolio Optimization</h4>
                  <p className="text-[13px] text-slate-500 font-semibold mt-1">ML-driven return prediction and mathematical allocation.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-[#0E8A5A]">
                  <Brain className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#0F172A]">Explainable Recommendations</h4>
                  <p className="text-[13px] text-slate-500 font-semibold mt-1">Understand every investment decision with transparent AI.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-[#0E8A5A]">
                  <ShieldCheck className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#0F172A]">Advanced Risk Analytics</h4>
                  <p className="text-[13px] text-slate-500 font-semibold mt-1">Sharpe Ratio, Beta, VaR, Volatility, and Drawdown.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-[#0E8A5A]">
                  <Layers className="h-5.5 w-5.5" />
                </div>
                <div>
                  <h4 className="text-[15px] font-extrabold text-[#0F172A]">Research-Driven Insights</h4>
                  <p className="text-[13px] text-slate-500 font-semibold mt-1">Ground every recommendation using annual reports, SEBI guidelines, and financial literature through RAG.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Animated Architecture Graphic */}
          <div className="flex justify-center items-center w-full">
            <div className="bg-[#0F172A] w-full max-w-[420px] rounded-[18px] border border-slate-800 p-6 shadow-premium relative overflow-hidden text-slate-300">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              <div className="flex items-center gap-1.5 pb-4 mb-4 border-b border-slate-800 relative z-10">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-yellow-400"></span>
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400"></span>
                <span className="ml-2 text-[10px] font-mono font-bold text-slate-500">APEX_CORE_ARCHITECTURE.SH</span>
              </div>

              {/* Architecture flowchart nodes */}
              <div className="relative space-y-5 z-10">
                {/* Node 1 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3"
                >
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-[#0E8A5A] font-bold text-[13px]">
                    1
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-extrabold text-white uppercase tracking-wider">User Risk Mandate</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Capital, Goal, & Sector preferences constraints</p>
                  </div>
                </motion.div>

                {/* Connecting Line 1 */}
                <div className="h-5 flex justify-center">
                  <div className="w-0.5 bg-gradient-to-b from-[#0E8A5A] to-blue-500 h-full relative">
                    <motion.div
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#0E8A5A] shadow-[0_0_8px_#34d399]"
                    />
                  </div>
                </div>

                {/* Node 2 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3"
                >
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 font-bold text-[13px]">
                    2
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-extrabold text-white uppercase tracking-wider">XGBoost ML Return Models</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Evaluates covariance factors and target forecast metrics</p>
                  </div>
                </motion.div>

                {/* Connecting Line 2 */}
                <div className="h-5 flex justify-center">
                  <div className="w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 h-full relative">
                    <motion.div
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 0.5 }}
                      className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa]"
                    />
                  </div>
                </div>

                {/* Node 3 */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 flex items-center gap-3"
                >
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 font-bold text-[13px]">
                    3
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-extrabold text-white uppercase tracking-wider">Markowitz Efficient Frontier</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">PyPortfolioOpt quadratic solver computes allocation weights</p>
                  </div>
                </motion.div>

                {/* Connecting Line 3 */}
                <div className="h-5 flex justify-center">
                  <div className="w-0.5 bg-gradient-to-b from-purple-500 to-[#0E8A5A] h-full relative">
                    <motion.div
                      animate={{ y: [0, 20, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: 1 }}
                      className="absolute left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"
                    />
                  </div>
                </div>

                {/* Node 4 */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.6 }}
                  className="bg-slate-900/80 border border-[#0E8A5A]/30 rounded-xl p-3.5 flex items-center gap-3 shadow-[0_0_15px_rgba(14,138,90,0.1)]"
                >
                  <div className="h-7 w-7 rounded-lg bg-[#0E8A5A]/20 flex items-center justify-center text-[#0E8A5A] font-bold text-[13px] relative">
                    <span className="absolute inset-0 bg-[#0E8A5A]/30 rounded-lg animate-ping" />
                    4
                  </div>
                  <div className="text-left">
                    <p className="text-[11px] font-extrabold text-white uppercase tracking-wider">RAG Verification Enclave</p>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Validates guidelines compliance & grounds decision with literature</p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="py-16 px-6 lg:px-8 w-full">
        <div className="max-w-5xl mx-auto rounded-[18px] bg-gradient-to-r from-[#0F172A] to-[#0E8A5A] p-12 text-center text-white shadow-lift relative overflow-hidden">
          {/* Grid visual overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Ready to Transcend the Market?</h2>
            <p className="text-slate-300 font-semibold text-[14px] leading-relaxed">
              Deploy our proprietary NLP sentiment pipelines and multi-factor portfolio rebalancer today. Setup in under 5 minutes with sovereign database hosting.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link
                href="/login?flow=open-account"
                className="inline-flex h-12 items-center justify-center rounded-[14px] bg-white px-7 text-[14px] font-bold text-[#0F172A] hover:bg-slate-50 transition-all hover:-translate-y-0.5"
              >
                Open Account
              </Link>
              <Link
                href="#"
                className="inline-flex h-12 items-center justify-center rounded-[14px] border border-white/20 bg-white/5 px-7 text-[14px] font-bold text-white hover:bg-white/10 transition-all hover:-translate-y-0.5"
              >
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
