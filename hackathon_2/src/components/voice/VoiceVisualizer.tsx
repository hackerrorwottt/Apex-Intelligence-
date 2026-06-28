"use client";

import { motion } from "framer-motion";

interface VoiceVisualizerProps {
  isSpeaking: boolean;
}

export default function VoiceVisualizer({ isSpeaking }: VoiceVisualizerProps) {
  // We'll render 5 little bars that bounce
  const bars = [1, 2, 3, 4, 5];

  return (
    <div className="flex items-center gap-1 h-6">
      {bars.map((bar) => (
        <motion.div
          key={bar}
          className="w-1.5 bg-[#0E8A5A] rounded-full"
          initial={{ height: "4px" }}
          animate={{ 
            height: isSpeaking ? ["4px", "16px", "4px"] : "4px",
            opacity: isSpeaking ? 1 : 0.4
          }}
          transition={{
            repeat: isSpeaking ? Infinity : 0,
            duration: 0.8,
            ease: "easeInOut",
            delay: bar * 0.1,
          }}
        />
      ))}
    </div>
  );
}
