"use client";

import Sidebar from "@/components/Sidebar";
import { Search, Bell, Sparkles } from "lucide-react";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchVal, setSearchVal] = useState("");

  return (
    <div className="flex h-screen w-full bg-[#F7F9FC] overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Canvas */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-20 w-full bg-white border-b border-slate-200/50 px-6 sm:px-8 flex items-center justify-between shrink-0">
          {/* Search bar */}
          <div className="relative max-w-md w-full hidden sm:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets, risk models, sentiment analysis..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="w-full bg-[#F7F9FC] text-[13px] font-medium border border-slate-200/60 rounded-[14px] pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#0E8A5A]/50 transition-colors"
            />
          </div>

          <div className="sm:hidden text-left leading-none">
            <h2 className="text-md font-extrabold text-[#0F172A]">Apex Platform</h2>
            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Quant Trading Desk</p>
          </div>

          {/* Right Accessories */}
          <div className="flex items-center gap-4">
            {/* Live Market Indicators */}
            <div className="hidden sm:flex flex-col items-end leading-none text-right gap-1 pr-3">
              <span className="text-[12px] font-extrabold text-[#0F172A] flex items-center gap-1.5 justify-end">
                Live Market <span className="h-2 w-2 rounded-full bg-[#0E8A5A] animate-pulse"></span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400">Last Sync: 12 sec ago</span>
            </div>

            {/* Notifications */}
            <button className="h-10 w-10 flex items-center justify-center rounded-[12px] border border-slate-200/60 bg-white text-slate-500 hover:bg-slate-50 relative group">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#0E8A5A]"></span>
            </button>

            {/* User Profile */}
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200/50">
              <div className="h-9 w-9 rounded-full bg-[#0E8A5A] text-white flex items-center justify-center font-bold text-[13px] shadow-soft">
                VS
              </div>
              <div className="text-left hidden md:block leading-none">
                <p className="text-[12px] font-bold text-slate-800">Vedansh Saini</p>
                <p className="text-[10px] text-slate-400">Portfolio Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
