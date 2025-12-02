import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// viem 依赖 TextEncoder/Decoder，Jest 环境需手动注入
const g = globalThis as typeof globalThis & {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof global.TextDecoder;
};
g.TextEncoder = TextEncoder;
g.TextDecoder = TextDecoder as typeof global.TextDecoder;
