"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_REDIRECT, ROLE_PATHS } from "@/app/libs/constants/auth";

interface PublicRouteProps {
  children: React.ReactNode;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({ children }) => {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (token && user) {
      const redirectPath = ROLE_PATHS[user.role] || DEFAULT_REDIRECT;
      router.push(redirectPath);
      return;
    }
  }, [user, token, loading, router]);

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (token && user) {
    return null;
  }

  return <>{children}</>;
};
