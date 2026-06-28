"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sliders, ShieldCheck, Send, Volume2, VolumeX, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import MicrophoneButton from "@/components/voice/MicrophoneButton";
import ChatBubble from "@/components/voice/ChatBubble";

type ChatMessage = { role: "user" | "assistant" | "backend"; text: string; raw?: any; isNew?: boolean };

const QUESTIONS = [
  { key: "capital", prompt: "How much capital will you allocate in INR? For example, ten lakh rupees." },
  { key: "risk_appetite", prompt: "What is your risk appetite? Choose from Conservative, Moderate, or Aggressive." },
  { key: "investment_horizon_years", prompt: "What is your investment horizon in years?" },
  { key: "goal", prompt: "What is your primary investment goal? Long-Term Wealth, Retirement, Short-Term Growth, Passive Income, or Capital Preservation?" },
  { key: "excluded_sectors", prompt: "Are there any sectors you want to exclude? If none, just say none." },
];

export default function VoiceOnboardingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isTyping, setIsTyping] = useState(false);
  const [voiceMuted, setVoiceMuted] = useState(false);
  const [shouldAutoSubmit, setShouldAutoSubmit] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [pendingRisk, setPendingRisk] = useState<string | null>(null);
  const [pendingCapital, setPendingCapital] = useState<number | null>(null);
  const [pendingHorizon, setPendingHorizon] = useState<number | null>(null);
  const [pendingExclusions, setPendingExclusions] = useState<string[] | null>(null);
  
  const listRef = useRef<HTMLDivElement | null>(null);

  const { speak, stop: stopSpeaking, isSpeaking, hasSupport: ttsSupport } = useSpeechSynthesis();
  
  const handleSpeechResult = useCallback((transcript: string, isFinal: boolean) => {
    setInput(transcript);
  }, []);

  const handleSpeechEnd = useCallback(() => {
    // Instead of calling handleUserInput directly (which causes circular references 
    // or stale closures), we set a state flag to trigger the submission safely via useEffect.
    setTimeout(() => {
      setShouldAutoSubmit(true);
    }, 500);
  }, []);

  const { 
    isListening, 
    startListening, 
    stopListening, 
    hasSupport: sttSupport,
    setTranscript
  } = useSpeechRecognition({
    onResult: handleSpeechResult,
    onEnd: handleSpeechEnd
  });

  // Hoisted function declarations to prevent ReferenceErrors
  function pushMessage(m: ChatMessage) {
    setMessages((s) => [...s, m]);
  }

  async function submitProfileAndRun(collected: Record<string, any>) {
    setIsTyping(true);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const payload = {
      capital: Number(collected.capital) || 100000,
      risk_appetite: collected.risk_appetite || "Moderate",
      investment_horizon_years: Number(collected.investment_horizon_years) || 5,
      goal: collected.goal || "Long-Term Wealth",
      preferred_sectors: [],
      excluded_sectors: collected.excluded_sectors || [],
      preferred_tickers: [],
      excluded_tickers: [],
      user_id: collected.user_id || "chat-user",
    };

    try {
      await fetch(`${API_BASE}/api/profile/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Chat User", role: "", capital: payload.capital, riskAppetite: payload.risk_appetite, horizon: `${payload.investment_horizon_years} Years`, goal: payload.goal }),
      });
    } catch (e) {
      // ignore
    }

    try {
      const res = await fetch(`${API_BASE}/api/recommend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setIsTyping(false);
      
      if (!res.ok) {
        const txt = await res.text();
        pushMessage({ role: "backend", text: `Pipeline error: ${res.status} ${txt}` });
        pushMessage({ role: "assistant", text: "I encountered an error while running the pipeline.", isNew: true });
        return;
      }
      const json = await res.json();
      
      if (json.session_id) {
         setSessionId(json.session_id);
         localStorage.setItem("apex_session_id", json.session_id);
      }
      
      // Output the natural language explanation instead of raw JSON!
      if (json.explanation) {
        pushMessage({ role: "assistant", text: json.explanation, isNew: true });
      } else {
        pushMessage({ role: "assistant", text: "The analysis is complete. Your optimal portfolio targets an expected return of " + (json.recommendation?.expected_return_pct || 12) + " percent. You can now ask me any follow-up questions about your portfolio!", isNew: true });
      }
      
    } catch (err: any) {
      setIsTyping(false);
      pushMessage({ role: "assistant", text: "There was a network error connecting to the quant engine.", isNew: true });
    }
  }

  async function handleUserInput(text: string) {
    if (!text.trim()) return;
    
    // Stop listening/speaking if user interrupts
    if (isListening) stopListening();
    if (isSpeaking) stopSpeaking();
    
    setInput("");
    setTranscript("");
    pushMessage({ role: "user", text });

    if (qIdx < QUESTIONS.length) {
      const q = QUESTIONS[qIdx];
      let parsed: any = text.trim();
      const lowerRaw = parsed.toLowerCase();
      
      // Handle conversational greetings
      if (["hi", "hello", "hey", "sup", "greetings"].includes(lowerRaw)) {
        setTimeout(() => {
          pushMessage({ role: "assistant", text: "Hello! Let's get started. " + q.prompt, isNew: true });
        }, 500);
        return;
      }
      
      // Simple natural language parsing
      if (q.key === "capital") {
        const lower = parsed.toLowerCase();
        let multiplier = 1;
        if (lower.includes("lakh")) multiplier = 100000;
        if (lower.includes("crore")) multiplier = 10000000;
        if (lower.includes("thousand") || /\bk\b/.test(lower)) multiplier = 1000;
        if (lower.includes("million") || /\bm\b/.test(lower)) multiplier = 1000000;
        
        let foundWord = false;
        const wordMap: Record<string, number> = { 
          "zero": 0, "one": 1, "a ": 1, "an ": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
          "eleven": 11, "twelve": 12, "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
          "hundred": 100, "half": 0.5, "quarter": 0.25, "couple": 2, "few": 3
        };
        
        for (const [word, num] of Object.entries(wordMap)) {
          if (lower.includes(word)) {
            parsed = num * multiplier;
            foundWord = true;
            break;
          }
        }
        
        if (!foundWord) {
          const cleanString = parsed.toString().replace(/,/g, '');
          const numericMatch = cleanString.match(/([0-9\.]+)/);
          if (numericMatch) {
              parsed = Number(numericMatch[1]) * multiplier;
          } else {
              parsed = null;
          }
        }
        
        if (parsed === null || Number.isNaN(parsed)) {
           setTimeout(() => { pushMessage({ role: "assistant", text: "I didn't quite catch a valid number. " + q.prompt, isNew: true }); }, 500);
           return;
        }
        
        if (parsed <= 0) {
           setTimeout(() => { pushMessage({ role: "assistant", text: "You must allocate a positive amount greater than zero. " + q.prompt, isNew: true }); }, 500);
           return;
        }
      } else if (q.key === "investment_horizon_years") {
        const wordMap: Record<string, number> = { 
          "zero": 0, "one": 1, "a ": 1, "an ": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
          "half": 0.5, "quarter": 0.25, "couple": 2, "few": 3
        };
        const lower = parsed.toLowerCase();
        let found = false;
        for (const [word, num] of Object.entries(wordMap)) {
          if (lower.includes(word)) {
            parsed = num;
            found = true;
            break;
          }
        }
        if (!found) {
          const cleanString = parsed.toString().replace(/,/g, '');
          const m = cleanString.match(/([0-9\.]+)/);
          if (m) {
             parsed = parseFloat(m[1]);
          } else {
             parsed = null;
          }
        }
        
        if (parsed === null || Number.isNaN(parsed) || parsed <= 0) {
           setTimeout(() => { pushMessage({ role: "assistant", text: "Please provide a valid number of years greater than zero.", isNew: true }); }, 500);
           return;
        }
      } else if (q.key === "excluded_sectors") {
        const lower = parsed.toLowerCase();
        parsed = (lower.includes("none") || lower.includes("no") || lower.includes("nothing")) 
          ? [] 
          : parsed.split(/[, ]+/).map((s: string) => s.trim()).filter(Boolean);
      } else if (q.key === "risk_appetite") {
        const lower = parsed.toLowerCase();
        if (lower.includes("aggressive") || lower.includes("high")) parsed = "Aggressive";
        else if (lower.includes("conservative") || lower.includes("low")) parsed = "Conservative";
        else if (lower.includes("moderate") || lower.includes("medium")) parsed = "Moderate";
        else {
           setTimeout(() => { pushMessage({ role: "assistant", text: "I couldn't determine your risk level. Please choose from Conservative, Moderate, or Aggressive.", isNew: true }); }, 500);
           return;
        }
      } else if (q.key === "goal") {
        const lower = parsed.toLowerCase();
        if (lower.includes("retire")) parsed = "Retirement";
        else if (lower.includes("short")) parsed = "Short-Term Growth";
        else if (lower.includes("passive") || lower.includes("income")) parsed = "Passive Income";
        else if (lower.includes("preserve") || lower.includes("safe") || lower.includes("preservation")) parsed = "Capital Preservation";
        else if (lower.includes("wealth") || lower.includes("long")) parsed = "Long-Term Wealth";
        else {
           setTimeout(() => { pushMessage({ role: "assistant", text: "I didn't recognize that goal. Please choose from Long-Term Wealth, Retirement, Short-Term Growth, Passive Income, or Capital Preservation.", isNew: true }); }, 500);
           return;
        }
      }

      const updatedAnswers = { ...answers, [q.key]: parsed };
      setAnswers(updatedAnswers);
      setQIdx((i) => i + 1);

      if (qIdx + 1 < QUESTIONS.length) {
        setTimeout(() => {
          pushMessage({ role: "assistant", text: QUESTIONS[qIdx + 1].prompt, isNew: true });
        }, 500);
      } else {
        setTimeout(() => {
          pushMessage({ role: "assistant", text: "Thank you. I am building your profile and running the quantitative pipeline now. Please wait a moment.", isNew: true });
          submitProfileAndRun(updatedAnswers);
        }, 500);
      }
    } else {
      if (!sessionId) {
         pushMessage({ role: "assistant", text: "I'm sorry, I don't have a portfolio session to reference. Please run the profile builder first.", isNew: true });
         return;
      }
      
      const lowerText = text.toLowerCase();
      
      // Consent flow response for Risk
      if (pendingRisk) {
        if (lowerText.includes("yes") || lowerText.includes("sure") || lowerText.includes("ok") || lowerText.includes("do it")) {
           const updatedAnswers = { ...answers, risk_appetite: pendingRisk };
           setAnswers(updatedAnswers);
           setPendingRisk(null);
           pushMessage({ role: "assistant", text: `Understood. Re-running the quantitative pipeline to generate an ${pendingRisk} portfolio...`, isNew: true });
           submitProfileAndRun(updatedAnswers).then(() => {
             pushMessage({ role: "assistant", text: "Your new portfolio is ready. All dashboards, backtesting, and risk centers have been instantly updated to reflect this new data! Please navigate to the Dashboard to see it.", isNew: true });
           });
           return;
        } else {
           setPendingRisk(null);
           pushMessage({ role: "assistant", text: "Okay, I have cancelled the portfolio update.", isNew: true });
           return;
        }
      }

      // Consent flow response for Capital
      if (pendingCapital !== null) {
        if (pendingCapital === -1) {
           // We asked "How much capital?", parse the response
           let parsed: any = lowerText;
           let multiplier = 1;
           if (lowerText.includes("lakh")) multiplier = 100000;
           if (lowerText.includes("crore")) multiplier = 10000000;
           if (lowerText.includes("thousand") || /\bk\b/.test(lowerText)) multiplier = 1000;
           if (lowerText.includes("million") || /\bm\b/.test(lowerText)) multiplier = 1000000;
           const cleanString = parsed.replace(/,/g, '');
           const m = cleanString.match(/([0-9\.]+)/);
           if (m) {
             const amt = Number(m[1]) * multiplier;
             setPendingCapital(amt);
             pushMessage({ role: "assistant", text: `I understand you want to change your capital to ₹${amt.toLocaleString('en-IN')}. Do you want me to re-balance your portfolio now? (Yes/No)`, isNew: true });
             return;
           } else {
             setPendingCapital(null);
             pushMessage({ role: "assistant", text: "I couldn't parse that amount. Capital update cancelled.", isNew: true });
             return;
           }
        } else if (lowerText.includes("yes") || lowerText.includes("sure") || lowerText.includes("ok") || lowerText.includes("do it")) {
           const updatedAnswers = { ...answers, capital: pendingCapital };
           setAnswers(updatedAnswers);
           setPendingCapital(null);
           pushMessage({ role: "assistant", text: `Understood. Re-running the quantitative pipeline to generate a portfolio with ₹${pendingCapital.toLocaleString('en-IN')} capital...`, isNew: true });
           submitProfileAndRun(updatedAnswers).then(() => {
             pushMessage({ role: "assistant", text: "Your new portfolio is ready. All dashboards, backtesting, and risk centers have been instantly updated to reflect this new data! Please navigate to the Dashboard to see it.", isNew: true });
           });
           return;
        } else {
           setPendingCapital(null);
           pushMessage({ role: "assistant", text: "Okay, I have cancelled the portfolio update.", isNew: true });
           return;
        }
      }

      // Consent flow response for Horizon
      if (pendingHorizon !== null) {
        if (lowerText.includes("yes") || lowerText.includes("sure") || lowerText.includes("ok") || lowerText.includes("do it")) {
           const updatedAnswers = { ...answers, investment_horizon_years: pendingHorizon };
           setAnswers(updatedAnswers);
           setPendingHorizon(null);
           pushMessage({ role: "assistant", text: `Understood. Re-running the quantitative pipeline with a ${pendingHorizon}-year horizon...`, isNew: true });
           submitProfileAndRun(updatedAnswers).then(() => {
             pushMessage({ role: "assistant", text: "Your new portfolio is ready. All dashboards have been instantly updated!", isNew: true });
           });
           return;
        } else {
           setPendingHorizon(null);
           pushMessage({ role: "assistant", text: "Okay, I have cancelled the portfolio update.", isNew: true });
           return;
        }
      }

      // Consent flow response for Exclusions
      if (pendingExclusions !== null) {
        if (lowerText.includes("yes") || lowerText.includes("sure") || lowerText.includes("ok") || lowerText.includes("do it")) {
           const updatedAnswers = { ...answers, excluded_sectors: [...(answers.excluded_sectors || []), ...pendingExclusions] };
           setAnswers(updatedAnswers);
           setPendingExclusions(null);
           pushMessage({ role: "assistant", text: `Understood. Re-running the quantitative pipeline excluding: ${pendingExclusions.join(", ")}...`, isNew: true });
           submitProfileAndRun(updatedAnswers).then(() => {
             pushMessage({ role: "assistant", text: "Your new portfolio is ready. All dashboards have been instantly updated!", isNew: true });
           });
           return;
        } else {
           setPendingExclusions(null);
           pushMessage({ role: "assistant", text: "Okay, I have cancelled the portfolio update.", isNew: true });
           return;
        }
      }
      
      // Intent detector for Rebalancing Risk
      let newRisk = null;
      if (lowerText.includes("aggressive") || lowerText.includes("more risk") || lowerText.includes("higher risk")) {
         newRisk = "Aggressive";
      } else if (lowerText.includes("conservative") || lowerText.includes("less risk") || lowerText.includes("lower risk") || lowerText.includes("safe")) {
         newRisk = "Conservative";
      } else if (lowerText.includes("moderate") || lowerText.includes("medium risk")) {
         newRisk = "Moderate";
      }
      
      if (newRisk && newRisk !== answers.risk_appetite) {
          setPendingRisk(newRisk);
          pushMessage({ role: "assistant", text: `I understand you want to change your risk profile to ${newRisk}. Do you want me to re-balance your portfolio now? (Yes/No)`, isNew: true });
          return;
      }

      // Intent detector for Rebalancing Capital
      let newCapital: number | null = null;
      if ((lowerText.includes("capital") || lowerText.includes("money") || lowerText.includes("invest") || lowerText.includes("amount")) && (lowerText.match(/[0-9]/) || lowerText.includes("lakh") || lowerText.includes("crore") || lowerText.includes("thousand"))) {
         let parsed: any = lowerText;
         let multiplier = 1;
         if (lowerText.includes("lakh")) multiplier = 100000;
         if (lowerText.includes("crore")) multiplier = 10000000;
         if (lowerText.includes("thousand") || /\bk\b/.test(lowerText)) multiplier = 1000;
         if (lowerText.includes("million") || /\bm\b/.test(lowerText)) multiplier = 1000000;
         const cleanString = parsed.replace(/,/g, '');
         const m = cleanString.match(/([0-9\.]+)/);
         if (m) newCapital = Number(m[1]) * multiplier;
      }
      
      if (newCapital && newCapital !== answers.capital) {
          setPendingCapital(newCapital);
          pushMessage({ role: "assistant", text: `I understand you want to change your capital to ₹${newCapital.toLocaleString('en-IN')}. Do you want me to re-balance your portfolio now? (Yes/No)`, isNew: true });
          return;
      } else if (lowerText.includes("adjust") && (lowerText.includes("capital") || lowerText.includes("money") || lowerText.includes("amount"))) {
          setPendingCapital(-1);
          pushMessage({ role: "assistant", text: "How much capital would you like to allocate instead?", isNew: true });
          return;
      }

      // Intent detector for Horizon
      let newHorizon: number | null = null;
      if (lowerText.includes("horizon") || lowerText.includes("time") || lowerText.includes("years") || lowerText.includes("duration")) {
          const m = lowerText.match(/([0-9]+)\s*year/);
          if (m) {
              newHorizon = parseInt(m[1], 10);
          } else {
              const wordsToNum: any = { "one":1, "two":2, "three":3, "four":4, "five":5, "six":6, "seven":7, "eight":8, "nine":9, "ten":10, "fifteen":15, "twenty":20 };
              for (const [w, n] of Object.entries(wordsToNum)) {
                  if (lowerText.includes(`${w} year`)) { newHorizon = n as number; break; }
              }
          }
          if (newHorizon) {
             setPendingHorizon(newHorizon);
             pushMessage({ role: "assistant", text: `I understand you want to change your investment horizon to ${newHorizon} years. Do you want me to re-balance your portfolio now? (Yes/No)`, isNew: true });
             return;
          }
      }

      // Intent detector for Exclusions
      if (lowerText.includes("exclude") || lowerText.includes("remove") || lowerText.includes("don't want")) {
          const sectors = ["it", "finance", "energy", "pharma", "fmcg", "auto", "bank", "metal", "tech", "technology"];
          const found = sectors.filter(s => lowerText.match(new RegExp(`\\b${s}\\b`)));
          if (found.length > 0) {
              setPendingExclusions(found);
              pushMessage({ role: "assistant", text: `I understand you want to exclude the ${found.join(", ")} sector(s) from your portfolio. Do you want me to re-balance your portfolio now? (Yes/No)`, isNew: true });
              return;
          }
      }

      setIsTyping(true);
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        fetch(`${API_BASE}/api/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, message: text }),
        })
        .then(res => {
           setIsTyping(false);
           if (!res.ok) throw new Error("API Error");
           return res.json();
        })
        .then(json => {
           pushMessage({ role: "assistant", text: json.answer, isNew: true });
        })
        .catch(err => {
           setIsTyping(false);
           pushMessage({ role: "assistant", text: "I had trouble connecting to the quant analysis engine.", isNew: true });
        });
      } catch (err) {
        setIsTyping(false);
        pushMessage({ role: "assistant", text: "There was a network error connecting to the chat engine.", isNew: true });
      }
    }
  }

  // --- USE EFFECTS ---

  useEffect(() => {
    setMounted(true);
    
    const loadHistory = async () => {
      const sid = localStorage.getItem("apex_session_id");
      if (sid) {
        setSessionId(sid);
        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
          
          // First, load the actual recommendation to populate answers state
          const recRes = await fetch(`${API_BASE}/api/recommend/${sid}`);
          if (recRes.ok) {
            const data = await recRes.json();
            if (data.recommendation && data.recommendation.investor_profile) {
              const prof = data.recommendation.investor_profile;
              setAnswers({
                capital: prof.capital,
                risk_appetite: prof.risk_appetite,
                investment_horizon_years: parseInt(prof.horizon) || 5,
                goal: prof.goal,
                user_id: sid
              });
              setQIdx(QUESTIONS.length); // Skip onboarding questions
            }
          }

          // Then, load chat history if it exists
          const res = await fetch(`${API_BASE}/api/chat/${sid}/history`);
          if (res.ok) {
            const historyData = await res.json();
            if (historyData && historyData.length > 0) {
              const mapped = historyData.map((m: any) => ({
                role: m.role,
                text: m.content,
                isNew: false
              }));
              setMessages(mapped);
              return;
            } else if (recRes.ok) {
              // We have a session but no chat history (e.g., from Quick Generate)
              setMessages([{ role: "assistant", text: "I see you have an active portfolio. How would you like to adjust it? You can tell me to make it more aggressive, more conservative, or ask me questions about it.", isNew: true }]);
              return;
            }
          }
        } catch (e) {
          console.error("Failed to load session data", e);
        }
      }
      
      // Fallback to initial greeting if no session at all
      const greeting = "Hello. I am your AI quantitative advisor. I will help you configure your investment profile. " + QUESTIONS[0].prompt;
      setMessages([
        { role: "assistant", text: greeting, isNew: true },
      ]);
    };
    
    loadHistory();
  }, []);

  // Handle auto-submit from speech end
  useEffect(() => {
    if (shouldAutoSubmit) {
      if (input.trim()) {
        handleUserInput(input);
      }
      setShouldAutoSubmit(false);
    }
  }, [shouldAutoSubmit, input, handleUserInput]);

  // Handle auto-scrolling
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // Handle auto-speaking new assistant messages
  useEffect(() => {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant" && lastMsg.isNew && !voiceMuted) {
      speak(lastMsg.text);
      // Mark as read so we don't speak it again on re-renders
      lastMsg.isNew = false;
    }
  }, [messages, speak, voiceMuted]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" && e.ctrlKey) {
        e.preventDefault();
        isListening ? stopListening() : startListening();
      }
      if (e.code === "Escape") {
        stopSpeaking();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isListening, startListening, stopListening, stopSpeaking]);

  if (!mounted) return null;

  function onSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (input.trim()) {
      handleUserInput(input);
    }
  }

  function toggleMute() {
    if (!voiceMuted) stopSpeaking();
    setVoiceMuted(!voiceMuted);
  }

  function replayLast() {
    const reversed = [...messages].reverse();
    const lastAssistant = reversed.find(m => m.role === "assistant");
    if (lastAssistant) {
      stopSpeaking();
      speak(lastAssistant.text);
      setVoiceMuted(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full bg-white rounded-3xl shadow-soft border border-slate-200 overflow-hidden relative">
      

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col h-full bg-[#F7F9FC] relative">
        
        {/* Top Header */}
        <div className="h-16 border-b border-slate-200/60 flex items-center justify-between px-6 sm:px-8 bg-white shrink-0 shadow-sm z-10">
          <h2 className="text-[15px] font-extrabold text-[#0F172A]">AI Advisor Session</h2>
          <div className="flex items-center gap-3">
            <button 
              onClick={replayLast}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-full transition-colors"
              title="Replay last message"
            >
              <RefreshCw className="h-4.5 w-4.5" />
            </button>
            <button 
              onClick={toggleMute}
              className={`p-2 rounded-full transition-colors ${voiceMuted ? "bg-red-50 text-red-500 hover:bg-red-100" : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"}`}
              title={voiceMuted ? "Unmute AI" : "Mute AI"}
            >
              {voiceMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        {/* Chat Log */}
        <div 
          ref={listRef} 
          className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-6"
        >
          <div className="max-w-3xl mx-auto pb-20">
            {messages.map((m, idx) => (
              <ChatBubble 
                key={idx} 
                role={m.role} 
                text={m.text} 
                isSpeaking={isSpeaking && idx === messages.length - 1 && m.role === "assistant"}
              />
            ))}
            
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start mb-6"
              >
                <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4 flex gap-1.5 shadow-sm rounded-tl-none items-center h-[52px]">
                  <motion.div className="w-2 h-2 bg-[#0E8A5A] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                  <motion.div className="w-2 h-2 bg-[#0E8A5A] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                  <motion.div className="w-2 h-2 bg-[#0E8A5A] rounded-full" animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Input Area */}
        <div className="bg-white border-t border-slate-200/60 p-6 shrink-0 relative z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.02)]">
          <div className="max-w-3xl mx-auto w-full">
            <form onSubmit={onSubmit} className="flex gap-4 items-end">
              
              {/* Mic Button */}
              <MicrophoneButton 
                isListening={isListening} 
                onClick={isListening ? stopListening : startListening} 
                disabled={!sttSupport}
              />
              
              {/* Input Box */}
              <div className="flex-1 relative">
                <input 
                  value={input} 
                  onChange={(e) => setInput(e.target.value)} 
                  placeholder={isListening ? "Listening..." : "Type your answer or speak naturally..."}
                  className={`w-full bg-[#F7F9FC] text-[14px] font-medium border border-slate-200/80 rounded-[16px] px-5 py-4 focus:outline-none focus:border-[#0E8A5A]/50 transition-colors shadow-inner ${isListening ? "border-[#0E8A5A]/30 bg-[#0E8A5A]/5" : ""}`}
                />
                
                {/* Listening Wave Anim */}
                {isListening && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <motion.div className="w-1 bg-[#0E8A5A] rounded-full" animate={{ height: [4, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} />
                    <motion.div className="w-1 bg-[#0E8A5A] rounded-full" animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} />
                    <motion.div className="w-1 bg-[#0E8A5A] rounded-full" animate={{ height: [4, 10, 4] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} />
                  </div>
                )}
              </div>
              
              {/* Send Button */}
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="h-[54px] w-[54px] bg-[#0E8A5A] text-white rounded-[16px] flex items-center justify-center hover:bg-[#0c784e] transition-colors disabled:opacity-50 disabled:hover:bg-[#0E8A5A] shadow-soft shrink-0"
              >
                <Send className="h-5 w-5 ml-1" />
              </button>
              
            </form>
          </div>
        </div>
      </div>
      
    </div>
  );
}
