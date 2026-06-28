"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Sparkles, TrendingUp, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: Date;
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "Welcome to Apex Intelligence. I am your neural strategy assistant. Select a quick query below or type your investment question.",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQueries = [
    "Run optimization model",
    "BTC vs SPX correlation",
    "NLP Sentiment check",
  ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiText = "";
      if (text.toLowerCase().includes("optimization") || text.toLowerCase().includes("optimize")) {
        aiText = `**Quantitative Optimization Execution Completed:**\n\n* **Model**: Black-Litterman Neural Hybrid\n* **Primary Shift**: Reduced high-beta tech exposure by **4.2%**\n* **Re-allocation**: Added **2.8%** to gold (GLD) and **1.4%** to 10-Year Treasuries.\n* **Outcome**: Expected Sharpe ratio increased from **1.62 to 1.89** with a **12.5%** drawdown reduction.`;
      } else if (text.toLowerCase().includes("btc") || text.toLowerCase().includes("correlation")) {
        aiText = `**Cross-Asset Correlation Matrix Update (30D Rolling):**\n\n* **BTC to SPX**: **0.42** (Moderately positive, down from 0.58)\n* **ETH to BTC**: **0.88** (Highly correlated, standard range)\n* **BTC to GLD**: **-0.12** (Negative correlation acting as inflation hedge)\n\n*Strategic Advisory*: BTC is showing divergence from equity indices, indicating rising status as a macro-liquidity play. High-growth portfolios should cap digital asset exposure at **3.5%** to mitigate systematic risk.`;
      } else if (text.toLowerCase().includes("sentiment") || text.toLowerCase().includes("nlp")) {
        aiText = `**Market Sentiment Engine Analytics:**\n\n* **S&P 500 Index Sentiment**: **Bullish (72.4%)**\n  * Driven by positive AI earnings transcripts and dovish Fed minutes.\n* **Crypto Market Sentiment**: **Neutral (51.0%)**\n  * Regulatory consolidation offset by institutional custodian inflows.\n* **Top Positive Sector**: **Energy & Utilities (81.2%)**\n  * Boosted by strong defensive pricing power and supply-side constraints.`;
      } else {
        aiText = `Hello. Your query regarding "${text}" has been processed through our quantitative intelligence network. Current models indicate high market volatility in this asset category. We advise running a full portfolio frontier simulation in the **AI Advisor** platform tab to evaluate covariance impacts.`;
      }

      const aiMsg: Message = {
        id: Math.random().toString(),
        sender: "ai",
        text: aiText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="mb-4 h-[500px] w-[380px] overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-lift flex flex-col"
          >
            {/* Header */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0E8A5A]">
                  <Sparkles className="h-4.5 w-4.5 text-white" />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold tracking-tight">Apex Neural Assistant</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#0E8A5A] animate-pulse"></span>
                    <span className="text-[11px] text-slate-400 font-medium">Neural Engine v4.2 Active</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-[14px] p-3 text-[13px] leading-relaxed shadow-soft ${
                      msg.sender === "user"
                        ? "bg-[#0E8A5A] text-white"
                        : "bg-white text-slate-800 border border-slate-200/50"
                    }`}
                  >
                    {/* Render markdown-like lists and bolding */}
                    <div className="whitespace-pre-line">
                      {msg.text.split("\n").map((line, i) => {
                        if (line.startsWith("* ")) {
                          return (
                            <div key={i} className="flex items-start gap-1.5 ml-1 mt-1">
                              <span className="text-[#0E8A5A] mt-1 font-bold text-[10px]">•</span>
                              <span>{line.replace("* ", "")}</span>
                            </div>
                          );
                        }
                        if (line.startsWith("**") && line.endsWith("**")) {
                          return <strong key={i} className="block font-bold text-[13px]">{line.replaceAll("**", "")}</strong>;
                        }
                        return <p key={i}>{line}</p>;
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-slate-500 border border-slate-200/50 rounded-[14px] px-4 py-3 text-[13px] flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-[#0E8A5A] rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-[#0E8A5A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-[#0E8A5A] rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="p-3 bg-white border-t border-slate-100 flex flex-wrap gap-2">
                {quickQueries.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-[11px] font-semibold text-[#0E8A5A] bg-[#0E8A5A]/5 px-2.5 py-1.5 rounded-full hover:bg-[#0E8A5A]/10 transition-colors border border-[#0E8A5A]/10"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about markets, risk models..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 bg-slate-50 text-[13px] font-medium border border-slate-200 rounded-[12px] px-3.5 py-2.5 focus:outline-none focus:border-[#0E8A5A]/60 transition-colors"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="h-10 w-10 flex items-center justify-center rounded-[12px] bg-[#0E8A5A] text-white transition-all disabled:opacity-50 enabled:hover:bg-[#0c784e]"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0E8A5A] text-white shadow-lift transition-all hover:bg-[#0c784e] hover:scale-105 active:scale-95 duration-200 relative group"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 45, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 45, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -45, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="relative"
            >
              <MessageSquare className="h-6 w-6" />
              <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0E8A5A] border-2 border-white"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
