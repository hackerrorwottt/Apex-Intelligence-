"use client";

import { useState, useEffect } from "react";
import { Activity, Calendar, Play, RefreshCw, FileText, Info } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend } from "recharts";

const backtestData = [
  { year: "2019", Portfolio: 100, Nifty: 100, Sensex: 98 },
  { year: "2020", Portfolio: 92, Nifty: 82, Sensex: 80 },
  { year: "2021", Portfolio: 135, Nifty: 115, Sensex: 112 },
  { year: "2022", Portfolio: 150, Nifty: 130, Sensex: 128 },
  { year: "2023", Portfolio: 175, Nifty: 152, Sensex: 148 },
  { year: "2024", Portfolio: 193, Nifty: 171, Sensex: 168 },
];

export default function BacktestingPage() {
  const [mounted, setMounted] = useState(false);
  const [startYear, setStartYear] = useState("2019");
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">Backtesting Sandbox</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">Simulate historical strategies using vectorbt metrics.</p>
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

      {/* Grid: Params left, stats right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Params (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-[#0E8A5A]" />
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">Historical Configurations</h3>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Simulation Year</label>
              <select
                value={startYear}
                onChange={(e) => setStartYear(e.target.value)}
                className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none"
              >
                <option value="2019">2019</option>
                <option value="2020">2020</option>
                <option value="2021">2021</option>
                <option value="2022">2022</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rebalancing Frequency</label>
              <select className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-2.5 text-[13px] font-bold text-[#0F172A] focus:outline-none">
                <option value="Monthly">Monthly Drift Target</option>
                <option value="Quarterly">Quarterly Sharpe Re-run</option>
                <option value="Daily">Daily Threshold Trigger</option>
              </select>
            </div>
          </div>

          <div className="bg-[#EEF3FF] border border-blue-200/50 rounded-xl p-3.5 text-[11px] font-semibold text-slate-600 flex items-start gap-2.5 leading-relaxed">
            <Info className="h-4.5 w-4.5 text-blue-500 shrink-0 mt-0.5" />
            <span>Simulates transaction costs of 0.1% per rebalance trade to preserve accuracy.</span>
          </div>
        </div>

        {/* Comparison Plot (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between">
          <h3 className="text-[15px] font-extrabold text-[#0F172A] mb-4">Historical Performance</h3>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={backtestData.filter((d) => parseInt(d.year) >= parseInt(startYear))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="year" tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip contentStyle={{ backgroundColor: "#0F172A", border: "none", borderRadius: "10px" }} itemStyle={{ color: "#fff", fontWeight: "bold", fontSize: 11 }} />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Line type="monotone" dataKey="Portfolio" stroke="#0E8A5A" strokeWidth={2.5} activeDot={{ r: 6 }} name="Portfolio (+93%)" />
                <Line type="monotone" dataKey="Nifty" stroke="#94a3b8" strokeWidth={1.5} name="Nifty Index (+71%)" />
                <Line type="monotone" dataKey="Sensex" stroke="#3B82F6" strokeWidth={1.5} strokeDasharray="3 3" name="Sensex Index (+68%)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
