"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { TrendingUp, ShieldCheck, Lock, Activity, Globe, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [flow, setFlow] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const params = new URLSearchParams(window.location.search);
    const flowParam = params.get("flow");
    if (flowParam) {
      setFlow(flowParam);
      if (flowParam === "open-account") {
        setActiveTab("signup");
      }
    }
  }, []);

  if (!mounted) return null;

  const handleSuccessRedirect = () => {
    router.push("/dashboard/advisor");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setIsSubmitting(true);
    setAuthError(null);

    try {
      if (activeTab === "signup") {
        // Firebase Create User
        await createUserWithEmailAndPassword(auth, email, password);
        
        // Save profile if needed
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        const profilePayload = { name };
        fetch(`${API_BASE}/api/profile/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profilePayload),
        }).catch(() => {});

        try {
          window.dispatchEvent(new Event("profileUpdated"));
        } catch (err) {}
        
        handleSuccessRedirect();
      } else {
        // Firebase Sign In
        await signInWithEmailAndPassword(auth, email, password);
        handleSuccessRedirect();
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setAuthError("Invalid email or password.");
      } else if (err.code === "auth/email-already-in-use") {
        setAuthError("Account already exists with this email.");
      } else if (err.code === "auth/weak-password") {
        setAuthError("Password must be at least 6 characters.");
      } else {
        setAuthError(err.message || "Failed to authenticate. Check your connection.");
      }
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-[#F7F9FC]">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 inline-flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-slate-800 transition-colors z-20"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Home
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 w-full">
        {/* Left Side: Illustration & Stats */}
        <div className="hidden lg:flex lg:col-span-5 bg-[#0F172A] relative flex-col justify-between p-12 text-white overflow-hidden">
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          <div className="absolute -top-40 -left-40 h-[400px] w-[400px] rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Logo */}
          <div className="flex items-center gap-2.5 relative z-10">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#0E8A5A] text-white">
              <TrendingUp className="h-5.5 w-5.5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Apex <span className="font-semibold text-[#0E8A5A]">Intelligence</span>
            </span>
          </div>

          {/* Marketing Copy */}
          <div className="space-y-6 max-w-md relative z-10 my-auto">
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
              Institutional Infrastructure for Capital
            </h2>
            <p className="text-[14px] text-slate-400 font-medium leading-relaxed">
              Powering portfolio rebalancing models and real-time sentiment NLP for quantitative desks, family offices, and wealth managers worldwide.
            </p>

            {/* Feature Bullets */}
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[#0E8A5A]">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <span>SOC2 Type II Attestation Audited</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[#0E8A5A]">
                  <Lock className="h-4 w-4" />
                </div>
                <span>AES-256 Multi-Layer Cryptographic Enclave</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] font-semibold text-slate-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/10 text-[#0E8A5A]">
                  <Globe className="h-4 w-4" />
                </div>
                <span>Sovereign Cloud & Hybrid VPC Deployments</span>
              </div>
            </div>
          </div>

          {/* System Status Card */}
          <div className="border border-slate-800 rounded-[18px] bg-slate-950/60 backdrop-blur-md p-4 relative z-10">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">System Status</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0E8A5A]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#0E8A5A] animate-pulse"></span> All Systems Operational
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/40">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">API Latency</p>
                <p className="text-[13px] font-bold text-slate-200 mt-0.5">12ms</p>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/40">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Uptime</p>
                <p className="text-[13px] font-bold text-slate-200 mt-0.5">99.997%</p>
              </div>
              <div className="bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/40">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Nodes</p>
                <p className="text-[13px] font-bold text-slate-200 mt-0.5">38 Active</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tab Forms */}
        <div className="col-span-1 lg:col-span-7 flex flex-col justify-center items-center px-6 sm:px-12 py-20 bg-white">
          <div className="w-full max-w-[420px] space-y-8">
            {/* Logo for mobile only */}
            <div className="flex lg:hidden items-center gap-2 justify-center mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#0E8A5A] text-white">
                <TrendingUp className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#0F172A]">Apex Intel</span>
            </div>

            {/* Header */}
            <div className="text-center lg:text-left space-y-2">
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
                {activeTab === "signin" ? "Access Quantitative Desk" : "Create Account"}
              </h1>
              <p className="text-[13px] font-semibold text-slate-400">
                Please enter your credentials below to authenticate.
              </p>
            </div>

            {/* Toggle tabs */}
            <div className="flex rounded-xl bg-[#F7F9FC] p-1 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTab("signin")}
                className={`flex-1 text-center py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                  activeTab === "signin"
                    ? "bg-white text-[#0F172A] shadow-soft"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("signup")}
                className={`flex-1 text-center py-2.5 rounded-lg text-[13px] font-bold transition-all ${
                  activeTab === "signup"
                    ? "bg-white text-[#0F172A] shadow-soft"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                  Corporate Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="name@firm.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-3 text-[14px] font-semibold focus:outline-none focus:border-[#0E8A5A] transition-colors"
                />
              </div>

              {activeTab === "signup" && (
                <div className="space-y-1.5">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">Full name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] px-4 py-3 text-[14px] font-semibold focus:outline-none focus:border-[#0E8A5A] transition-colors"
                  />
                </div>
              )}

              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center">
                  <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
                    Password
                  </label>
                  {activeTab === "signin" && (
                    <a href="#" className="text-[12px] font-bold text-[#0E8A5A] hover:underline">
                      Forgot Password?
                    </a>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200/80 rounded-[14px] pl-4 pr-11 py-3 text-[14px] font-semibold focus:outline-none focus:border-[#0E8A5A] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {authError && (
                  <p className="text-red-500 text-[11px] font-semibold mt-1">{authError}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex h-12 items-center justify-center rounded-[14px] bg-[#0E8A5A] text-white font-bold text-[14px] shadow-soft hover:bg-[#0c784e] transition-all hover:shadow-premium hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
              >
                {isSubmitting ? "Validating Session..." : activeTab === "signin" ? "Sign In" : "Create Account"}
              </button>
            </form>

            {/* Social logins */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <hr className="flex-1 border-slate-200/60" />
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Or Continue With</span>
                <hr className="flex-1 border-slate-200/60" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleSuccessRedirect}
                  className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white text-[13px] font-bold text-slate-700 shadow-soft hover:bg-slate-50 transition-colors"
                >
                  <svg className="h-4.5 w-4.5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Google</span>
                </button>
                <button
                  onClick={handleSuccessRedirect}
                  className="flex h-11 items-center justify-center gap-2 rounded-[14px] border border-slate-200 bg-white text-[13px] font-bold text-slate-700 shadow-soft hover:bg-slate-50 transition-colors"
                >
                  <Lock className="h-4 w-4 text-slate-500" />
                  <span>Enterprise SSO</span>
                </button>
              </div>
            </div>

            {/* Privacy note */}
            <p className="text-center text-[11px] leading-relaxed text-slate-400 font-semibold pt-4">
              Secure Access Session. Protected by TLS 1.3 encryption protocols. By signing in, you confirm alignment with corporate database access policies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
