"use client";

import StatusToast from "./StatusToast";

export default function ShowcaseSummary() {
  return (
    <section className="glass-card rounded-2xl border border-[var(--app-border)] p-8 text-[var(--app-fg)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">GasMorph 演示概览</h2>
          <p className="mt-2 text-[var(--app-muted)]">
            一次性体验补贴流程、消费券 NFT 与交易可视化。
          </p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--app-muted)]">
            <span className="rounded-full border border-[var(--app-border)] bg-white/70 px-3 py-1">消费券 NFT 铸造</span>
            <span className="rounded-full border border-[var(--app-border)] bg-white/70 px-3 py-1">转赠与销毁</span>
            <span className="rounded-full border border-[var(--app-border)] bg-white/70 px-3 py-1">补贴路由</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="#action"
            className="rounded-full border border-[var(--app-border)] bg-white/70 px-4 py-2 text-sm font-semibold text-[var(--app-fg)] transition hover:border-[rgba(35,30,28,0.3)]"
            aria-label="跳转到演示动作"
          >
            开始演示
          </a>
          <a
            href="mailto:team@gasmorph.example"
            className="rounded-full bg-[var(--app-accent)] px-4 py-2 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:shadow-md"
            aria-label="联系团队"
          >
            联系团队
          </a>
        </div>
      </div>
      <StatusToast />
    </section>
  );
}
