"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import QRScanner from "@/components/QRScanner";
import ApprovalModal from "@/components/ApprovalModal";
import { supabase } from "@/lib/supabase";
import { Student } from "@/lib/types";
import { LogoutButton } from "@/components/LogoutButton";

export default function HomePage() {
  const [pending, setPending] = useState<Student | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; kind: "ok" | "err" } | null>(
    null
  );
  const lockRef = useRef(false);

  const showToast = (msg: string, kind: "ok" | "err" = "ok") => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 2500);
  };

  const handleScan = useCallback(
    async (text: string) => {
      if (lockRef.current || pending) return;
      lockRef.current = true;

      const { data, error } = await supabase
        .from("students")
        .select("*")
        .eq("id", text)
        .maybeSingle();

      if (error || !data) {
        showToast(`Unknown QR: ${text}`, "err");
        setTimeout(() => (lockRef.current = false), 1500);
        return;
      }

      setPending(data as Student);
    },
    [pending]
  );

  const computeSessionWindow = (date: Date) => {
    const start = new Date(date);
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    const fmt = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
        d.getDate()
      ).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:00`;

    return `${fmt(start)} - ${String(end.getHours()).padStart(2, "0")}:00`;
  };

  const handleApprove = async () => {
    if (!pending) return;
    setLoading(true);

    const session_window = computeSessionWindow(new Date());

    const { error } = await supabase.from("attendance_logs").insert({
      student_id: pending.id,
      name: pending.name,
      session_window,
    });

    setLoading(false);

    if (error) {
      showToast(error.message, "err");
    } else {
      showToast(`${pending.name} marked present`, "ok");
    }

    setPending(null);
    setTimeout(() => (lockRef.current = false), 1200);
  };

  const handleReject = () => {
    setPending(null);
    setTimeout(() => (lockRef.current = false), 800);
  };

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur bg-white/70 border-b border-slate-200">
        <div className="max-w-3xl mx-auto flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white grid place-items-center text-lg">
              📷
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight text-slate-900">
                QR Attendance
              </h1>
              <p className="text-xs text-slate-500 leading-tight">
                Scanner
              </p>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 active:scale-[.98] transition"
          >
            Dashboard
          </Link>
           <LogoutButton />
        </div>
      </header>

      {/* Body */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-100 p-4">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-square">
              <QRScanner onScan={handleScan} paused={!!pending} />
              {/* Corner brackets */}
              <Corner className="top-3 left-3 border-t-2 border-l-2" />
              <Corner className="top-3 right-3 border-t-2 border-r-2" />
              <Corner className="bottom-3 left-3 border-b-2 border-l-2" />
              <Corner className="bottom-3 right-3 border-b-2 border-r-2" />
            </div>

            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="w-2 h-2 rounded-full bg-green-500 pulse-ring" />
              <p className="text-sm text-slate-600">
                Point camera at a student QR code
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            Records are grouped into 1-hour session windows
          </p>
        </div>
      </section>

      {/* Modal */}
      <ApprovalModal
        student={pending}
        loading={loading}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeIn_.2s_ease-out]">
          <div
            className={`px-5 py-3 rounded-2xl shadow-xl text-sm font-medium text-white flex items-center gap-2 ${
              toast.kind === "ok" ? "bg-green-600" : "bg-red-600"
            }`}
          >
            <span>{toast.kind === "ok" ? "✓" : "✕"}</span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}
    </main>
  );
}

function Corner({ className = "" }: { className?: string }) {
  return (
    <div
      className={`absolute w-8 h-8 border-green-400 rounded-md pointer-events-none ${className}`}
    />
  );
}