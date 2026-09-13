"use client";

import { useAuth } from "@/context/auth-context";

export function useRole() {
  const { profile, profileLoading } = useAuth();

  const role = profile?.role ?? null;

  return {
    role,
    loading: profileLoading,

    isAdmin: role === "admin",
    isCoach: role === "coach",
    isStaff: role === "staff",
  };
}
