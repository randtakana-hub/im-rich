"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { RCIcon } from "@/components/RCIcon";

export function SendRCModal({
  username,
  available,
  onClose,
  onSent,
}: {
  username: string;
  available: number;
  onClose: () => void;
  onSent: (amount: number) => void;
}) {
  const [amount, setAmount] = useState(100);
  const [stage, setStage] = useState<"input" | "confirm" | "success" | "error">("input");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/rc/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverUsername: username,
          amount,
          clientRequestId: crypto.randomUUID(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error ?? "Something went wrong.");
        setStage("error");
        return;
      }
      setStage("success");
      onSent(amount);
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStage("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center">
      <div className="panel-glow w-full max-w-sm animate-rise-in rounded-b-none p-6 md:rounded-b-2xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-xl text-parchment-100">Send Rich Coin</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-white/10">
            <X size={18} className="text-parchment-400" />
          </button>
        </div>

        {stage === "input" && (
          <div className="space-y-4">
            <div>
              <p className="mb-1 text-xs text-parchment-500">To</p>
              <p className="text-parchment-100">@{username}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-parchment-500">Amount</p>
              <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-ink-900 px-4 py-3">
                <RCIcon size={18} />
                <input
                  type="number"
                  min={1}
                  max={available}
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full bg-transparent tabular text-lg text-parchment-100 outline-none"
                />
              </div>
            </div>
            <p className="text-xs text-parchment-500">Available: {available.toLocaleString()} RC</p>
            <div className="flex gap-3 pt-2">
              <button onClick={onClose} className="btn-ghost flex-1">
                Cancel
              </button>
              <button
                onClick={() => setStage("confirm")}
                disabled={amount <= 0 || amount > available}
                className="btn-gold flex-1 disabled:opacity-50"
              >
                Send RC
              </button>
            </div>
          </div>
        )}

        {stage === "confirm" && (
          <div className="space-y-5">
            <p className="text-parchment-200">
              You are about to send{" "}
              <span className="font-medium text-gold-300">{amount.toLocaleString()} RC</span> to{" "}
              <span className="font-medium text-parchment-100">@{username}</span>.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setStage("input")} className="btn-ghost flex-1">
                Back
              </button>
              <button onClick={handleSend} disabled={loading} className="btn-gold flex-1 disabled:opacity-60">
                {loading ? "Sending…" : "Confirm & Send"}
              </button>
            </div>
          </div>
        )}

        {stage === "success" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-wealth-up/10">
              <RCIcon size={28} />
            </div>
            <p className="text-parchment-100">
              {amount.toLocaleString()} RC sent successfully to @{username}.
            </p>
            <button onClick={onClose} className="btn-gold w-full">
              Done
            </button>
          </div>
        )}

        {stage === "error" && (
          <div className="space-y-5 text-center">
            <p className="rounded-lg bg-wealth-down/10 px-3 py-2 text-sm text-wealth-down">{errorMsg}</p>
            <button onClick={() => setStage("input")} className="btn-ghost w-full">
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
