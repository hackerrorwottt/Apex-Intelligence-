"use client";

import { motion } from "framer-motion";
import { Mic, MicOff } from "lucide-react";

interface MicrophoneButtonProps {
  isListening: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export default function MicrophoneButton({ isListening, onClick, disabled }: MicrophoneButtonProps) {
  return (
    <div className="relative flex items-center justify-center">
      {/* Pulse effect when listening */}
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full bg-[#0E8A5A] opacity-20"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        />
      )}
      
      {isListening && (
        <motion.div
          className="absolute inset-0 rounded-full bg-[#0E8A5A] opacity-40"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1, ease: "easeInOut", delay: 0.2 }}
        />
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-soft transition-colors ${
          isListening 
            ? "bg-[#0E8A5A] text-white hover:bg-[#0c784e]" 
            : "bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-700 border border-slate-200"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {isListening ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </button>
    </div>
  );
}
