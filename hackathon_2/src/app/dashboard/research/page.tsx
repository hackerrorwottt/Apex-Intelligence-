"use client";

import { useState, useEffect, useRef } from "react";
import { BookOpen, FileText, Send, Lock, RefreshCw, CheckCircle, Info, UploadCloud, Database, Loader2 } from "lucide-react";

export default function ResearchVaultPage() {
  const [mounted, setMounted] = useState(false);
  
  // Search State
  const [ragQuestion, setRagQuestion] = useState("");
  const [ragAnswer, setRagAnswer] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  
  // Stats State
  const [stats, setStats] = useState<{ total_documents: number, total_chunks: number } | null>(null);
  
  // Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rag/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error("Failed to load RAG stats", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchStats();
  }, []);

  if (!mounted) return null;

  const handleAsk = async () => {
    if (!ragQuestion.trim()) return;
    setIsAsking(true);
    setRagAnswer("");

    try {
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadMessage("");
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE}/api/rag/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || "Upload failed");
      }

      const data = await res.json();
      setUploadMessage(`Successfully vectorized ${data.chunks_indexed} chunks from ${data.filename}!`);
      
      // Refresh stats after successful upload
      fetchStats();
    } catch (err: any) {
      setUploadMessage(`Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Centered Search Console */}
        <div className="lg:col-span-8 lg:col-start-3">
          <div className="bg-white rounded-[18px] border border-slate-200/60 p-6 shadow-soft flex flex-col justify-between h-[600px]">
            <div className="space-y-2 shrink-0">
              <h3 className="text-[15px] font-extrabold text-[#0F172A] flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-[#0E8A5A]" /> Semantic Search Console
              </h3>
              <p className="text-[11px] font-semibold text-slate-400">Query parsed document contexts directly from the vector store.</p>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-50/50 rounded-xl p-3.5 border border-slate-200/40 text-[11px] font-semibold leading-relaxed my-4">
              {ragAnswer ? (
                <div className="space-y-3 whitespace-pre-line text-slate-600">
                  <span className="text-[10px] font-bold text-[#0E8A5A] uppercase tracking-wider block">Retrieved Source Context:</span>
                  {ragAnswer}
                </div>
              ) : (
                <div className="text-slate-400 text-center h-full flex flex-col items-center justify-center">
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
                  {isAsking ? (
                     <Loader2 className="h-4 w-4 animate-spin" />
                  ) : "Ask AI"}
                </button>
              </form>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
