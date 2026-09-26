"use client";

import { useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-bold text-center mb-2 text-indigo-400">Join Study Room</h1>
        <p className="text-slate-400 text-center text-sm mb-6">
          Create an account to start collaborating with peers
        </p>

        {submitted ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              ✉️
            </div>
            <h2 className="text-lg font-semibold text-slate-100 mb-2">Check your email</h2>
            <p className="text-slate-400 text-sm mb-6">
              We've sent a verification link to <span className="text-indigo-400 font-medium">{form.email}</span>.
              <br />
              <span className="text-xs text-slate-500">(Check your server terminal console for the simulated link!)</span>
            </p>
            <Link
              href="/login"
              className="inline-block w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 font-medium rounded-lg text-center transition"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Alex Mercer"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="alex@university.edu"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg transition text-sm mt-2"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

            <p className="text-center text-xs text-slate-400 mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-400 hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}