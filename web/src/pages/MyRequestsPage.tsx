import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { RequestTile } from "@/components/RequestTile";
import type { TestRequest } from "@/types/api";

export function MyRequestsPage() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["requests", "all-for-mine"],
    queryFn: () => api.get<TestRequest[]>(`/requests?limit=100`),
  });

  const mine = data?.filter((r) => r.owner_id === user?.id) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My requests</h1>
        <Link to="/requests/new" className="btn-primary">
          + Create
        </Link>
      </div>
      {isLoading && <div className="text-slate-500">Loading…</div>}
      {!isLoading && mine.length === 0 && (
        <div className="text-slate-500 text-center py-12">
          You haven't created any requests yet.
        </div>
      )}
      {mine.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mine.map((r) => (
            <RequestTile key={r.id} req={r} />
          ))}
        </div>
      )}
    </div>
  );
}
