import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { TransformStream } from "stream/web";

// viem 依赖 TextEncoder/Decoder，Jest 环境需手动注入
const g = globalThis as typeof globalThis & {
  TextEncoder: typeof TextEncoder;
  TextDecoder: typeof global.TextDecoder;
  fetch: typeof fetch;
  Headers: typeof Headers;
  Request: typeof Request;
  Response: typeof Response;
  TransformStream: typeof TransformStream;
};

class StubHeaders {
  private store = new Map<string, string>();

  constructor(init?: HeadersInit) {
    if (!init) return;
    if (Array.isArray(init)) {
      init.forEach(([key, value]) => this.set(key, value));
      return;
    }
    if (init instanceof StubHeaders) {
      init.store.forEach((value, key) => this.set(key, value));
      return;
    }
    Object.entries(init).forEach(([key, value]) => {
      this.set(key, String(value));
    });
  }

  set(key: string, value: string) {
    this.store.set(key.toLowerCase(), value);
  }

  get(key: string) {
    return this.store.get(key.toLowerCase()) ?? null;
  }

  has(key: string) {
    return this.store.has(key.toLowerCase());
  }
}

class StubRequest {
  url: string;
  method: string;
  headers: StubHeaders;
  private body: BodyInit | null;

  constructor(input: RequestInfo | URL, init?: RequestInit) {
    this.url = String(input);
    this.method = init?.method ?? "GET";
    this.headers = new StubHeaders(init?.headers);
    this.body = init?.body ?? null;
  }

  async json() {
    if (typeof this.body === "string") {
      return JSON.parse(this.body);
    }
    if (this.body == null) {
      return {};
    }
    return this.body;
  }
}

class StubResponse {
  ok: boolean;
  status: number;
  headers: StubHeaders;
  private body: string | null;
  private jsonBody: unknown;

  constructor(body?: BodyInit | null, init?: ResponseInit) {
    this.status = init?.status ?? 200;
    this.ok = this.status >= 200 && this.status < 300;
    this.headers = new StubHeaders(init?.headers);
    this.body = typeof body === "string" ? body : body ? JSON.stringify(body) : null;
    this.jsonBody = body ?? null;
  }

  static json(data: unknown, init?: ResponseInit) {
    const merged: ResponseInit = {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers || {}),
      },
    };
    return new StubResponse(data as BodyInit, merged);
  }

  async json() {
    if (this.jsonBody != null && typeof this.jsonBody !== "string") {
      return this.jsonBody;
    }
    if (this.body) {
      return JSON.parse(this.body);
    }
    return {};
  }
}

g.TextEncoder = TextEncoder;
g.TextDecoder = TextDecoder as typeof global.TextDecoder;

g.fetch =
  g.fetch ??
  (async () => {
    throw new Error("Fetch is not available in this environment.");
  });
g.Headers = g.Headers ?? (StubHeaders as unknown as typeof Headers);
g.Request = g.Request ?? (StubRequest as unknown as typeof Request);
g.Response = g.Response ?? (StubResponse as unknown as typeof Response);
g.TransformStream = g.TransformStream ?? TransformStream;
