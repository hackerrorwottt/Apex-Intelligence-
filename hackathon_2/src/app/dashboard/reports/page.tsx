"use client";

import { useState, useEffect, useRef } from "react";
import { Terminal, Settings, Bell, Shield, LogOut, Activity, ChevronRight, User } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ReportsPage() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Booting AI Advisor core...",
    "[FIREBASE] Authentication service initialized.",
  ]);
  const endOfLogsRef = useRef<HTMLDivElement>(null);

  // Fake log streaming
  useEffect(() => {
    const mockEvents = [
      "[ROUTER] Verified private VPC endpoints.",
      "[QUANT] Loaded PyPortfolioOpt constraints matrix.",
      "[QUANT] Covariance cache hit. 14ms latency.",
      "[RISK] Risk appetite configured to Moderate.",
      "[RAG] ChromaDB vector space connected.",
      "[LLM] Gemini pipeline active.",
      "[SYSTEM] Nominal operating threshold reached.",
      "[HEARTBEAT] Ping success."
    ];

    let i = 0;
    const interval = setInterval(() => {
      if (i < mockEvents.length) {
        setLogs(prev => [...prev, mockEvents[i]]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Load user
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
      } else {
        setUserEmail("Unauthenticated session");
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#0E8A5A]" />
            <h1 className="text-2xl font-black text-[#0F172A] tracking-tight">System Reports & Settings</h1>
          </div>
          <p className="text-[13px] font-semibold text-slate-400">
            Administrative command center for logs, diagnostics, and account preferences.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Terminal Logs (Left side) */}
        <div className="lg:col-span-8 bg-[#0F172A] rounded-[24px] overflow-hidden shadow-soft flex flex-col h-[500px] border border-slate-800">
          <div className="h-12 bg-[#1E293B] flex items-center px-4 justify-between shrink-0 border-b border-slate-700/50">
            <div className="flex items-center gap-2 text-slate-300">
              <Terminal className="h-4 w-4" />
              <span className="text-[12px] font-bold uppercase tracking-widest">System Runtime Logs</span>
            </div>
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-emerald-500/80 animate-pulse"></div>
            </div>
          </div>
          <div className="p-6 font-mono text-[13px] leading-relaxed text-[#10B981] overflow-y-auto flex-1 space-y-2">
            {logs.map((log, index) => (
              <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <span className="text-slate-500 shrink-0">[{new Date().toLocaleTimeString()}]</span>
                <span className="break-all">{log}</span>
              </div>
            ))}
            <div ref={endOfLogsRef} />
          </div>
        </div>

        {/* Account Settings (Right side) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[24px] border border-slate-200/60 p-6 shadow-soft space-y-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-slate-700" />
              <h3 className="text-[15px] font-extrabold text-[#0F172A]">Account Configuration</h3>
            </div>

            <div className="space-y-4">
              {/* Profile Item */}
              <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-[16px] border border-slate-100">
                <div className="h-10 w-10 shrink-0 rounded-full bg-[#EAF7F2] flex items-center justify-center text-[#0E8A5A]">
                  <User className="h-5 w-5" />
                </div>
                <div className="overflow-hidden">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Account</p>
                  <p className="text-[14px] font-extrabold text-[#0F172A] truncate">{userEmail || "Loading..."}</p>
                </div>
              </div>

              {/* Setting Toggles */}
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-[12px] cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-slate-500" />
                    <span className="text-[13px] font-bold text-slate-700">Email Alerts</span>
                  </div>
                  <div className="w-9 h-5 bg-[#0E8A5A] rounded-full relative shadow-inner">
                    <div className="absolute right-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-[12px] cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-slate-500" />
                    <span className="text-[13px] font-bold text-slate-700">Two-Factor Auth</span>
                  </div>
                  <div className="w-9 h-5 bg-slate-200 rounded-full relative shadow-inner">
                    <div className="absolute left-0.5 top-0.5 h-4 w-4 bg-white rounded-full shadow-sm border border-slate-200"></div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 h-11 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-[14px] text-[13px] font-bold transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out Securely
            </button>
          </div>
          
          <div className="bg-[#EAF7F2] border border-[#0E8A5A]/20 rounded-[24px] p-5 shadow-soft">
             <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-[#0E8A5A] animate-pulse"></div>
                <h4 className="text-[12px] font-bold text-[#0E8A5A] uppercase tracking-wider">System Healthy</h4>
             </div>
             <p className="text-[11px] font-semibold text-slate-600 leading-relaxed">
               All core modules including XGBoost prediction engines and PyPortfolioOpt optimizers are reporting 100% uptime with 0 latency spikes.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}
