import { NextResponse } from "next/server";
import { projectConfigSchema } from "@/app/lib/validation/validators";
import {
  getProjectConfig,
  updateProjectConfig,
  type ProjectConfig,
} from "@/app/lib/console/projectConfigStore";
import { createTraceContext, logError, logRequest } from "@/app/lib/telemetry/logger";
import { containsSensitiveKeys, redactSensitive } from "@/app/lib/telemetry/redact";

function normalizePrivateKey(value: string | null | undefined) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed)) return trimmed;
  if (/^[a-fA-F0-9]{64}$/.test(trimmed)) return `0x${trimmed}`;
  return null;
}

export async function GET() {
  const trace = createTraceContext();
  try {
    const config = getProjectConfig();
    logRequest("console.project-config.get", { checkInEnabled: config.checkInEnabled }, trace.traceId);
    return NextResponse.json({
      subsidyAccount: config.subsidyAccount,
      checkInEnabled: config.checkInEnabled,
      updatedAt: new Date(config.updatedAt).toISOString(),
    });
  } catch (error) {
    logError("console.project-config.get.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Failed to load project config" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const trace = createTraceContext();
  try {
    const raw = (await req.json()) as Record<string, unknown>;
    const safePayload = { ...raw };
    if (Object.prototype.hasOwnProperty.call(safePayload, "sponsorPrivateKey")) {
      delete safePayload.sponsorPrivateKey;
    }
    if (containsSensitiveKeys(safePayload)) {
      return NextResponse.json({ error: "Invalid project config" }, { status: 400 });
    }

    const parsed = projectConfigSchema.parse(raw);
    const patch: Partial<ProjectConfig> = {};

    if (Object.prototype.hasOwnProperty.call(raw, "subsidyAccount")) {
      patch.subsidyAccount = parsed.subsidyAccount ?? null;
    }
    if (Object.prototype.hasOwnProperty.call(raw, "checkInEnabled")) {
      patch.checkInEnabled = parsed.checkInEnabled ?? getProjectConfig().checkInEnabled;
    }
    if (Object.prototype.hasOwnProperty.call(raw, "sponsorPrivateKey")) {
      const normalized = normalizePrivateKey(parsed.sponsorPrivateKey ?? null);
      if (parsed.sponsorPrivateKey && !normalized) {
        return NextResponse.json({ error: "Invalid private key" }, { status: 400 });
      }
      patch.sponsorPrivateKey = normalized;
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: "Invalid project config" }, { status: 400 });
    }

    const updated = updateProjectConfig(patch);
    const safeLogPayload = { ...patch };
    if (Object.prototype.hasOwnProperty.call(safeLogPayload, "sponsorPrivateKey")) {
      delete safeLogPayload.sponsorPrivateKey;
    }
    logRequest("console.project-config.update", redactSensitive(safeLogPayload), trace.traceId);

    return NextResponse.json({ result: "success", updatedAt: new Date(updated.updatedAt).toISOString() });
  } catch (error) {
    logError("console.project-config.update.error", { message: (error as Error).message }, trace.traceId);
    return NextResponse.json({ error: "Invalid project config" }, { status: 400 });
  }
}
