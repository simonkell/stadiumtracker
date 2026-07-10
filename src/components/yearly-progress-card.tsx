type YearlyProgressCardProps = {
  entries: Array<{
    year: number;
    count: number;
  }>;
};

export function YearlyProgressCard({ entries }: YearlyProgressCardProps) {
  const maxCount = Math.max(...entries.map((entry) => entry.count), 1);

  return (
    <article className="rounded-[28px] border border-amber-300/70 bg-amber-50 p-5 text-amber-950 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.45)]">
      <p className="text-sm font-medium uppercase tracking-[0.24em] opacity-70">
        Neue Stadien pro Jahr
      </p>
      <p className="mt-3 text-sm leading-6 opacity-80">
        In diesen Jahren kamen neue Erstbesuche dazu.
      </p>

      {entries.length === 0 ? (
        <p className="mt-6 text-sm leading-6 opacity-75">
          Sobald Erstbesuche hinterlegt sind, erscheint hier die Entwicklung pro Jahr.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {entries.map((entry) => (
            <div key={entry.year} className="grid grid-cols-[4rem_1fr_auto] items-center gap-3">
              <span className="text-sm font-semibold">{entry.year}</span>
              <div className="h-3 overflow-hidden rounded-full bg-amber-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#1f9d55] via-[#3aa76d] to-[#ffb703]"
                  style={{ width: `${Math.max((entry.count / maxCount) * 100, 10)}%` }}
                />
              </div>
              <span className="text-sm font-semibold">{entry.count}</span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
