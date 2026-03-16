"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DEFAULT_REDIRECT, LOGIN_PAGE } from "@/app/libs/constants/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!token || !user) {
      router.push(LOGIN_PAGE);
      return;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push(DEFAULT_REDIRECT);
      return;
    }
  }, [user, token, loading, router, allowedRoles]);

  if (loading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!token || !user) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
