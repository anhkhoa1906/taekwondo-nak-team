"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Award,
  BarChart3,
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  ShieldCheck,
  Swords,
  UserRoundCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useRole } from "@/hooks/use-role";

type MenuItem = {
  label: string;
  icon: LucideIcon;
  href: string;
  adminOnly?: boolean;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menuItems: MenuSection[] = [
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
    title: "HỆ THỐNG",
    items: [
      {
        label: "Cài đặt",
        icon: Settings,
        href: "/cai-dat",
      },
      {
        label: "Quản lý tài khoản",
        icon: UserRoundCog,
        href: "/quan-ly-tai-khoan",
        adminOnly: true,
      },
    ],
  },
];

type SidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useRole();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  // ==========================================
  // MENU THEO ROLE
  // ==========================================

  const visibleSections = useMemo(() => {
    return menuItems
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.adminOnly || isAdmin),
      }))
      .filter((section) => section.items.length > 0);
  }, [isAdmin]);

  // ==========================================
  // MOBILE ROUTE CHANGE
  // ==========================================

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ==========================================
  // ESC
  // ==========================================

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // ==========================================
  // LOGOUT
  // ==========================================

  async function handleSignOut() {
    try {
      setLoggingOut(true);

      await signOut();

      router.push("/dang-nhap");
      router.refresh();
    } finally {
      setLoggingOut(false);
    }
  }

  // ==========================================
  // USER
  // ==========================================

  const email = user?.email ?? "Chưa đăng nhập";

  const username = user?.email?.split("@")[0] ?? "Tài khoản";

  const roleLabel =
    profile?.role === "admin"
      ? "Admin"
      : profile?.role === "coach"
        ? "Coach"
        : profile?.role === "staff"
          ? "Staff"
          : "Chưa phân quyền";

  const initials =
    username
      .replace(/[^a-zA-ZÀ-ỹ0-9]/g, "")
      .slice(0, 2)
      .toUpperCase() || "NA";

  // ==========================================
  // SIDEBAR BODY
  // ==========================================

  function SidebarBody({
    collapsed = false,
    mobile = false,
  }: {
    collapsed?: boolean;
    mobile?: boolean;
  }) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#07101f] text-white">
        {/* =====================================
            BRAND
        ===================================== */}

        <div
          className={`flex h-[76px] shrink-0 items-center border-b border-white/[0.07] ${
            collapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          {collapsed ? (
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-950 shadow-lg"
              title="Taekwondo NAK Team"
            >
              <Swords className="h-5 w-5" />
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950 shadow-lg">
                <Swords className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-black tracking-wide text-white">
                    TAEKWONDO
                  </span>

                  <span className="text-[13px] font-black tracking-wide text-red-500">
                    NAK
                  </span>
                </div>

                <p className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
                  Team Management
                </p>
              </div>
            </div>
          )}

          {mobile && (
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
              aria-label="Đóng menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {!mobile && !collapsed && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-white"
              title="Thu gọn sidebar"
              aria-label="Thu gọn sidebar"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        {/* =====================================
            MENU
        ===================================== */}

        <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          <div className="space-y-6">
            {visibleSections.map((section) => (
              <div key={section.title}>
                {!collapsed && (
                  <div className="mb-2 flex items-center gap-2 px-2">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-600">
                      {section.title}
                    </span>

                    <div className="h-px flex-1 bg-white/[0.04]" />
                  </div>
                )}

                {collapsed && <div className="mb-2 h-px bg-white/[0.05]" />}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                    return (
                      <div key={item.href} className="group relative">
                        <Link
                          href={item.href}
                          className={`relative flex h-11 items-center rounded-xl transition-all duration-200 ${
                            collapsed ? "justify-center px-0" : "gap-3 px-3"
                          } ${
                            isActive
                              ? "bg-white/[0.10] text-white"
                              : "text-slate-400 hover:bg-white/[0.045] hover:text-slate-100"
                          }`}
                        >
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-red-500" />
                          )}

                          <Icon
                            className={`h-[19px] w-[19px] shrink-0 ${
                              isActive
                                ? "text-red-400"
                                : "text-slate-500 group-hover:text-slate-300"
                            }`}
                            strokeWidth={1.8}
                          />

                          {!collapsed && (
                            <>
                              <span
                                className={`min-w-0 flex-1 truncate text-[13px] ${
                                  isActive ? "font-semibold" : "font-medium"
                                }`}
                              >
                                {item.label}
                              </span>

                              {isActive && (
                                <ChevronRight className="h-3.5 w-3.5 text-slate-500" />
                              )}
                            </>
                          )}
                        </Link>

                        {/* Tooltip collapsed */}

                        {collapsed && !mobile && (
                          <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-medium text-white opacity-0 shadow-2xl transition-all duration-150 group-hover:translate-x-1 group-hover:opacity-100">
                            {item.label}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* =====================================
            USER
        ===================================== */}

        <div className="shrink-0 border-t border-white/[0.07] p-3">
          {!collapsed ? (
            <>
              <div className="rounded-xl bg-white/[0.045] p-3">
                <div className="flex items-center gap-3">
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-black text-white shadow-lg">
                    {initials}

                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#07101f] bg-emerald-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {username}
                    </p>

                    <p className="truncate text-[10px] text-slate-500">
                      {email}
                    </p>

                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-red-400">
                      {roleLabel}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="mt-2 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-slate-500 transition hover:bg-red-500/[0.08] hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />

                <span className="text-[13px] font-medium">
                  {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="group relative">
                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-xs font-black text-white shadow-lg"
                  title={`${username} · ${roleLabel}`}
                >
                  {initials}

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#07101f] bg-emerald-400" />
                </button>

                <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                  {username}
                  <span className="ml-1 text-slate-500">· {roleLabel}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-500/[0.08] hover:text-red-400 disabled:opacity-50"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="h-[17px] w-[17px]" strokeWidth={1.8} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* =========================================
          DESKTOP SIDEBAR
      ========================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-slate-800/80 shadow-2xl shadow-black/20 transition-[width] duration-300 ease-out lg:block ${
          open ? "w-[264px]" : "w-[76px]"
        }`}
      >
        <SidebarBody collapsed={!open} />
      </aside>

      {/* =========================================
          COLLAPSED OPEN BUTTON
      ========================================= */}

      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed left-[18px] top-4 z-[60] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-300 shadow-xl transition hover:bg-slate-800 hover:text-white lg:flex"
          title="Mở sidebar"
          aria-label="Mở sidebar"
        >
          <PanelLeftOpen className="h-[18px] w-[18px]" />
        </button>
      )}

      {/* =========================================
          MOBILE BUTTON
      ========================================= */}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg lg:hidden"
        title="Mở menu"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* =========================================
          MOBILE BACKDROP
      ========================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* =========================================
          MOBILE SIDEBAR
      ========================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-[80] w-[285px] overflow-hidden shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarBody mobile />
      </aside>

      {/* =========================================
          SCROLLBAR
      ========================================= */}

      <style jsx global>{`
        .sidebar-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(148, 163, 184, 0.2) transparent;
        }

        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.2);
          border-radius: 999px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.35);
        }
      `}</style>
    </>
  );
}
