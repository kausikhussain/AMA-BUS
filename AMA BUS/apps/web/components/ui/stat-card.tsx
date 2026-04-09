export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="glass-panel rounded-[1.75rem] p-5 shadow-panel">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{hint}</p>
    </div>
  );
}
