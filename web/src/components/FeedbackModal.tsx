import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";

type Kind = "bug" | "improvement" | "enhancement";

export function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [kind, setKind] = useState<Kind>("bug");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (message.trim().length < 5) {
      setError("Please write at least a few words.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/feedback", {
        kind,
        message: message.trim(),
        page_url: window.location.pathname,
      });
      toast.push("Thanks for the feedback!", "success");
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-lg font-semibold">Send feedback</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Type</label>
            <div className="flex gap-2">
              {(["bug", "improvement", "enhancement"] as Kind[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border capitalize ${
                    kind === k
                      ? "bg-brand-600 text-white border-brand-600"
                      : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Message</label>
            <textarea
              className="input min-h-[120px]"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                kind === "bug"
                  ? "What broke? What did you expect to happen?"
                  : kind === "improvement"
                    ? "What could work better?"
                    : "What new feature would you like?"
              }
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn-primary">
              {submitting ? "Sending…" : "Send"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
