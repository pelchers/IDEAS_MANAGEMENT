"use client";

interface UsageMeterProps {
  used: number;
  limit: number;
  packBalance?: number;
  periodEnd: string;
  plan: string;
  compact?: boolean;
}

export function UsageMeter({ used, limit, packBalance = 0, periodEnd, plan, compact = false }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const remaining = Math.max(0, limit - used);
  const color = percentage >= 90 ? "watermelon" : percentage >= 70 ? "lemon" : "malachite";
  const resetDate = new Date(periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  if (compact) {
    return (
      <div className="font-mono text-[0.7rem]">
        <span className={`text-${color}`}>{used}/{limit}</span>
        <span className="text-gray-mid"> msgs</span>
        {packBalance > 0 && <span className="text-cornflower"> +{packBalance.toLocaleString()} pack</span>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-[0.8rem] font-bold uppercase">
          {plan} — {used.toLocaleString()} / {limit.toLocaleString()} messages
        </span>
        <span className="font-mono text-[0.65rem] text-gray-mid">{percentage}%</span>
      </div>

      <div className="w-full h-5 border-2 border-signal-black bg-white relative overflow-hidden">
        <div
          className={`h-full transition-all duration-500 bg-${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between font-mono text-[0.65rem] text-gray-mid">
        <span>
          {remaining > 0 ? `${remaining.toLocaleString()} remaining` : "Limit reached"}
          {packBalance > 0 && ` + ${packBalance.toLocaleString()} pack tokens`}
        </span>
        <span>Resets {resetDate}</span>
      </div>

      {percentage >= 90 && remaining > 0 && (
        <div className="p-2 border-2 border-lemon bg-lemon/10 font-mono text-[0.7rem]">
          Running low on AI messages. Consider upgrading or purchasing a token pack.
        </div>
      )}

      {remaining === 0 && packBalance === 0 && (
        <div className="p-2 border-2 border-watermelon bg-watermelon/10 font-mono text-[0.7rem] text-watermelon">
          Monthly limit reached. Using Local AI fallback, or upgrade for more.
        </div>
      )}
    </div>
  );
}
