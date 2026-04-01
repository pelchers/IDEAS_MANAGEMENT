export default function AuthenticatedLoading() {
  return (
    <div className="animate-pulse">
      {/* Header skeleton */}
      <div className="mb-8">
        <div className="h-8 w-48 bg-signal-black/10 border-2 border-signal-black/10" />
        <div className="h-4 w-72 bg-signal-black/5 mt-2" />
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-4 border-signal-black/10 p-6 h-48">
            <div className="h-5 w-32 bg-signal-black/10 mb-4" />
            <div className="h-3 w-full bg-signal-black/5 mb-2" />
            <div className="h-3 w-3/4 bg-signal-black/5 mb-2" />
            <div className="h-3 w-1/2 bg-signal-black/5" />
          </div>
        ))}
      </div>
    </div>
  );
}
