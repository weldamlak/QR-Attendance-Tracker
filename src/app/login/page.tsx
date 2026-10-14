"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    setLoading(false);

    if (!res.ok) {
      setError("Invalid username or password");
      return;
    }

    router.replace(from);
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-slate-100 p-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white grid place-items-center text-2xl mx-auto mb-4">
          🔒
        </div>

        <h1 className="text-xl font-semibold text-slate-900 text-center">
          Sign in
        </h1>
        <p className="text-xs text-slate-500 text-center mt-1 mb-6">
          QR Attendance Tracker
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[.98] transition disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </div>
      </form>
    </main>
  );
}
