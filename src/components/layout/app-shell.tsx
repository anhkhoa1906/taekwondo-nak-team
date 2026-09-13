"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";

import Sidebar from "@/components/dashboard/sidebar";

const AUTH_PATHS = ["/dang-nhap", "/dang-ky"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAuthPage = AUTH_PATHS.includes(pathname);

  // ==========================================
  // AUTH PAGES
  // ==========================================

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  // ==========================================
  // DASHBOARD
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <main
        className={`min-h-screen transition-[padding] duration-300 ease-out ${
          sidebarOpen ? "lg:pl-[264px]" : "lg:pl-[76px]"
        }`}
      >
        {children}
      </main>
    </div>
  );
}
