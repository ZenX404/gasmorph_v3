import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-12">{children}</div>;
}

export function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-panel)] p-6 shadow-[0_20px_45px_rgba(35,30,28,0.16)] ${className}`}
    >
      <div className="absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(45,127,121,0),rgba(45,127,121,0.4),rgba(45,127,121,0))]" />
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--app-fg)]">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[var(--app-muted)]">{subtitle}</p> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </header>
      <div className="mt-6">{children}</div>
    </section>
  );
}

export function DataPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--app-border)] bg-white/70 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-[var(--app-fg)]">{value}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-[var(--app-border)] bg-white/70 p-6 text-center">
      <h3 className="text-base font-semibold text-[var(--app-fg)]">{title}</h3>
      <p className="mt-2 text-sm text-[var(--app-muted)]">{description}</p>
    </div>
  );
}
