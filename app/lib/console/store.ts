export type ConsoleTransaction = {
  txHash: string;
  sender: string;
  status: "confirmed" | "failed" | "pending";
  gasPayer: "sponsor" | "user" | "voucher";
  gasUsed?: string | null;
  networkId?: number | null;
  explorerUrl?: string | null;
  blockNumber?: number | null;
  voucherId?: string | null;
  createdAt: number;
};

export type IssuedVoucherRecord = {
  target: string;
  type: string;
  issuedAt: number;
  voucherId: string;
};

type ConsoleState = {
  subsidyEnabled: boolean;
  transactions: ConsoleTransaction[];
  issuedVouchers: IssuedVoucherRecord[];
  updatedAt: number;
  sponsorBaseline?: bigint;
};

const globalKey = "__gasmorph_console_state__";

function getGlobalState(): ConsoleState {
  const globalAny = globalThis as typeof globalThis & { [key: string]: ConsoleState | undefined };
  if (!globalAny[globalKey]) {
    globalAny[globalKey] = {
      subsidyEnabled: true,
      transactions: [],
      issuedVouchers: [],
      updatedAt: Date.now(),
    };
  }
  return globalAny[globalKey] as ConsoleState;
}

// 说明: 仅用于演示环境的内存状态存储。
export function getConsoleState(): ConsoleState {
  return getGlobalState();
}

export function setSubsidyEnabled(enabled: boolean) {
  const state = getGlobalState();
  state.subsidyEnabled = enabled;
  state.updatedAt = Date.now();
}

export function recordTransaction(tx: ConsoleTransaction) {
  const state = getGlobalState();
  state.transactions.unshift(tx);
  state.transactions = state.transactions.slice(0, 50);
}

export function recordIssuedVoucher(record: IssuedVoucherRecord) {
  const state = getGlobalState();
  state.issuedVouchers.unshift(record);
  state.issuedVouchers = state.issuedVouchers.slice(0, 50);
}

export function setSponsorBaseline(balance: bigint) {
  const state = getGlobalState();
  state.sponsorBaseline = balance;
}
