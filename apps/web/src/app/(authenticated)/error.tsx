"use client";

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="animate-[view-slam_0.3s_cubic-bezier(0.2,0,0,1)]">
      <div className="nb-card p-12 text-center max-w-lg mx-auto mt-12">
        <div className="text-[2rem] mb-4">&#9888;</div>
        <h2 className="font-bold text-[1.2rem] uppercase tracking-wider mb-4">
          SOMETHING WENT WRONG
        </h2>
        <p className="font-mono text-[0.85rem] text-gray-mid mb-6 leading-relaxed">
          {error.message || "An unexpected error occurred."}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="nb-btn nb-btn--primary">
            TRY AGAIN
          </button>
          <button onClick={() => window.location.href = "/dashboard"} className="nb-btn">
            GO TO DASHBOARD
          </button>
        </div>
      </div>
    </div>
  );
}
