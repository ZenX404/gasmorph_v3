import { computeCostSummary, OperationRecord } from "../../../app/lib/operations";

describe("CostComparison summary", () => {
  it("computes savings when both subsidized and unsubsidized exist", () => {
    const now = Date.now();
    const records: OperationRecord[] = [
      {
        opId: "op1",
        sender: "0x1",
        networkId: 11155111,
        isSubsidized: true,
        txHash: "0xabc",
        blockNumber: 1,
        gasUsed: "1000000000000000",
        gasPayer: "sponsor",
        explorerUrl: null,
        status: "confirmed",
        failureReason: null,
        createdAt: now,
      },
      {
        opId: "op2",
        sender: "0x1",
        networkId: 11155111,
        isSubsidized: false,
        txHash: "0xdef",
        blockNumber: 2,
        gasUsed: "2000000000000000",
        gasPayer: "user",
        explorerUrl: null,
        status: "confirmed",
        failureReason: null,
        createdAt: now - 1,
      },
    ];
    const summary = computeCostSummary(records);
    expect(summary.unsubsidizedWei).toBeGreaterThan(BigInt(0));
    expect(summary.subsidizedWei).toBeGreaterThan(BigInt(0));
    expect(summary.savedPercent).toBeGreaterThan(0);
  });
});
