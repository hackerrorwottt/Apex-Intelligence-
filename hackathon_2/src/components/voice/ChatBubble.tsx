"use client";

import { motion } from "framer-motion";
import { User, Sparkles } from "lucide-react";
import VoiceVisualizer from "./VoiceVisualizer";

interface ChatBubbleProps {
  role: "user" | "assistant" | "backend";
  text: string;
  isSpeaking?: boolean;
}

export default function ChatBubble({ role, text, isSpeaking = false }: ChatBubbleProps) {
  const isUser = role === "user";
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}
    >
      <div className={`flex gap-4 max-w-[85%] sm:max-w-[75%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        {/* Avatar */}
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-soft ${
          isUser ? "bg-slate-100 text-slate-500" : "bg-[#0E8A5A] text-white"
        }`}>
          {isUser ? <User className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        </div>
        
        {/* Message Bubble */}
        <div className={`flex flex-col gap-2 ${isUser ? "items-end" : "items-start"}`}>
          <div className={`rounded-2xl px-5 py-4 text-[14px] leading-relaxed shadow-sm ${
            isUser 
              ? "bg-[#0E8A5A] text-white rounded-tr-none" 
              : role === "backend" 
                ? "bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none font-mono text-[12px] overflow-x-auto" 
                : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
          }`}>
            {role === "backend" ? (
              <pre className="whitespace-pre-wrap">{text}</pre>
            ) : (
              <p className="whitespace-pre-wrap">{text}</p>
            )}
          </div>
          
          {/* Speaking Visualizer for Assistant */}
          {role === "assistant" && isSpeaking && (
            <div className="pl-2 pt-1">
              <VoiceVisualizer isSpeaking={true} />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
