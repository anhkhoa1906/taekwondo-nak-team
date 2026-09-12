"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";

const PUBLIC_PATHS = ["/dang-nhap", "/dang-ky"];

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isPublicPath = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    if (loading) return;

    if (!user && !isPublicPath) {
      router.replace("/dang-nhap");
    }

    if (user && isPublicPath) {
      router.replace("/");
    }
  }, [user, loading, isPublicPath, pathname, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-slate-800" />
          <p className="text-sm text-slate-500">Đang kiểm tra đăng nhập...</p>
        </div>
      </div>
    );
  }

  if (!user && !isPublicPath) {
    return null;
  }

  if (user && isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
