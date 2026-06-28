"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hideNav = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login") || pathname?.startsWith("/onboarding");

  if (hideNav) return null; // Hide on dashboard, login, and onboarding screens



  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/40 bg-[#F7F9FC]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl h-20 items-center justify-between px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#0E8A5A] text-white shadow-soft">
              <TrendingUp className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#0F172A]">
              Apex <span className="font-medium text-[#0E8A5A]">Intelligence</span>
            </span>
          </Link>
        </div>



        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            href="/login"
            className="text-[14px] font-semibold text-slate-700 transition-colors hover:text-[#0E8A5A]"
          >
            Sign In
          </Link>
          <Link
            href="/login?flow=open-account"
            className="inline-flex h-11 items-center justify-center rounded-[14px] bg-[#0E8A5A] px-6 text-[14px] font-semibold text-white shadow-soft transition-all hover:bg-[#0c784e] hover:shadow-premium hover:-translate-y-0.5 active:translate-y-0 duration-250"
          >
            Open Account
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex md:hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200/60 bg-white text-slate-700 hover:bg-slate-50"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/40 bg-[#F7F9FC] px-6 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">

          <div className="flex flex-col gap-3">
            <Link
              href="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-center rounded-[14px] border border-slate-200 bg-white text-[14px] font-semibold text-slate-700"
            >
              Sign In
            </Link>
            <Link
              href="/login?flow=open-account"
              onClick={() => setMobileMenuOpen(false)}
              className="flex h-11 items-center justify-center rounded-[14px] bg-[#0E8A5A] text-[14px] font-semibold text-white shadow-soft hover:bg-[#0c784e]"
            >
              Open Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
