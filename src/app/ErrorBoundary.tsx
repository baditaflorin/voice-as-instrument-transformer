import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  error?: Error;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {};

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(error, info);
    }
  }

  render() {
    if (this.state.error) {
      return (
        <main className="min-h-screen bg-ink text-paper">
          <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6">
            <p className="text-sm uppercase tracking-[0.22em] text-mint">Audio engine fault</p>
            <h1 className="mt-3 text-4xl font-semibold">The instrument needs a reset.</h1>
            <p className="mt-4 text-lg text-paper/75">{this.state.error.message}</p>
            <button
              className="mt-8 w-fit rounded-md bg-mint px-4 py-3 font-semibold text-ink"
              onClick={() => location.reload()}
            >
              Reload
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
