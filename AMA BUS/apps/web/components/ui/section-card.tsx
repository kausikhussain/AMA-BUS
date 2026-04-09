import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="glass-panel rounded-[1.75rem] p-5 shadow-panel">
      <div className="mb-4">
        <h2 className="font-display text-2xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{description}</p>
      </div>
      {children}
    </section>
  );
}
