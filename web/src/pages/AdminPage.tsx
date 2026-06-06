import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import type { AdminStats } from "@/types/api";

function MiniBarChart({
  data,
  color,
}: {
  data: { date: string; count: number }[];
  color: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-0.5 h-20">
      {data.map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count}`}
          className="flex-1 rounded-sm"
          style={{
            height: `${(d.count / max) * 100}%`,
            minHeight: d.count > 0 ? "4px" : "1px",
            backgroundColor: d.count > 0 ? color : "#e2e8f0",
          }}
        />
      ))}
    </div>
  );
}

function StatCard({
  label,
  total,
  series,
  color,
}: {
  label: string;
  total: number;
  series?: { date: string; count: number }[];
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="text-2xl font-semibold text-slate-900 mt-1">{total.toLocaleString()}</div>
      {series && (
        <div className="mt-3">
          <MiniBarChart data={series} color={color} />
          <div className="text-xs text-slate-400 mt-1">Last {series.length} days</div>
        </div>
      )}
    </div>
  );
}

export function AdminPage() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-stats", days],
    queryFn: () => api.get<AdminStats>(`/admin/stats?days=${days}`),
    enabled: !!user?.is_admin,
  });

  if (!user?.is_admin) {
    return <div className="text-slate-500">Admin only.</div>;
  }
  if (isLoading) return <div className="text-slate-500">Loading…</div>;
  if (error || !data) return <div className="text-red-600">Failed to load stats.</div>;

  const download = (path: string) => {
    window.location.href = `/api${path}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-semibold">Admin dashboard</h1>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-600">Window:</label>
          <select
            className="input w-32"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value={7}>7 days</option>
            <option value={30}>30 days</option>
            <option value={90}>90 days</option>
            <option value={365}>1 year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Users"
          total={data.totals.users}
          series={data.by_day.users}
          color="#4f46e5"
        />
        <StatCard
          label="Requests"
          total={data.totals.requests}
          series={data.by_day.requests}
          color="#0d9488"
        />
        <StatCard
          label="Enrollments"
          total={data.totals.enrollments}
          series={data.by_day.enrollments}
          color="#f59e0b"
        />
        <StatCard label="Feedback" total={data.totals.feedback} color="#ef4444" />
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-900 mb-2">Bulk export</h2>
        <p className="text-sm text-slate-600 mb-4">
          Download all data as CSV. Requests export includes owner details and enrolled tester
          emails.
        </p>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => download("/admin/export/requests.csv")}
            className="btn-primary"
          >
            Download requests CSV
          </button>
          <button
            onClick={() => download("/admin/export/users.csv")}
            className="btn-secondary"
          >
            Download users CSV
          </button>
          <button
            onClick={() => download("/admin/export/feedback.csv")}
            className="btn-secondary"
          >
            Download feedback CSV
          </button>
        </div>
      </div>
    </div>
  );
}
