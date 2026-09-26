"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("verifying"); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState("");
  const hasRequested = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing.");
      return;
    }

    // Prevent duplicate request in React StrictMode
    if (hasRequested.current) return;
    hasRequested.current = true;

    const verify = async () => {
      try {
        const data = await apiRequest(`/auth/verify-email?token=${token}`);
        setStatus("success");
        setMessage(data.message);
      } catch (err) {
        setStatus("error");
        setMessage(err.message);
      }
    };

    verify();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl text-center">
        {status === "verifying" && (
          <div className="py-8">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-slate-300 font-medium">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✓
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Email Verified!</h2>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <Link
              href="/login"
              className="inline-block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-lg text-center transition"
            >
              Sign In to Your Account
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="py-6">
            <div className="w-16 h-16 bg-rose-500/10 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl font-bold">
              ✕
            </div>
            <h2 className="text-xl font-bold text-slate-100 mb-2">Notice</h2>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <div className="space-y-2">
              <Link
                href="/login"
                className="inline-block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-lg text-center transition text-sm"
              >
                Go to Login
              </Link>
              <Link
                href="/register"
                className="inline-block w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg text-center transition text-sm"
              >
                Create Another Account
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}