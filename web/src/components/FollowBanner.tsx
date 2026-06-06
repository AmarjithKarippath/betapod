import { useEffect, useState } from "react";

const STORAGE_KEY = "betapod_follow_dismissed_at";
const REAPPEAR_AFTER_DAYS = 14;
const X_URL = "https://x.com/AmarKarippath";

export function FollowBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setShow(true);
      return;
    }
    const dismissedAt = Number(raw);
    const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
    if (daysSince > REAPPEAR_AFTER_DAYS) setShow(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, String(Date.now()));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="bg-brand-50 border-b border-brand-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-3 text-sm">
        <p className="text-slate-700">
          BetaPod is free to use — if it helped you, follow{" "}
          <a
            href={X_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-700 hover:underline"
          >
            @AmarKarippath
          </a>{" "}
          on X. That&apos;s the only ask.
        </p>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-slate-400 hover:text-slate-700 text-lg leading-none flex-shrink-0"
        >
          ×
        </button>
      </div>
    </div>
  );
}
