"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();
  const hideFooter = pathname?.startsWith("/dashboard") || pathname?.startsWith("/login") || pathname?.startsWith("/onboarding");

  if (hideFooter) return null; // Hide on dashboard, login, and onboarding screens

  return (
    <footer className="w-full bg-[#0F172A] text-slate-400 py-16 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Logo & Description */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#0E8A5A] text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                Apex <span className="font-medium text-[#0E8A5A]">Intelligence</span>
              </span>
            </div>
            <p className="text-[13px] leading-relaxed text-slate-400 max-w-xs">
              Neural-driven portfolio optimization, real-time market sentiment NLP, and advanced AI advisory for modern institutional wealth management.
            </p>
          </div>

          {/* Products Column */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-200 mb-4">
              Products
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link href="/#markets" className="hover:text-white transition-colors">
                  Markets & Analysis
                </Link>
              </li>
              <li>
                <Link href="/#portfolio" className="hover:text-white transition-colors">
                  AI Portfolio Frontier
                </Link>
              </li>
              <li>
                <Link href="/#advisor" className="hover:text-white transition-colors">
                  AI Advisor Engine
                </Link>
              </li>
            </ul>
          </div>

          {/* Trust & Security Column */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-200 mb-4">
              Trust & Compliance
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <Link href="/#security" className="hover:text-white transition-colors">
                  SOC2 Security
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Sovereign Data Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Disclosures & Audits
                </a>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-slate-200 mb-4">
              Resources & Support
            </h4>
            <ul className="space-y-2.5 text-[13px]">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Contact Institutional Sales
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider & Disclaimer */}
        <div className="mt-12 pt-8 border-t border-slate-800 space-y-4">
          <p className="text-[11px] leading-relaxed text-slate-500">
            © {new Date().getFullYear()} Apex Intelligence Inc. All rights reserved. Platform simulation and research tools are for institutional information purposes only and do not constitute financial advice. Quantitative models are based on historical datasets and predictions are not guarantees of future yield performance.
          </p>
        </div>
      </div>
    </footer>
  );
}
