"use client";

import { ChevronDown } from "lucide-react";
import { useAuth } from "@/context/auth-context";

export default function Header() {
  const { profile } = useAuth();

  const roleLabel =
    profile?.role === "admin"
      ? "Admin"
      : profile?.role === "coach"
        ? "Coach"
        : profile?.role === "staff"
          ? "Staff"
          : "User";

  return (
    <header className="flex h-20 items-center justify-end border-b bg-white px-8">
      {/* Account */}
      <button className="flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg">
          👤
        </div>

        <span className="text-sm font-semibold text-slate-800">
          {roleLabel}
        </span>

        <ChevronDown className="h-4 w-4 text-slate-500" />
      </button>
    </header>
  );
}
