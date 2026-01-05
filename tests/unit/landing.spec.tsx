import { render, screen } from "@testing-library/react";
import Home from "../../app/page";

jest.mock("@rainbow-me/rainbowkit", () => ({
  ConnectButton: {
    Custom: ({ children }: any) =>
      children({
        account: null,
        chain: null,
        openChainModal: jest.fn(),
        openConnectModal: jest.fn(),
        mounted: true,
        authenticationStatus: "unauthenticated",
      }),
  },
}));

jest.mock("wagmi", () => ({
  useAccount: () => ({ isConnected: false }),
  useEnsName: () => ({ data: null }),
  useChainId: () => undefined,
  useWalletClient: () => ({ data: null }),
  usePublicClient: () => null,
  useDisconnect: () => ({ disconnect: jest.fn() }),
  useConnect: () => ({ error: null, isLoading: false }),
}));

jest.mock("../../app/lib/useNetworkGuard", () => ({
  useNetworkGuard: () => ({
    isSupported: true,
    chainId: undefined,
    recommended: undefined,
  }),
}));

jest.mock("../../app/lib/useWalletEvents", () => ({
  useWalletEvents: () => ({
    guard: { isSupported: true, chainId: undefined, recommended: undefined },
    ensureSupportedNetwork: jest.fn(),
    safeDisconnect: jest.fn(),
  }),
}));

describe("Home landing", () => {
  it("renders hero and connect CTA", () => {
    render(<Home />);
    expect(screen.getByText(/GasMorph 补贴演示/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /连接钱包/i })).toBeInTheDocument();
  });

  it("shows privacy notice", () => {
    render(<Home />);
    expect(screen.getByText(/不会存储私钥或敏感数据/i)).toBeInTheDocument();
  });
});
