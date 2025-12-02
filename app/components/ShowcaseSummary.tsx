"use client";

import StatusToast from "./StatusToast";

export default function ShowcaseSummary() {
  return (
    <section className="glass-card rounded-2xl border border-white/15 p-8 text-sky-50">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">项目摘要</h2>
          <p className="mt-2 text-sky-100/85">
            · Gas 补贴体验 · 链上交互预览
            <br />
            · Next.js + RainbowKit + wagmi + viem 全链路
            <br />
            · 可扩展的 Foundry 合约与本地链集成
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href="#action"
            className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:border-white/60"
            aria-label="查看演示操作"
          >
            查看演示操作
          </a>
          <a
            href="mailto:team@gasmorph.example"
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition hover:-translate-y-0.5 hover:shadow-md"
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
