import { render, screen } from "@testing-library/react";
import ShowcaseSummary from "../../app/components/ShowcaseSummary";

jest.mock("../../app/components/DisconnectButton", () => () => (
  <button type="button">断开连接</button>
));

jest.mock("../../app/components/StatusToast", () => () => null);

describe("ShowcaseSummary", () => {
  it("renders summary bullets and CTA", () => {
    render(<ShowcaseSummary />);
    expect(screen.getByText(/GasMorph 演示概览/i)).toBeInTheDocument();
    expect(screen.getByText(/消费券 NFT 铸造/i)).toBeInTheDocument();
    expect(screen.getByText(/转赠与销毁/i)).toBeInTheDocument();
    expect(screen.getByText(/补贴路由/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /跳转到演示动作/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /联系团队/i })).toBeInTheDocument();
  });
});
