"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  Briefcase,
  BarChart3,
  Shield,
  TrendingUp,
  Files,
  Bot,
  FileText,
  Settings,
  Plus,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [profileName, setProfileName] = useState("Vedansh Saini");
  const [profileInitials, setProfileInitials] = useState("VS");
  const [profileRole, setProfileRole] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user_onboarding_profile");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.name) {
          setProfileName(parsed.name);
          const initials = parsed.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2);
          setProfileInitials(initials);
        }
      } catch (e) {}
    }

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const fetchProfile = () => {
      fetch(`${API_BASE}/api/profile/`)
        .then((r) => r.json())
        .then((data) => {
          setProfileRole(data.role || null);
        })
        .catch(() => {
          /* ignore — keep defaults */
        });
    };

    fetchProfile();
    const handler = () => fetchProfile();
    window.addEventListener("profileUpdated", handler);
    return () => window.removeEventListener("profileUpdated", handler);
  }, []);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Portfolio Builder", href: "/dashboard/portfolio", icon: Briefcase },
    { name: "Market Intelligence", href: "/dashboard/markets", icon: BarChart3 },
    { name: "Risk Center", href: "/dashboard/risk", icon: Shield },
    { name: "Backtesting", href: "/dashboard/backtest", icon: TrendingUp },
    { name: "Research Vault (RAG)", href: "/dashboard/research", icon: Files },
    { name: "AI Advisor", href: "/dashboard/advisor", icon: Bot },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
  ];

  const handleNav = (href: string, disabled?: boolean) => {
    if (disabled) return;
    router.push(href);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden flex h-16 w-full items-center justify-between border-b border-slate-200/60 bg-white px-6 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-[#0E8A5A] text-white">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div className="text-left leading-none">
            <span className="text-sm font-bold text-[#0F172A]">Apex <span className="text-[#0E8A5A]">Intel</span></span>
            <p className="text-[9px] text-slate-400 font-semibold mt-0.5">AI Portfolio Platform</p>
          </div>
        </div>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-1.5 rounded-full text-slate-500 hover:bg-slate-100"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          ></div>

          <div className="relative flex w-72 max-w-xs flex-1 flex-col bg-white border-r border-slate-200/80 animate-in slide-in-from-left duration-250">
            <div className="flex h-20 items-center justify-between px-6 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#0E8A5A] text-white shadow-soft">
                  <TrendingUp className="h-5.5 w-5.5" />
                </div>
                <div className="text-left leading-none">
                  <span className="text-md font-bold text-[#0F172A]">Apex <span className="text-[#0E8A5A]">Intel</span></span>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">AI Portfolio Platform</p>
                </div>
              </div>
              <button
                onClick={() => setIsMobileOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <button
                    key={item.name}
                    disabled={item.disabled}
                    onClick={() => handleNav(item.href, item.disabled)}
                    className={`w-full flex items-center gap-3.5 px-6 py-3.5 text-[13px] font-bold transition-all relative ${
                      isActive
                        ? "bg-[#EAF7F2] text-[#0E8A5A]"
                        : item.disabled
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-[#0F172A]/80 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </div>


          </div>
        </div>
      )}

      {/* Desktop Sidebar (Matches Screenshot) */}
      <aside className="hidden lg:flex flex-col border-r border-slate-200/50 bg-white h-screen w-64 sticky top-0 shrink-0 overflow-y-auto py-6 justify-between">
        
        {/* Top Header Logo */}
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] bg-[#0E8A5A] text-white shadow-soft">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div className="text-left leading-tight">
              <h2 className="text-[17px] font-extrabold text-[#0F172A] tracking-tight">
                Apex <span className="text-[#0E8A5A]">Intel</span>
              </h2>
              <p className="text-[10px] text-slate-400 font-semibold">AI Portfolio Platform</p>
            </div>
          </Link>
        </div>

        {/* Navigation List */}
        <div className="flex-1 space-y-1 px-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                disabled={item.disabled}
                onClick={() => handleNav(item.href, item.disabled)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-[13px] font-bold tracking-tight transition-all ${
                  isActive
                    ? "bg-[#EAF7F2] text-[#0E8A5A]"
                    : item.disabled
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-[#0F172A]/80 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Section: Button, Market Card, Profile */}
        <div className="px-4 mt-8 space-y-5">


          {/* Market Status Card */}
          <div className="border border-slate-200/60 rounded-xl p-4 bg-white shadow-soft leading-tight">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] font-extrabold text-slate-800">Market Status</span>
              <span className="text-[10px] font-bold text-[#0E8A5A] flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0E8A5A] animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">NSE • BSE • Global</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Last updated: 12 sec ago</p>
          </div>

          {/* Profile Card */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3 relative group">
                <div className="h-9 w-9 rounded-full bg-[#0E8A5A] text-white flex items-center justify-center font-bold text-[12px] shadow-soft">
                  {profileInitials}
                </div>
                <div className="text-left leading-none">
                  <p className="text-[12px] font-extrabold text-[#0F172A]">{profileName}</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-1">{profileRole || "Portfolio Manager"}</p>
                </div>
                
                <div className="absolute left-0 bottom-full mb-2 w-36 bg-white border border-slate-200 rounded-md shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <a href="/dashboard/advisor" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Open Profile</a>
                  <a href="/logout" className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Logout</a>
                </div>
              </div>
          </div>
        </div>
      </aside>
    </>
  );
}
