"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-navy">
      <div className="glass p-8 max-w-md text-center">
        <h2 className="font-serif text-xl font-bold text-white mb-3">
          Something went wrong
        </h2>
        <p className="text-sm text-white-50 mb-6">
          A component failed to render. This may be a temporary issue with
          external data sources.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 text-sm bg-white-10 hover:bg-white-20 text-white rounded-md transition-colors border border-white-20"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
