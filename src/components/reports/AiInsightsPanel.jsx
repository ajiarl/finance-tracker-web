import { useAiInsight } from '../../hooks/useAiInsight';
import { cn } from '../../lib/utils';
import { Sparkles, RefreshCw } from 'lucide-react';

/* ─────────────────────────────────────────────────────────
   Loading skeleton — Neobrutalist pulsing placeholder
   ───────────────────────────────────────────────────────── */
function InsightSkeleton() {
  return (
    <div className="border-4 border-black bg-amber-100 p-6 shadow-[8px_8px_0px_0px_#000] animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar placeholder */}
        <div className="w-14 h-14 border-3 border-black bg-gray-300 flex-shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-300 border-2 border-black w-3/4" />
          <div className="h-4 bg-gray-300 border-2 border-black w-full" />
          <div className="h-4 bg-gray-300 border-2 border-black w-1/2" />
        </div>
      </div>
      <p className="mt-4 text-xs font-black uppercase tracking-widest text-gray-500 text-center">
        ⏳ Pak Hemat sedang menganalisis dompetmu...
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Error / empty state
   ───────────────────────────────────────────────────────── */
function InsightError({ onRetry }) {
  return (
    <div className="border-4 border-black bg-red-50 p-6 shadow-[8px_8px_0px_0px_#000]">
      <p className="font-black text-sm text-red-700 uppercase">
        ⚠️ Pak Hemat gagal merespons.
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 font-black text-xs uppercase tracking-wider border-2 border-black bg-white shadow-[4px_4px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#000] transition-all flex items-center gap-2"
        >
          <RefreshCw size={14} /> Coba Lagi
        </button>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main panel
   ───────────────────────────────────────────────────────── */
export default function AiInsightsPanel({ startDate, endDate }) {
  const { data, isLoading, isError, refetch, isFetching } = useAiInsight({
    start_date: startDate,
    end_date: endDate,
  });

  if (isLoading) return <InsightSkeleton />;
  if (isError)   return <InsightError onRetry={refetch} />;

  const insightText = data?.insight;

  if (!insightText) return null;

  return (
    <div className="border-4 border-black bg-amber-300 p-6 shadow-[8px_8px_0px_0px_#000] relative overflow-hidden">
      {/* Decorative corner accent */}
      <div className="absolute -top-2 -right-2 w-16 h-16 bg-black rotate-45 translate-x-8 -translate-y-8" />

      <div className="flex items-start gap-5">
        {/* ── PH Avatar ─────────────────────────────────────── */}
        <div className="w-14 h-14 bg-black border-4 border-black flex items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]">
          <span className="text-amber-300 font-black text-xl leading-none select-none">
            PH
          </span>
        </div>

        {/* ── Content ────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={16} className="text-black" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/70">
                Pak Hemat · AI Insight
              </span>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className={cn(
                "p-1.5 border-2 border-black bg-amber-200 transition-all",
                isFetching
                  ? "opacity-50 cursor-not-allowed"
                  : "shadow-[3px_3px_0px_0px_#000] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[2px_2px_0px_0px_#000]"
              )}
              title="Refresh insight"
            >
              <RefreshCw size={14} className={cn("text-black", isFetching && "animate-spin")} />
            </button>
          </div>

          {/* Quote */}
          <div className="relative">
            <span className="absolute -left-1 -top-3 text-5xl font-black text-black/15 select-none leading-none">
              &ldquo;
            </span>
            <p className="text-sm font-bold text-black leading-relaxed pl-5 pr-2">
              {insightText}
            </p>
            <span className="text-3xl font-black text-black/15 select-none leading-none ml-auto block text-right -mt-1">
              &rdquo;
            </span>
          </div>
        </div>
      </div>

      {/* Footer badge */}
      <div className="mt-4 flex justify-end">
        <span className="text-[9px] font-black uppercase tracking-widest text-black/40">
          Powered by Gemini 2.0 Flash
        </span>
      </div>
    </div>
  );
}
