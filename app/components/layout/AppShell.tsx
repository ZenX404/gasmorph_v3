import Link from "next/link";
import type { ReactNode } from "react";

export type NavItem = {
  label: string;
  href: string;
  isActive?: boolean;
};

type AppShellProps = {
  title: string;
  subtitle?: string;
  navItems: NavItem[];
  actions?: ReactNode;
  badge?: string;
  children: ReactNode;
};

export default function AppShell({ title, subtitle, navItems, actions, badge, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-fg)]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_12%_12%,_rgba(74,163,154,0.18),_transparent_40%),radial-gradient(circle_at_85%_10%,_rgba(255,179,71,0.2),_transparent_35%),radial-gradient(circle_at_50%_90%,_rgba(255,214,170,0.28),_transparent_40%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(24,20,18,0.03)_0%,rgba(255,255,255,0)_40%,rgba(24,20,18,0.04)_100%)]" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 pb-20 pt-10">
        <header className="fade-up relative overflow-hidden rounded-3xl border border-[var(--app-border)] bg-[var(--app-panel)] p-8 shadow-[0_22px_60px_rgba(30,24,20,0.12)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgba(255,143,47,0),rgba(255,143,47,0.45),rgba(255,143,47,0))]" />
          <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(255,179,71,0.25),transparent_65%)]" />
          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="space-y-3">
              {badge ? (
                <span className="inline-flex items-center rounded-full border border-[var(--app-border)] bg-white/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.3em] text-[var(--app-muted)]">
                  {badge}
                </span>
              ) : null}
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--app-fg)] md:text-4xl">{title}</h1>
                {subtitle ? <p className="mt-2 max-w-2xl text-sm text-[var(--app-muted)] md:text-base">{subtitle}</p> : null}
              </div>
            </div>
            <div className="flex items-center gap-3">{actions}</div>
          </div>
          <nav className="mt-8 flex flex-wrap items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  item.isActive
                    ? "bg-[var(--app-accent)] text-slate-900 shadow-[0_12px_28px_rgba(255,143,47,0.28)]"
                    : "border border-[var(--app-border)] text-[var(--app-muted)] hover:border-[rgba(35,30,28,0.3)] hover:text-[var(--app-fg)]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="flex flex-col gap-8">{children}</main>
      </div>
    </div>
  );
}
