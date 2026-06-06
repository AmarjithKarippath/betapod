import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { useToast } from "@/hooks/useToast";
import type { TestRequest } from "@/types/api";

const CATEGORIES = [
  "Productivity",
  "Games",
  "Education",
  "Finance",
  "Health & Fitness",
  "Social",
  "Tools",
  "Other",
];

export function CreateRequestPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [appName, setAppName] = useState("");
  const [playStoreUrl, setPlayStoreUrl] = useState("");
  const [category, setCategory] = useState("Productivity");
  const [description, setDescription] = useState("");
  const [testerCount, setTesterCount] = useState(12);
  const [durationDays, setDurationDays] = useState(14);
  const [location, setLocation] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const req = await api.post<TestRequest>("/requests", {
        app_name: appName,
        play_store_url: playStoreUrl,
        category,
        description,
        tester_count: testerCount,
        duration_days: durationDays,
        location,
      });

      if (screenshot) {
        const form = new FormData();
        form.append("file", screenshot);
        try {
          await api.postForm(`/requests/${req.id}/screenshot`, form);
        } catch (err) {
          toast.push("Request created, but screenshot failed to upload.", "error");
        }
      }

      toast.push(
        "Request created! If BetaPod helped, follow @AmarKarippath on X — that's the only ask.",
        "success",
      );
      navigate(`/requests/${req.id}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not create request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto card p-6">
      <h1 className="text-xl font-semibold mb-4">Create a testing request</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="label">App name</label>
          <input
            className="input"
            required
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Play Store / closed testing URL</label>
          <input
            type="url"
            className="input"
            required
            placeholder="https://play.google.com/store/apps/details?id=..."
            value={playStoreUrl}
            onChange={(e) => setPlayStoreUrl(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select
              className="input"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Tester location</label>
            <input
              className="input"
              required
              placeholder="e.g. India, Global, US"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Testers needed</label>
            <input
              type="number"
              min={1}
              max={500}
              className="input"
              required
              value={testerCount}
              onChange={(e) => setTesterCount(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="label">Duration (days)</label>
            <input
              type="number"
              min={1}
              max={90}
              className="input"
              required
              value={durationDays}
              onChange={(e) => setDurationDays(Number(e.target.value))}
            />
            <p className="text-xs text-slate-500 mt-1">Google requires 14 days minimum.</p>
          </div>
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input min-h-[120px]"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does your app do? What feedback are you looking for?"
          />
        </div>
        <div>
          <label className="label">Screenshot (optional)</label>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
            className="text-sm"
          />
          <p className="text-xs text-slate-500 mt-1">PNG, JPEG, or WEBP. Max 5MB.</p>
        </div>
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary">
            {submitting ? "Creating…" : "Create request"}
          </button>
        </div>
      </form>
    </div>
  );
}
