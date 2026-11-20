import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { TestRequest } from "@/types/api";

type Props = {
  req: Pick<TestRequest, "id" | "app_name" | "tester_count" | "enrolled_count" | "duration_days">;
  /** True right after the listing was created: changes the heading. */
  justCreated?: boolean;
  onClose: () => void;
};

export function listingUrl(id: number) {
  return `${window.location.origin}/requests/${id}`;
}

function defaultMessage(req: Props["req"]) {
  const needed = Math.max(req.tester_count - req.enrolled_count, 0) || req.tester_count;
  return (
    `I'm looking for ${needed} Android testers for ${req.app_name} ` +
    `(${req.duration_days}-day Google Play closed test). ` +
    `Help an indie dev ship: join in one tap on BetaPod 👇`
  );
}

const enc = encodeURIComponent;

const NETWORKS: { name: string; className: string; href: (text: string, url: string) => string }[] = [
  { name: "X", className: "bg-black hover:bg-slate-800", href: (t, u) => `https://twitter.com/intent/tweet?text=${enc(t)}&url=${enc(u)}` },
  { name: "WhatsApp", className: "bg-[#25D366] hover:bg-[#1ebe5b]", href: (t, u) => `https://wa.me/?text=${enc(`${t} ${u}`)}` },
  { name: "LinkedIn", className: "bg-[#0A66C2] hover:bg-[#0958a8]", href: (_t, u) => `https://www.linkedin.com/sharing/share-offsite/?url=${enc(u)}` },
  { name: "Facebook", className: "bg-[#1877F2] hover:bg-[#0f68dc]", href: (_t, u) => `https://www.facebook.com/sharer/sharer.php?u=${enc(u)}` },
  { name: "Reddit", className: "bg-[#FF4500] hover:bg-[#e03d00]", href: (t, u) => `https://www.reddit.com/submit?url=${enc(u)}&title=${enc(t)}` },
  { name: "Telegram", className: "bg-[#229ED9] hover:bg-[#1b8cc2]", href: (t, u) => `https://t.me/share/url?url=${enc(u)}&text=${enc(t)}` },
];

export function ShareModal({ req, justCreated, onClose }: Props) {
  const url = listingUrl(req.id);
  const [message, setMessage] = useState(() => defaultMessage(req));
  const [copied, setCopied] = useState<"link" | "post" | null>(null);
  const canNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const copy = async (what: "link" | "post") => {
    const text = what === "link" ? url : `${message} ${url}`;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // Clipboard API blocked (e.g. insecure context): fall back to a hidden textarea.
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(what);
    setTimeout(() => setCopied(null), 2000);
  };

  const nativeShare = async () => {
    try {
      await navigator.share({ title: `Test ${req.app_name} on BetaPod`, text: message, url });
    } catch {
      /* user cancelled */
    }
  };

  // Portal to <body> so parent layout (e.g. space-y margins) can't offset the overlay.
  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="share-title"
    >
      <div className="card w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-1">
          <h2 id="share-title" className="text-lg font-semibold">
            {justCreated ? "🎉 Your listing is live! Now share it" : `Share ${req.app_name}`}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <p className="text-sm text-slate-600 mb-4">
          Listings shared on social media fill up much faster. Post this link where testers hang
          out, like X, Reddit, LinkedIn or your WhatsApp groups.
        </p>

        <label className="label" htmlFor="share-link">
          Your listing link
        </label>
        <div className="flex gap-2 mb-4">
          <input
            id="share-link"
            className="input flex-1 font-mono text-sm"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
          />
          <button type="button" onClick={() => copy("link")} className="btn-primary whitespace-nowrap">
            {copied === "link" ? "Copied ✓" : "Copy link"}
          </button>
        </div>

        <label className="label" htmlFor="share-message">
          Message
        </label>
        <textarea
          id="share-message"
          className="input min-h-[88px] text-sm mb-1"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          type="button"
          onClick={() => copy("post")}
          className="text-xs text-brand-600 hover:underline mb-4"
        >
          {copied === "post" ? "Copied message + link ✓" : "Copy message + link"}
        </button>

        <div className="grid grid-cols-3 gap-2">
          {NETWORKS.map((n) => (
            <a
              key={n.name}
              href={n.href(message, url)}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-center text-sm font-medium text-white rounded-md px-3 py-2 ${n.className}`}
            >
              {n.name}
            </a>
          ))}
        </div>
        {canNativeShare && (
          <button type="button" onClick={nativeShare} className="btn-secondary w-full mt-2">
            More options…
          </button>
        )}

        <div className="flex items-center justify-between mt-5">
          <p className="text-xs text-slate-500">
            If BetaPod helped, follow{" "}
            <a
              href="https://x.com/AmarKarippath"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 hover:underline"
            >
              @AmarKarippath
            </a>{" "}
            on X.
          </p>
          <button type="button" onClick={onClose} className="btn-secondary">
            Done
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
