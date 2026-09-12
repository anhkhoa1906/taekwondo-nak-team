"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Award,
  UserRoundCog,
  BarChart3,
  FileText,
  Settings,
  PanelLeft,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { useAuth } from "@/context/auth-context";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
};

const menuItems: {
  title: string;
  items: MenuItem[];
}[] = [
  {
    title: "QUẢN LÝ",
    items: [
      {
        label: "Tổng quan",
        icon: LayoutDashboard,
        href: "/",
      },
      {
        label: "Học viên",
        icon: Users,
        href: "/hoc-vien",
      },
      {
        label: "Lớp học",
        icon: CalendarDays,
        href: "/lop-hoc",
      },
      {
        label: "Điểm danh",
        icon: ClipboardCheck,
        href: "/diem-danh",
      },
      {
        label: "Học phí",
        icon: CreditCard,
        href: "/hoc-phi",
      },
      {
        label: "Cấp đai",
        icon: Award,
        href: "/cap-dai",
      },
      {
        label: "Huấn luyện viên",
        icon: UserRoundCog,
        href: "/huan-luyen-vien",
      },
    ],
  },
  {
    title: "BÁO CÁO",
    items: [
      {
        label: "Thống kê",
        icon: BarChart3,
        href: "/thong-ke",
      },
      {
        label: "Báo cáo",
        icon: FileText,
        href: "/bao-cao",
      },
    ],
  },
  {
    title: "KHÁC",
    items: [
      {
        label: "Cài đặt",
        icon: Settings,
        href: "/cai-dat",
      },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const { user, signOut } = useAuth();

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleSignOut() {
    setLoggingOut(true);

    await signOut();

    router.push("/dang-nhap");
    router.refresh();
  }

  const email = user?.email ?? "Chưa đăng nhập";

  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <>
      {/* =========================
          SIDEBAR
      ========================= */}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen min-w-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-950 text-white shadow-xl transition-all duration-300 ${
          open ? "w-64" : "w-20"
        }`}
      >
        {/* =========================
            TOP
        ========================= */}

        <div
          className={`flex h-20 shrink-0 items-center ${
            open ? "justify-between px-4" : "justify-center"
          }`}
        >
          {/* LOGO */}

          {open && (
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl">
                🥋
              </div>

              <div>
                <h1 className="text-sm font-bold">Taekwondo NAK Team</h1>

                <p className="text-[10px] text-slate-400">Quản lý CLB</p>
              </div>
            </div>
          )}

          {/* NÚT ĐÓNG */}

          {open && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
              title="Thu gọn"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* =========================
            MENU
        ========================= */}

        <nav className="min-w-0 flex-1 overflow-x-hidden overflow-y-auto px-3 py-3">
          {menuItems.map((section) => (
            <div key={section.title} className="mb-6">
              {open && (
                <p className="mb-2 px-2 text-[10px] font-medium tracking-wider text-slate-500">
                  {section.title}
                </p>
              )}

              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  if (item.href) {
                    const isActive = pathname === item.href;

                    return (
                      <div key={item.label} className="group relative">
                        <Link
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={`flex h-11 items-center rounded-xl transition-all ${
                            open ? "gap-3 px-3" : "justify-center px-0"
                          } ${
                            isActive
                              ? "bg-slate-800 text-white shadow-sm"
                              : "text-slate-400 hover:bg-slate-900 hover:text-white"
                          }`}
                        >
                          <Icon className="h-5 w-5 shrink-0" />

                          {open && (
                            <span className="text-sm">{item.label}</span>
                          )}
                        </Link>

                        {!open && (
                          <div className="pointer-events-none absolute left-14 top-1/2 z-[70] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                            {item.label}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={item.label} className="group relative">
                      <button
                        type="button"
                        className={`flex h-11 w-full items-center rounded-xl text-slate-400 transition-all hover:bg-slate-900 hover:text-white ${
                          open ? "gap-3 px-3" : "justify-center px-0"
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0" />

                        {open && <span className="text-sm">{item.label}</span>}
                      </button>

                      {!open && (
                        <div className="pointer-events-none absolute left-14 top-1/2 z-[70] -translate-y-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                          {item.label}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* =========================
            USER
        ========================= */}

        <div className="shrink-0 border-t border-slate-800 p-3">
          <div
            className={`flex items-center ${
              open ? "gap-3 px-1" : "justify-center"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500 text-sm font-semibold text-white">
              {initials}
            </div>

            {open && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {user?.email ? user.email.split("@")[0] : "Tài khoản"}
                </p>

                <p className="truncate text-xs text-slate-400">{email}</p>
              </div>
            )}
          </div>

          {/* ĐĂNG XUẤT */}

          {open && (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="mt-3 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />

              {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
            </button>
          )}
        </div>
      </aside>

      {/* =========================
          NÚT MỞ SIDEBAR
      ========================= */}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed left-4 top-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-lg transition-all hover:bg-slate-800"
          title="Mở thanh bên"
          aria-label="Mở thanh bên"
        >
          <PanelLeft className="h-5 w-5" />
        </button>
      )}
    </>
  );
}
