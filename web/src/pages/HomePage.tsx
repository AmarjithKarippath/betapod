import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { RequestTile } from "@/components/RequestTile";
import type { TestRequest } from "@/types/api";

export function HomePage() {
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [hasOpenSlots, setHasOpenSlots] = useState(false);
  const [sort, setSort] = useState<"newest" | "fewest-slots">("newest");

  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (location) params.set("location", location);
  if (hasOpenSlots) params.set("has_open_slots", "true");

  const { data: raw, isLoading, error } = useQuery({
    queryKey: ["requests", category, location, hasOpenSlots],
    queryFn: () => api.get<TestRequest[]>(`/requests?${params.toString()}`),
  });

  const data = raw && [...raw].sort((a, b) => {
    if (sort === "fewest-slots") {
      const remA = a.tester_count - a.enrolled_count;
      const remB = b.tester_count - b.enrolled_count;
      return remA - remB;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-end">
        <div className="flex-1">
          <label className="label">Category</label>
          <input
            className="input"
            placeholder="e.g. Productivity"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="label">Location</label>
          <input
            className="input"
            placeholder="e.g. India"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-700 sm:pb-2">
          <input
            type="checkbox"
            checked={hasOpenSlots}
            onChange={(e) => setHasOpenSlots(e.target.checked)}
          />
          Open slots only
        </label>
        <div className="sm:w-44">
          <label className="label">Sort by</label>
          <select
            className="input"
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "fewest-slots")}
          >
            <option value="newest">Newest</option>
            <option value="fewest-slots">Fewest slots remaining</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="text-slate-500">Loading…</div>}
      {error && <div className="text-red-600">Failed to load requests.</div>}
      {data && data.length === 0 && (
        <div className="text-slate-500 text-center py-12">
          No requests yet. Be the first to create one!
        </div>
      )}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((r) => (
            <RequestTile key={r.id} req={r} />
          ))}
        </div>
      )}
    </div>
  );
}
