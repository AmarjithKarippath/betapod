import { Link } from "react-router-dom";
import type { TestRequest } from "@/types/api";

export function RequestTile({ req }: { req: TestRequest }) {
  const remaining = req.tester_count - req.enrolled_count;
  const full = remaining <= 0;

  return (
    <Link
      to={`/requests/${req.id}`}
      className="card overflow-hidden hover:shadow-md transition-shadow flex flex-col"
    >
      <div className="aspect-video bg-slate-100 flex items-center justify-center overflow-hidden">
        {req.screenshot_path ? (
          <img
            src={req.screenshot_path}
            alt={req.app_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-slate-400 text-sm">No screenshot</span>
        )}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-slate-900 line-clamp-1">{req.app_name}</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 whitespace-nowrap">
            {req.category}
          </span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-2">{req.description}</p>
        <div className="mt-auto flex items-center justify-between text-xs text-slate-500 pt-2">
          <span>📍 {req.location}</span>
          <span>⏱ {req.duration_days}d</span>
          <span className={full ? "text-red-600 font-medium" : "text-green-700 font-medium"}>
            {req.enrolled_count}/{req.tester_count} {full ? "full" : "slots"}
          </span>
        </div>
      </div>
    </Link>
  );
}
