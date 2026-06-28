"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear client-side profile and tokens
    try {
      localStorage.removeItem("user_onboarding_profile");
    } catch (e) {}
    // Redirect to login
    router.replace("/login");
  }, [router]);

  return <div className="p-8">Signing out...</div>;
}
