import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { FeedbackModal } from "@/components/FeedbackModal";
import { FollowBanner } from "@/components/FollowBanner";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link to="/" className="font-bold text-lg text-brand-600">
            BetaPod
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                isActive ? "text-brand-600 font-medium" : "text-slate-600 hover:text-slate-900"
              }
            >
              Browse
            </NavLink>
            {user && (
              <NavLink
                to="/my-requests"
                className={({ isActive }) =>
                  isActive ? "text-brand-600 font-medium" : "text-slate-600 hover:text-slate-900"
                }
              >
                My requests
              </NavLink>
            )}
            {user?.is_admin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  isActive ? "text-brand-600 font-medium" : "text-slate-600 hover:text-slate-900"
                }
              >
                Admin
              </NavLink>
            )}
            {user ? (
              <>
                <button
                  onClick={() => setFeedbackOpen(true)}
                  className="text-slate-600 hover:text-slate-900"
                >
                  Feedback
                </button>
                <Link to="/requests/new" className="btn-primary">
                  + Create
                </Link>
                <button onClick={handleLogout} className="text-slate-600 hover:text-slate-900">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-slate-600 hover:text-slate-900">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <FollowBanner />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
      {feedbackOpen && <FeedbackModal onClose={() => setFeedbackOpen(false)} />}
    </div>
  );
}
