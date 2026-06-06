import { Component, type ReactNode } from "react";

interface State {
  err: Error | null;
}

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error) {
    return { err };
  }

  componentDidCatch(err: Error) {
    console.error("Caught by ErrorBoundary:", err);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="max-w-md mx-auto card p-6 mt-12 text-center">
          <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
          <p className="text-sm text-slate-600 mt-2">{this.state.err.message}</p>
          <button
            onClick={() => {
              this.setState({ err: null });
              window.location.assign("/");
            }}
            className="btn-primary mt-4"
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
