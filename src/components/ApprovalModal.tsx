"use client";

import { Student } from "@/lib/types";

type Props = {
  student: Student | null;
  loading: boolean;
  onApprove: () => void;
  onReject: () => void;
};

export default function ApprovalModal({
  student,
  loading,
  onApprove,
  onReject,
}: Props) {
  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm grid place-items-center p-4 animate-[fadeIn_.15s_ease-out]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-slate-100">
        <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 grid place-items-center text-2xl mx-auto mb-4">
          ✓
        </div>

        <h2 className="text-lg font-semibold text-slate-900 text-center">
          Confirm Attendance
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1 mb-5">
          Verify the details below before approving
        </p>

        <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3">
          <Row label="Student ID" value={student.id} mono />
          <div className="h-px bg-slate-200" />
          <Row label="Name" value={student.name} />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onReject}
            disabled={loading}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-medium hover:bg-slate-50 active:scale-[.98] transition disabled:opacity-50"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 active:scale-[.98] transition disabled:opacity-50"
          >
            {loading ? "Saving…" : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span
        className={`text-sm font-semibold text-slate-900 ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}