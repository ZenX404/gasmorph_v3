import { EmptyState } from "../layout/pageShell";

type TransactionItem = {
  txHash: string;
  sender: string;
  status: "confirmed" | "failed" | "pending";
  gasPayer: "sponsor" | "user" | "voucher";
  voucherId?: string | null;
  createdAt: number;
};

const statusStyles: Record<TransactionItem["status"], string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
  pending: "bg-amber-100 text-amber-800",
};

const statusLabels: Record<TransactionItem["status"], string> = {
  confirmed: "已确认",
  failed: "失败",
  pending: "进行中",
};

export default function TransactionTable({ items }: { items: TransactionItem[] }) {
  if (!items.length) {
    return <EmptyState title="暂无交易" description="运行演示动作后将展示最新活动。" />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm text-[var(--app-fg)]">
        <thead className="text-xs uppercase tracking-[0.2em] text-[var(--app-muted)]">
          <tr>
            <th className="py-3 pr-4">哈希</th>
            <th className="py-3 pr-4">发送方</th>
            <th className="py-3 pr-4">费用方</th>
            <th className="py-3 pr-4">状态</th>
            <th className="py-3">时间</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--app-border)]">
          {items.map((item) => (
            <tr key={item.txHash} className="text-[var(--app-fg)]">
              <td className="py-3 pr-4 font-mono text-xs text-[var(--app-muted)]">
                {item.txHash.slice(0, 10)}...
              </td>
              <td className="py-3 pr-4 font-mono text-xs text-[var(--app-muted)]">
                {item.sender.slice(0, 6)}...{item.sender.slice(-4)}
              </td>
              <td className="py-3 pr-4">
                <span className="rounded-full border border-[var(--app-border)] px-3 py-1 text-xs">
                  {item.gasPayer === "voucher" ? "消费券" : item.gasPayer === "sponsor" ? "补贴账户" : "用户"}
                </span>
              </td>
              <td className="py-3 pr-4">
                <span className={`rounded-full px-3 py-1 text-xs ${statusStyles[item.status]}`}>
                  {statusLabels[item.status]}
                </span>
              </td>
              <td className="py-3 text-xs text-[var(--app-muted)]">
                {new Date(item.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
