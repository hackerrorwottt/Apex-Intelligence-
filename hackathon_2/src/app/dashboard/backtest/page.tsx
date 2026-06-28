"use client";

import { useState, useEffect } from "react";
import { Play, Calendar, RefreshCw, Info } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import Link from "next/link";

export default function BacktestPage() {
  const [mounted, setMounted] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRunSimulation, setHasRunSimulation] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Form State
  const [selectedStartYear, setSelectedStartYear] = useState("2016");
  const [selectedFrequency, setSelectedFrequency] = useState("Monthly");

  // Output State
  const [chartData, setChartData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const sid = localStorage.getItem("apex_session_id");
    if (sid) {
      setSessionId(sid);
    }
  }, []);

  const runSimulation = async () => {
    if (!sessionId) return;
    
    setIsSimulating(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      // Run the backtest using our actual backend
      const res = await fetch(`${API_BASE}/api/backtest/${sessionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookback_years: 5 }) // Fixed to Kaggle dataset timeline
      });

      if (res.ok) {
        const json = await res.json();
        const bt = json.backtest;
        
        // Transform the backend timeseries data into Recharts format
        if (bt.timeseries) {
          const dates = Object.keys(bt.timeseries);
          const newChartData = dates.map(d => ({
            date: new Date(d).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            "Portfolio Value": bt.timeseries[d],
          }));
          setChartData(newChartData);
        }
        
        if (bt.metrics) {
          setMetrics(bt.metrics);
        }
        
        setHasRunSimulation(true);
      } else {
        console.error("Backtest failed on backend.");
      }
    } catch (e) {
      console.error("Failed to run backtest simulation:", e);
    } finally {
      setIsSimulating(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200 pb-16">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">Backtesting Sandbox</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">Simulate historical strategies using actual market data.</p>
        </div>
        <button 
          onClick={runSimulation}
          disabled={isSimulating}
          className="flex h-11 items-center justify-center gap-2 rounded-[14px] bg-[#0E8A5A] text-white px-5 text-[13px] font-bold shadow-soft hover:bg-[#0c784e] disabled:opacity-75"
        >
          {isSimulating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              <span>Run Backtest Engine</span>
            </>
          )}
        </button>
      </div>

      {/* Settings Row */}
      <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col lg:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-2 shrink-0">
          <Calendar className="h-6 w-6 text-[#0E8A5A]" />
          <h3 className="text-[16px] font-extrabold text-[#0F172A]">Historical Configurations</h3>
        </div>

        <div className="flex flex-1 w-full gap-6">
          <div className="flex-1 space-y-1.5 max-w-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Simulation Year</label>
            <select
              value={selectedStartYear}
              onChange={(e) => setSelectedStartYear(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none"
            >
              <option value="2016">2016 (Dataset Start)</option>
            </select>
          </div>

          <div className="flex-1 space-y-1.5 max-w-xs">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rebalancing Frequency</label>
            <select
              value={selectedFrequency}
              onChange={(e) => setSelectedFrequency(e.target.value)}
              className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none"
            >
              <option value="Monthly">Monthly Drift Target</option>
              <option value="Quarterly">Quarterly Sharpe Re-run</option>
              <option value="Daily">Daily Threshold Trigger</option>
            </select>
          </div>
        </div>

        <div className="bg-[#EEF3FF] border border-blue-200/50 rounded-xl p-3.5 text-[11px] font-semibold text-slate-600 flex items-center gap-2.5 max-w-sm">
          <Info className="h-4.5 w-4.5 text-blue-500 shrink-0" />
          <span>Simulates transaction costs of 0.1% per rebalance trade to preserve accuracy.</span>
        </div>
      </div>

      {/* Main Chart Container */}
      <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between h-[600px] w-full">
        <h3 className="text-[16px] font-extrabold text-[#0F172A] mb-4">Historical Performance Trajectory</h3>

        {!hasRunSimulation ? (
          <div className="flex flex-col h-full items-center justify-center rounded-[18px] border border-dashed border-slate-200 bg-slate-50 text-center text-slate-500 text-sm font-semibold">
            {!sessionId ? (
              <>
                <p className="mb-4 text-slate-500 font-semibold max-w-sm">You need an active portfolio to run a backtest. Build one with the AI Advisor first.</p>
                <Link href="/dashboard/advisor" className="px-6 py-3 bg-[#0E8A5A] text-white rounded-[14px] text-[13px] font-bold hover:bg-[#0c784e] shadow-soft">
                  Go to AI Advisor
                </Link>
              </>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Play className="h-8 w-8 ml-1" />
                </div>
                <p>Run the backtest engine to simulate historical portfolio performance and benchmark against the market.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full w-full flex flex-col">
            
            {/* Metrics Top Bar */}
            {metrics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 shrink-0">
                <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Total Return</p>
                  <p className="text-2xl font-black text-[#0E8A5A]">+{metrics.total_return_pct}%</p>
                </div>
                <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">CAGR</p>
                  <p className="text-2xl font-black text-[#0F172A]">{metrics.cagr_pct}%</p>
                </div>
                <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Max Drawdown</p>
                  <p className="text-2xl font-black text-rose-500">{metrics.max_drawdown_pct}%</p>
                </div>
                <div className="bg-slate-50 rounded-[14px] p-4 border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Sharpe Ratio</p>
                  <p className="text-2xl font-black text-blue-600">{metrics.sharpe_ratio}</p>
                </div>
              </div>
            )}
            
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: "#94a3b8", fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                    minTickGap={40}
                  />
                  <YAxis 
                    tick={{ fill: "#94a3b8", fontSize: 11 }} 
                    axisLine={false} 
                    tickLine={false}
                    tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
                    width={60}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "12px", color: "#fff" }}
                    itemStyle={{ fontWeight: "bold", fontSize: "14px" }}
                    formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Portfolio Value"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="Portfolio Value" 
                    stroke="#0E8A5A" 
                    strokeWidth={3} 
                    dot={false}
                    activeDot={{ r: 6, fill: "#0E8A5A", stroke: "#fff", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
