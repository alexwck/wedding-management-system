export interface OAuthToken {
  id: number;
  userId: string;
  provider: "google";
  accessToken: string;
  refreshToken: string;
  scope: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}
