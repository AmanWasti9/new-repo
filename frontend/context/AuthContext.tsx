"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { authApi } from "@/service/auth";
import { User, AuthContextType } from "@/app/libs/types/auth";
import { AUTH_MESSAGES, LOCAL_STORAGE_KEYS, LOGIN_PAGE, ROLE_PATHS } from "@/app/libs/constants/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<any>(null);
  const router = useRouter();

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        console.warn(`[auth] ${AUTH_MESSAGES.NO_REFRESH_TOKEN}`);
        logout();
        return false;
      }

      // Validate refresh token expiration before attempting refresh
      const refreshTokenExpiry = localStorage.getItem(
        LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT,
      );
      if (refreshTokenExpiry) {
        const expiryTime = new Date(refreshTokenExpiry).getTime();
        const now = new Date().getTime();
        if (expiryTime < now) {
          console.warn(`[auth] ${AUTH_MESSAGES.REFRESH_TOKEN_EXPIRED}`);
          logout();
          return false;
        }
      }

      const response = await authApi.refreshToken(refreshToken);
      const newAccessToken = response?.access_token;

      if (!newAccessToken || typeof newAccessToken !== "string") {
        console.error(`[auth] ${AUTH_MESSAGES.INVALID_ACCESS_TOKEN}:`, newAccessToken);
        logout();
        return false;
      }

      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, newAccessToken);
      if (response.refresh_token) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      }
      if (response.refresh_token_expires_at) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT,
          response.refresh_token_expires_at,
        );
      }

      setToken(newAccessToken);

      try {
        const decoded: any = jwtDecode(newAccessToken);
        setUser({
          userId: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        });
      } catch (decodeError) {
        console.error("[auth] Failed to decode new token:", decodeError);
        logout();
        return false;
      }

      console.log(
        `[auth] ${new Date().toISOString()} - Token refreshed successfully`,
      );
      return true;
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || error.message || "Unknown error";
      console.error(
        `[auth] ${new Date().toISOString()} - ${AUTH_MESSAGES.TOKEN_REFRESH_FAIL}:`,
        errorMsg,
      );

      return false;
    }
  };

  const startRefreshTimer = () => {
    if (refreshInterval) clearInterval(refreshInterval);
    console.log("[auth] Starting token refresh timer (10 minutes)");
    const interval = setInterval(
      () => {
        refreshAccessToken();
      },
      10 * 60 * 1000,
    );
    setRefreshInterval(interval);
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
    if (storedToken) {
      try {
        const decoded: any = jwtDecode(storedToken);
        setToken(storedToken);

        setUser({
          userId: decoded.sub,
          email: decoded.email,
          role: decoded.role,
          name: decoded.name,
        });

        startRefreshTimer();
      } catch (error) {
        console.error("Failed to decode stored token:", error);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT);
      }
    }
    setLoading(false);

    return () => {
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, []);

  const login = (
    newToken: string,
    refreshToken: string,
    refreshTokenExpiresAt?: string,
  ) => {
    if (!newToken || typeof newToken !== "string") {
      console.error("Invalid token provided to login:", newToken);
      return;
    }

    try {
      const decoded: any = jwtDecode(newToken);

      localStorage.setItem(LOCAL_STORAGE_KEYS.TOKEN, newToken);
      localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN, refreshToken);

      if (refreshTokenExpiresAt) {
        localStorage.setItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT, refreshTokenExpiresAt);
      } else {
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT,
          expiresAt.toISOString(),
        );
        console.log("Refresh token expires in 7 days");
      }

      setToken(newToken);

      const role = decoded.role?.toUpperCase();

      setUser({
        userId: decoded.sub,
        email: decoded.email,
        role: role,
        name: decoded.name,
      });

      startRefreshTimer();

      const redirectPath = ROLE_PATHS[role] || LOGIN_PAGE;

      console.log("User logged in, redirecting to:", redirectPath);

      setTimeout(() => {
        router.push(redirectPath);
      }, 0);
    } catch (error) {
      console.error("Failed to decode token during login:", error);
      logout();
    }
  };

  const logout = () => {
    console.log("User logging out");
    localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN_EXPIRES_AT);
    if (refreshInterval) clearInterval(refreshInterval);
    setToken(null);
    setUser(null);
    router.push(LOGIN_PAGE);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
