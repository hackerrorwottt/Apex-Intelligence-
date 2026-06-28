"use client";

import { useState, useEffect } from "react";
import { BookOpen, FileText, Send, Lock, RefreshCw, CheckCircle, Info } from "lucide-react";

export default function ResearchVaultPage() {
  const [mounted, setMounted] = useState(false);
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  
  const documents = [
    { name: "Trading in the Zone by Mark Douglas.txt", size: "Extracted", indexed: true, date: "2026-06-28", chunks: 1 },
    { name: "Best Loser Wins by Tom Hougaard.txt", size: "Extracted", indexed: true, date: "2026-06-28", chunks: 1 },
    { name: "Technical Analysis of the Financial Markets by John J. Murphy.txt", size: "Extracted", indexed: true, date: "2026-06-28", chunks: 1 },
    { name: "Getting Started in Technical Analysis by Jack D. Schwager.txt", size: "Extracted", indexed: true, date: "2026-06-28", chunks: 1 },
    { name: "Japanese Candlestick Charting Techniques by Steve Nison.txt", size: "Extracted", indexed: true, date: "2026-06-28", chunks: 1 },
    { name: "Technical Analysis Using Multiple Timeframes by Brian Shannon.txt", size: "Extracted", indexed: true, date: "2026-06-28", chunks: 1 },
    { name: "Encyclopedia of Chart Patterns by Thomas N. Bulkowski.txt", size: "Extracted", indexed: true, date: "2026-06-28", chunks: 1 }
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleAsk = async () => {
    if (!ragQuestion.trim()) return;
    setIsAsking(true);
    setRagAnswer("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${API_BASE}/api/rag/search?query=${encodeURIComponent(ragQuestion)}&top_k=3`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        const resultsHtml = data.results.map((r: any, i: number) => {
          return `Source: ${r.source}\nRelevance: ${(r.relevance_score * 100).toFixed(1)}%\n"${r.text}"\n`;
        }).join("\n---\n\n");
        setRagAnswer(resultsHtml);
      } else {
        setRagAnswer("No relevant context found in the curated library.");
      }
    } catch (err) {
      setRagAnswer("Error searching documents.");
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F172A]">Institutional Knowledge Vault</h1>
          <p className="text-[13px] font-semibold text-slate-400 mt-1">Ground your models on a strictly curated library of the world's best trading philosophies.</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* RAG Search (Centered) */}
        <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between h-[600px]">
          <div className="space-y-2 shrink-0">
            <h3 className="text-[15px] font-extrabold text-[#0F172A] flex items-center gap-2">
              <BookOpen className="h-4.5 w-4.5 text-[#0E8A5A]" /> Semantic Search Console
            </h3>
            <p className="text-[11px] font-semibold text-slate-400">Ask questions to query parsed document contexts.</p>
          </div>

          <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-xl p-3.5 border border-slate-200/40 text-[11px] font-semibold leading-relaxed my-4">
            {ragAnswer ? (
              <div className="space-y-3 whitespace-pre-line text-slate-600">
                <span className="text-[10px] font-bold text-[#0E8A5A] uppercase tracking-wider block">Retrieved Source Context:</span>
                {ragAnswer}
              </div>
            ) : (
              <div className="text-slate-400 text-center py-24 flex flex-col items-center justify-center">
                <BookOpen className="h-12 w-12 text-slate-200 mb-4" />
                <p>Type your question below and click Ask to retrieve wisdom directly from the curated library.</p>
              </div>
            )}
          </div>

          <div className="space-y-3 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleAsk(); }} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. What does Mark Douglas say about fear?..."
                value={ragQuestion}
                onChange={(e) => setRagQuestion(e.target.value)}
                className="flex-1 bg-slate-50 text-[12px] font-semibold border border-slate-200 rounded-[12px] px-3.5 py-2.5 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAsking || !ragQuestion.trim()}
                className="h-10 px-4 rounded-[12px] bg-[#0E8A5A] text-white text-[12px] font-bold hover:bg-[#0c784e] flex items-center justify-center shrink-0 disabled:opacity-50"
              >
                {isAsking ? "Searching..." : "Ask AI"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
