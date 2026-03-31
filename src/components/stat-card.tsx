import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: string;
  hint: string;
  accent?: "sun" | "field" | "ink";
};

const accentClassNames: Record<NonNullable<StatCardProps["accent"]>, string> = {
  sun: "border-amber-300/70 bg-amber-50 text-amber-950",
  field: "border-emerald-300/70 bg-emerald-50 text-emerald-950",
  ink: "border-slate-300/70 bg-slate-50 text-slate-950",
};

export function StatCard({
  label,
  value,
  hint,
  accent = "ink",
}: StatCardProps) {
  return (
    <article
      className={cn(
        "rounded-[28px] border p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.45)]",
        accentClassNames[accent],
      )}
    >
      <p className="text-sm font-medium uppercase tracking-[0.24em] opacity-70">{label}</p>
      <p className="mt-4 text-4xl font-semibold tracking-tight">{value}</p>
      <p className="mt-3 text-sm leading-6 opacity-75">{hint}</p>
    </article>
  );
}
