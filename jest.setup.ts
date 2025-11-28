import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// viem 需要 TextEncoder/Decoder
// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder as typeof global.TextDecoder;
