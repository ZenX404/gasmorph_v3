import type { GasMorphClient } from "./client";
import type { ActivityClaimPayload, ActivityClaimResponse, ActivityListResponse, CheckInResponse } from "./types";

export async function listActivities(client: GasMorphClient, wallet?: string): Promise<ActivityListResponse> {
  return client.listActivities(wallet);
}

export async function claimActivity(client: GasMorphClient, payload: ActivityClaimPayload): Promise<ActivityClaimResponse> {
  return client.claimActivity(payload);
}

export async function claimCheckIn(client: GasMorphClient, wallet: string): Promise<CheckInResponse> {
  return client.claimCheckIn(wallet);
}
