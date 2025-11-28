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
    expect(
      screen.getByText(/GasMorph · Web3 Gas 赞助体验/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /连接钱包/i })).toBeInTheDocument();
  });

  it("shows privacy notice", () => {
    render(<Home />);
    expect(
      screen.getByText(/不会收集或存储私钥/i),
    ).toBeInTheDocument();
  });
});
