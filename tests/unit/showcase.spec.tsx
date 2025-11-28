import { render, screen } from "@testing-library/react";
import ShowcaseSummary from "../../app/components/ShowcaseSummary";

jest.mock("../../app/components/DisconnectButton", () => () => (
  <button type="button">断开连接</button>
));

jest.mock("../../app/components/StatusToast", () => () => null);

describe("ShowcaseSummary", () => {
  it("renders summary bullets and CTA", () => {
    render(<ShowcaseSummary />);
    expect(screen.getByText(/Gas 赞助体验/i)).toBeInTheDocument();
    expect(screen.getByText(/Next.js \+ RainbowKit/i)).toBeInTheDocument();
    expect(screen.getByText(/Foundry 合约/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /查看详情/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /联系/i })).toBeInTheDocument();
  });
});
