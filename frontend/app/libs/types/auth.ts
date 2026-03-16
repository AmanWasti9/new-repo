export interface User {
  userId: string;
  email: string;
  role: string;
  name: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
  refresh_token_expires_at?: string;
  data?: {
    access_token?: string;
    refresh_token?: string;
    refresh_token_expires_at?: string;
  };
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (
    token: string,
    refreshToken: string,
    refreshTokenExpiresAt?: string,
  ) => void;
  logout: () => void;
  loading: boolean;
}
