"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export function useSpeechSynthesis() {
  const [hasSupport, setHasSupport] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setHasSupport(true);
      synthRef.current = window.speechSynthesis;

      const updateVoices = () => {
        setVoices(window.speechSynthesis.getVoices());
      };

      updateVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }
    }
  }, []);

  const getBestVoice = useCallback(() => {
    if (voices.length === 0) return null;
    
    // Prioritize natural English voices
    const preferredVoices = [
      "Google UK English Female",
      "Google UK English Male",
      "Google US English",
      "Samantha", // Mac
      "Arthur", // Mac
      "Microsoft Aria Online (Natural) - English (United States)",
      "Microsoft Zira Desktop - English (United States)"
    ];

    for (const pv of preferredVoices) {
      const match = voices.find(v => v.name === pv || v.name.includes(pv));
      if (match) return match;
    }

    // Fallback to any english voice
    const englishVoices = voices.filter(v => v.lang.startsWith("en"));
    if (englishVoices.length > 0) {
      // Prefer local service if possible
      const local = englishVoices.find(v => v.localService);
      return local || englishVoices[0];
    }

    return voices[0];
  }, [voices]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!synthRef.current || !hasSupport) {
      if (onEnd) onEnd();
      return;
    }

    // Cancel any ongoing speech
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    // Small timeout to fix some browser quirks after cancel
    setTimeout(() => {
      if (!synthRef.current) return;
      
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance; // Prevent garbage collection bug in some browsers
      
      const bestVoice = getBestVoice();
      
      if (bestVoice) {
        utterance.voice = bestVoice;
      }
      
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };
      utterance.onerror = (e) => {
        if (e.error === 'interrupted' || e.error === 'canceled') {
          // Normal behavior when cancel() is called
          return;
        }
        console.error("Speech synthesis error", e);
        setIsSpeaking(false);
        if (onEnd) onEnd();
      };

      synthRef.current.speak(utterance);
    }, 50);
  }, [hasSupport, getBestVoice]);

  const stop = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    hasSupport,
    isSpeaking,
    speak,
    stop
  };
}
