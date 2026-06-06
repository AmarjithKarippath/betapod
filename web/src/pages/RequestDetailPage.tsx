import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import type { Enrollment, TestRequest } from "@/types/api";

export function RequestDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const qc = useQueryClient();

  const { data: req, isLoading } = useQuery({
    queryKey: ["request", id],
    queryFn: () => api.get<TestRequest>(`/requests/${id}`),
    enabled: !!id,
  });

  const { data: enrollments } = useQuery({
    queryKey: ["request", id, "enrollments"],
    queryFn: () => api.get<Enrollment[]>(`/requests/${id}/enrollments`),
    enabled: !!id && !!req?.is_owner,
  });

  const enroll = useMutation({
    mutationFn: () => api.post(`/requests/${id}/enroll`),
    onSuccess: () => {
      toast.push("You're enrolled!", "success");
      qc.invalidateQueries({ queryKey: ["request", id] });
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e) =>
      toast.push(e instanceof ApiError ? e.message : "Could not enroll", "error"),
  });

  const unenroll = useMutation({
    mutationFn: () => api.del(`/requests/${id}/enroll`),
    onSuccess: () => {
      toast.push("Un-enrolled", "info");
      qc.invalidateQueries({ queryKey: ["request", id] });
      qc.invalidateQueries({ queryKey: ["requests"] });
    },
    onError: (e) =>
      toast.push(e instanceof ApiError ? e.message : "Could not un-enroll", "error"),
  });

  if (isLoading) return <div className="text-slate-500">Loading…</div>;
  if (!req) return <div className="text-slate-500">Request not found.</div>;

  const remaining = req.tester_count - req.enrolled_count;
  const full = remaining <= 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link to="/" className="text-sm text-brand-600 hover:underline">
        ← Back
      </Link>

      <div className="card overflow-hidden">
        {req.screenshot_path ? (
          <img
            src={req.screenshot_path}
            alt={req.app_name}
            className="w-full max-h-80 object-cover bg-slate-100"
          />
        ) : (
          <div className="aspect-video bg-slate-100 flex items-center justify-center text-slate-400">
            No screenshot
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{req.app_name}</h1>
              <p className="text-sm text-slate-500 mt-1">
                {req.category} · 📍 {req.location} · ⏱ {req.duration_days} days
              </p>
            </div>
            <span
              className={`text-sm font-medium ${full ? "text-red-600" : "text-green-700"}`}
            >
              {req.enrolled_count}/{req.tester_count} {full ? "full" : "enrolled"}
            </span>
          </div>

          <p className="text-slate-700 whitespace-pre-wrap">{req.description}</p>

          <a
            href={req.play_store_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-brand-600 hover:underline break-all"
          >
            {req.play_store_url}
          </a>

          <div className="pt-4 border-t border-slate-200">
            {!user ? (
              <Link to="/login" className="btn-primary">
                Log in to enroll
              </Link>
            ) : req.is_owner ? (
              <div className="text-sm text-slate-500">This is your request.</div>
            ) : req.is_enrolled ? (
              <button
                onClick={() => unenroll.mutate()}
                disabled={unenroll.isPending}
                className="btn-secondary"
              >
                {unenroll.isPending ? "…" : "Un-enroll"}
              </button>
            ) : (
              <button
                onClick={() => enroll.mutate()}
                disabled={enroll.isPending || full}
                className="btn-primary"
              >
                {full ? "Full" : enroll.isPending ? "…" : "Enroll as tester"}
              </button>
            )}
          </div>
        </div>
      </div>

      {req.is_owner && enrollments && (
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-3">
            Enrolled testers ({enrollments.length})
          </h2>
          {enrollments.length === 0 ? (
            <p className="text-sm text-slate-500">No one has enrolled yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {enrollments.map((e) => (
                <li key={e.id} className="py-2 flex items-center justify-between text-sm">
                  <div>
                    <div className="font-medium text-slate-900">{e.tester_name}</div>
                    <a
                      href={`mailto:${e.tester_email}`}
                      className="text-brand-600 hover:underline"
                    >
                      {e.tester_email}
                    </a>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(e.created_at).toLocaleDateString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
