"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { AttendanceLog } from "@/lib/types";

export default function DashboardPage() {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [sessions, setSessions] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance_logs")
      .select("*")
      .order("scanned_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setLogs(data as AttendanceLog[]);
      const uniq = Array.from(
        new Set((data as AttendanceLog[]).map((l) => l.session_window))
      ).sort().reverse();
      setSessions(uniq);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (selectedSession === "ALL") return logs;
    return logs.filter((l) => l.session_window === selectedSession);
  }, [logs, selectedSession]);

  const downloadCSV = () => {
    if (filtered.length === 0) return;
    const headers = ["ID", "Student ID", "Name", "Scanned At", "Session Window"];
    const rows = filtered.map((l) => [
      l.id,
      l.student_id,
      l.name,
      new Date(l.scanned_at).toLocaleString(),
      l.session_window,
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((r) =>
        r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance_${
      selectedSession === "ALL" ? "all" : selectedSession.replace(/[: ]/g, "_")
    }.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4">
      <header className="max-w-5xl mx-auto flex flex-wrap justify-between items-center gap-3 py-4">
        <h1 className="text-2xl font-bold text-slate-800">
          📊 Attendance Dashboard
        </h1>
        <Link
          href="/"
          className="px-4 py-2 rounded-lg bg-slate-800 text-white text-sm font-medium hover:bg-slate-700"
        >
          ← Scanner
        </Link>
      </header>

      <section className="max-w-5xl mx-auto bg-white rounded-2xl shadow-md p-4">
        <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">Session:</label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="ALL">All sessions</option>
              {sessions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={load}
              className="px-4 py-2 rounded-lg border border-slate-300 text-sm hover:bg-slate-50"
            >
              🔄 Refresh
            </button>
            <button
              onClick={downloadCSV}
              disabled={filtered.length === 0}
              className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
            >
              ⬇️ Download CSV
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-center py-10 text-slate-500">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-center py-10 text-slate-500">No records yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="px-3 py-2 text-left">Student ID</th>
                  <th className="px-3 py-2 text-left">Name</th>
                  <th className="px-3 py-2 text-left">Scanned At</th>
                  <th className="px-3 py-2 text-left">Session</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-b border-slate-100">
                    <td className="px-3 py-2 font-mono">{l.student_id}</td>
                    <td className="px-3 py-2">{l.name}</td>
                    <td className="px-3 py-2 text-slate-600">
                      {new Date(l.scanned_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {l.session_window}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}