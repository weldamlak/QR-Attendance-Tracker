"use client";

import { useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";

type Props = {
  onScan: (text: string) => void;
  paused?: boolean;
};

export default function QRScanner({ onScan, paused = false }: Props) {
  const containerId = "qr-reader";
  const pausedRef = useRef(paused);
  const onScanRef = useRef(onScan);
  const runningRef = useRef(false);
  const startingRef = useRef(false);

  // keep latest props in refs so the scanner effect runs once
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onScanRef.current = onScan;
  }, [onScan]);

  useEffect(() => {
    const scanner = new Html5Qrcode(containerId, { verbose: false });
    let cancelled = false;

    const start = async () => {
      if (startingRef.current || runningRef.current) return;
      startingRef.current = true;
      try {
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            if (!pausedRef.current) onScanRef.current(decodedText.trim());
          },
          () => {
            /* per-frame decode errors are normal */
          }
        );
        runningRef.current = true;
      } catch (err) {
        // Swallow "scanner already running" / "not found" style noise
        console.warn("QR scanner start:", err);
      } finally {
        startingRef.current = false;
      }
    };

    start();

    return () => {
      cancelled = true;

      const stop = async () => {
        // If we're mid-start, wait a tick until runningRef flips
        let waited = 0;
        while (startingRef.current && waited < 20) {
          await new Promise((r) => setTimeout(r, 50));
          waited++;
        }
        if (!runningRef.current) return;
        runningRef.current = false;
        try {
          await scanner.stop();
        } catch {
          /* already stopped — ignore */
        }
        try {
          scanner.clear();
        } catch {
          /* ignore */
        }
      };

      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="absolute inset-0">
      <div id={containerId} className="w-full h-full" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-black/40 [mask-image:radial-gradient(circle_at_center,transparent_120px,black_121px)]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-60 h-60 rounded-2xl ring-2 ring-white/60" />
      </div>
    </div>
  );
}