export interface ResponseDetails {
  status: number;
  statusText: string;
  ok: boolean;
  headers: Record<string, string>;
}

export interface SubscriptionCardResponse {
  data: any;
  responseDetails: ResponseDetails;
}

export interface SubscriptionCardProps {
  membershipType: string;
  memberSince: string;
}

export interface DebugInfo {
  authenticated: boolean;
  hasSession: boolean;
  hasProfile: boolean;
  userEmail: string | undefined;
}