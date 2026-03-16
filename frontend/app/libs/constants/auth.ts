export const AUTH_MESSAGES = {
  NO_REFRESH_TOKEN: "No refresh token found",
  REFRESH_TOKEN_EXPIRED: "Refresh token has expired, logging out",
  TOKEN_REFRESH_FAIL: "Failed to refresh token",
  INVALID_ACCESS_TOKEN: "Invalid access token received",
  ACCESS_FORBIDDEN: "Access Forbidden (403)",
  SERVER_ERROR: "Server Error (500/502/503)",
  NETWORK_ERROR: "Network connection error",
};

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

export const ROLE_PATHS: Record<string, string> = {
  ADMIN: "/admin",
  OWNER: "/owner",
  CUSTOMER: "/customer",
};

export const DEFAULT_REDIRECT = "/";
export const LOGIN_PAGE = "/login";

export const LOCAL_STORAGE_KEYS = {
  TOKEN: "token",
  REFRESH_TOKEN: "refresh_token",
  REFRESH_TOKEN_EXPIRES_AT: "refresh_token_expires_at",
};
