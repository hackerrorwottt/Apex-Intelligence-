"use client";

import { useState, useEffect } from "react";
import { BookOpen, FileText, Send, Upload, RefreshCw, CheckCircle, Info } from "lucide-react";

export default function ResearchVaultPage() {
  const [mounted, setMounted] = useState(false);
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [documents, setDocuments] = useState([
    { name: "TCS Annual Report 2023-24.pdf", size: "4.8 MB", indexed: true, date: "2026-06-25" },
    { name: "SEBI Mutual Fund Regulations.pdf", size: "1.2 MB", indexed: true, date: "2026-06-25" },
    { name: "Modern Portfolio Theory textbook.pdf", size: "12.4 MB", indexed: true, date: "2026-06-26" },
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleAsk = () => {
    if (!ragQuestion.trim()) return;
    setIsAsking(true);
    setRagAnswer("");

    setTimeout(() => {
      let ans = "";
      const q = ragQuestion.toLowerCase();
      if (q.includes("tcs")) {
        ans = "Source: TCS Q4 Annual Report (Page 42).\n\"TCS reported a 15% revenue expansion with digital services growth driving operating margins. Retained earnings and low debt provide robust fundamentals to mitigate volatility drawdowns.\"";
      } else if (q.includes("sebi") || q.includes("regulation")) {
        ans = "Source: SEBI Mutual Fund Guidelines (Section 7).\n\"Guidelines establish strict limits on maximum sector weights (35% cap in tech/financials) to enforce institutional diversification boundaries.\"";
      } else {
        ans = "Source: Portfolio Theory Textbook (Page 112).\n\"Modern Portfolio Theory dictates that asset covariance optimization reduces unsystematic single-stock risk. Inclusion of GOLDBEES creates a negative-correlation hedge.\"";
      }
      setRagAnswer(ans);
      setIsAsking(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">Research Vault (RAG)</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">Ground your models on indexed regulatory filings and corporate annual reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Uploads & Documents (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft space-y-6">
          <div className="space-y-2">
            <h3 className="text-[15px] font-extrabold text-[#0F172A]">Indexed Documents</h3>
            <p className="text-[11px] font-semibold text-slate-400">PDF documents chunks parsed and indexed in ChromaDB.</p>
          </div>

          <div className="border-2 border-dashed border-slate-200 hover:border-[#0E8A5A] rounded-[16px] p-8 text-center cursor-pointer transition-colors group">
            <Upload className="h-8 w-8 text-slate-400 group-hover:text-[#0E8A5A] mx-auto transition-colors" />
            <p className="text-[13px] font-extrabold text-slate-700 mt-3">Upload new financial report (PDF)</p>
            <p className="text-[10px] text-slate-400 font-semibold mt-1">Maximum file size: 25MB</p>
          </div>

          <div className="divide-y divide-slate-100 space-y-3.5 pt-4">
            {documents.map((doc) => (
              <div key={doc.name} className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="text-left leading-none">
                    <p className="text-[12px] font-bold text-slate-800">{doc.name}</p>
                    <p className="text-[9px] text-slate-400 font-semibold mt-1">{doc.size} • Uploaded {doc.date}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#0E8A5A] bg-emerald-50 border border-emerald-100 rounded px-2 py-0.5">Indexed ✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: RAG Search (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between h-[450px]">
          <div className="space-y-2 shrink-0">
            <h3 className="text-[15px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-[#0E8A5A]" /> Semantic Search Console
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">Ask questions to query parsed document contexts.</p>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-xl p-3.5 border border-slate-200/40 text-[11px] font-semibold leading-relaxed my-4">
            {ragAnswer ? (
              <div className="space-y-3 whitespace-pre-line text-slate-600">
                <span className="text-[10px] font-bold text-[#0E8A5A] uppercase tracking-wider block">Retrieved Source Answer:</span>
                {ragAnswer}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-16">
                Type your question below and click Ask to view retrieved annual report evidence.
              </div>
            )}
          </div>

          <div className="space-y-3 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask RAG (e.g. why is TCS recommended?)..."
                value={ragQuestion}
                onChange={(e) => setRagQuestion(e.target.value)}
                className="flex-1 bg-slate-50 text-[12px] font-semibold border border-slate-200 rounded-[12px] px-3.5 py-2.5 focus:outline-none"
              />
              <button
                onClick={handleAsk}
                disabled={isAsking}
                className="h-10 px-4 rounded-[12px] bg-[#0E8A5A] text-white text-[12px] font-bold hover:bg-[#0c784e] flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                {isAsking ? "Searching..." : "Ask AI"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
