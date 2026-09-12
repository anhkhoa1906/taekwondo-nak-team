"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";

const AUTH_PATHS = ["/dang-nhap", "/dang-ky"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) {
    return <main className="min-h-screen">{children}</main>;
  }

  return (
    <>
      <Sidebar />
      <main className="min-h-screen pl-20">{children}</main>
    </>
  );
}
