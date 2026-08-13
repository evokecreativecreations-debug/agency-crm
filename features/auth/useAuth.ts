"use client";

import { AuthContext } from "@/features/auth/AuthContext";
import { useContext } from "react";

/**
 * useAuth — read the current user/session anywhere in the app.
 *
 * Example:
 *   const { user, isLoading, signOut } = useAuth();
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>");
  }
  return context;
}
