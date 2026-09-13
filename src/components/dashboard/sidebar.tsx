"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import {
  Award,
  BarChart3,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Check,
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
  UserRoundCog,
  Users,
  X,
  Eye,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/context/auth-context";
import { useClub } from "@/context/club-context";

// =====================================================
// MENU TYPES
// =====================================================

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

// =====================================================
// MENU
// =====================================================

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

// =====================================================
// LOGO IMAGE
// =====================================================

function NakLogo() {
  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-lg"
      title="NAK TEAM"
    >
      <img
        src="/nak-team-logo.png"
        alt="NAK TEAM"
        className="h-full w-full object-cover"
      />
    </div>
  );
}

// =====================================================
// PROPS
// =====================================================

type SidebarProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// =====================================================
// COMPONENT
// =====================================================

export default function Sidebar({ open, onOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, signOut } = useAuth();

  const { clubs, club, role, canManage, isAdmin, switchClub } = useClub();

  const [mobileOpen, setMobileOpen] = useState(false);

  const [loggingOut, setLoggingOut] = useState(false);

  const [clubMenuOpen, setClubMenuOpen] = useState(false);

  const [clubMenuPosition, setClubMenuPosition] = useState({
    top: 0,
    left: 0,
    width: 250,
  });

  const clubButtonRef = useRef<HTMLButtonElement | null>(null);

  // =====================================================
  // CLUB SWITCH
  // =====================================================

  // Chỉ Admin được chuyển CLB
  const canSwitchClub = isAdmin && clubs.length > 1;

  // =====================================================
  // VISIBLE MENU
  // =====================================================

  const visibleSections = useMemo(() => {
    return menuItems
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => !item.adminOnly || isAdmin),
      }))
      .filter((section) => section.items.length > 0);
  }, [isAdmin]);

  // =====================================================
  // ROUTE CHANGE
  // =====================================================

  useEffect(() => {
    setMobileOpen(false);
    setClubMenuOpen(false);
  }, [pathname]);

  // =====================================================
  // ESC
  // =====================================================

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setClubMenuOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // =====================================================
  // CLICK OUTSIDE CLUB MENU
  // =====================================================

  useEffect(() => {
    if (!clubMenuOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (clubButtonRef.current && clubButtonRef.current.contains(target)) {
        return;
      }

      const dropdown = document.getElementById("nak-club-switcher-dropdown");

      if (dropdown && dropdown.contains(target)) {
        return;
      }

      setClubMenuOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [clubMenuOpen]);

  // =====================================================
  // CLUB MENU POSITION
  // =====================================================

  function updateClubMenuPosition() {
    const button = clubButtonRef.current;

    if (!button) return;

    const rect = button.getBoundingClientRect();

    const dropdownWidth = 250;

    let left = rect.left;

    if (!open && window.innerWidth >= 1024) {
      left = rect.right + 10;
    }

    const maxLeft = window.innerWidth - dropdownWidth - 12;

    left = Math.max(12, Math.min(left, maxLeft));

    const estimatedHeight = 180;

    let top = rect.bottom + 8;

    if (top + estimatedHeight > window.innerHeight - 12) {
      top = rect.top - estimatedHeight - 8;
    }

    top = Math.max(12, top);

    setClubMenuPosition({
      top,
      left,
      width: dropdownWidth,
    });
  }

  // =====================================================
  // TOGGLE CLUB MENU
  // =====================================================

  function handleToggleClubMenu() {
    if (!canSwitchClub) return;

    updateClubMenuPosition();

    setClubMenuOpen((current) => !current);
  }

  // =====================================================
  // SWITCH CLUB
  // =====================================================

  function handleSwitchClub(clubId: string) {
    if (!isAdmin) {
      console.warn("Chỉ Admin mới được chuyển CLB.");

      setClubMenuOpen(false);

      return;
    }

    const nextClub = clubs.find((item) => item.id === clubId);

    if (!nextClub) {
      console.error("Không tìm thấy CLB:", clubId);

      return;
    }

    if (nextClub.role !== "admin") {
      console.warn("Không có quyền chuyển sang CLB này.");

      setClubMenuOpen(false);

      return;
    }

    switchClub(clubId);

    setClubMenuOpen(false);
    setMobileOpen(false);
  }

  // =====================================================
  // LOGOUT
  // =====================================================

  async function handleSignOut() {
    try {
      setLoggingOut(true);

      await signOut();

      router.push("/dang-nhap");
      router.refresh();
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    } finally {
      setLoggingOut(false);
    }
  }

  // =====================================================
  // USER
  // =====================================================

  const email = user?.email ?? "Chưa đăng nhập";

  const username =
    profile?.display_name?.trim() || user?.email?.split("@")[0] || "Tài khoản";

  const avatarUrl = profile?.avatar_url?.trim() || "";

  const initials =
    username
      .replace(/[^a-zA-ZÀ-ỹ0-9]/g, "")
      .slice(0, 2)
      .toUpperCase() || "NA";

  const roleLabel =
    role === "admin"
      ? "Admin"
      : role === "coach"
        ? "Coach"
        : role === "staff"
          ? "Staff"
          : "Chưa phân quyền";

  // =====================================================
  // CLUB DROPDOWN
  // =====================================================

  function ClubDropdown() {
    if (!clubMenuOpen || !canSwitchClub || typeof document === "undefined") {
      return null;
    }

    return createPortal(
      <div
        id="nak-club-switcher-dropdown"
        className="fixed z-[99999] overflow-hidden rounded-2xl border border-slate-700 bg-[#101827] p-2 shadow-2xl shadow-black/40"
        style={{
          top: clubMenuPosition.top,
          left: clubMenuPosition.left,
          width: clubMenuPosition.width,
        }}
      >
        {/* HEADER */}

        <div className="px-3 pb-2 pt-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-500">
            SWITCH CLUB
          </p>

          <p className="mt-1 text-[11px] text-slate-600">
            Chọn câu lạc bộ bạn muốn làm việc
          </p>
        </div>

        {/* CLUB LIST */}

        <div className="space-y-1">
          {clubs.map((item) => {
            const isCurrent = item.id === club?.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSwitchClub(item.id)}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                  isCurrent
                    ? "bg-blue-500/10 text-white"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    isCurrent
                      ? "bg-blue-500 text-white"
                      : "bg-slate-800 text-slate-500"
                  }`}
                >
                  <Users className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-semibold">
                    {item.name}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    {item.role === "admin" ? (
                      <>
                        <ShieldCheck className="h-3 w-3 text-blue-400" />

                        <span className="text-[9px] font-bold uppercase tracking-wide text-blue-400">
                          Admin
                        </span>
                      </>
                    ) : item.role === "coach" ? (
                      <>
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />

                        <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-400">
                          Coach
                        </span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 text-slate-500" />

                        <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                          Staff
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {isCurrent && (
                  <Check className="h-4 w-4 shrink-0 text-blue-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>,
      document.body,
    );
  }

  // =====================================================
  // SIDEBAR BODY
  // =====================================================

  function SidebarBody({
    collapsed = false,
    mobile = false,
  }: {
    collapsed?: boolean;
    mobile?: boolean;
  }) {
    return (
      <div className="flex h-full min-h-0 flex-col bg-[#07101f] text-white">
        {/* =================================================
            BRAND
        ================================================= */}

        <div
          className={`flex h-[76px] shrink-0 items-center border-b border-white/[0.07] ${
            collapsed ? "justify-center px-2" : "justify-between px-5"
          }`}
        >
          {collapsed ? (
            <div title="NAK TEAM" className="flex items-center justify-center">
              <NakLogo />
            </div>
          ) : (
            <div className="flex min-w-0 items-center gap-3">
              {/* LOGO */}

              <NakLogo />

              {/* BRAND TEXT */}

              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-[16px] font-black tracking-tight text-white">
                    NAK
                  </span>

                  <span className="text-[16px] font-black tracking-tight text-blue-400">
                    TEAM
                  </span>
                </div>

                <p className="mt-0.5 max-w-[170px] truncate text-[8px] font-medium uppercase tracking-[0.13em] text-slate-500">
                  Taekwondo Management System
                </p>
              </div>
            </div>
          )}

          {/* MOBILE CLOSE */}

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

          {/* DESKTOP COLLAPSE */}

          {!mobile && !collapsed && (
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.06] hover:text-blue-400"
              title="Thu gọn sidebar"
              aria-label="Thu gọn sidebar"
            >
              <PanelLeftClose className="h-[18px] w-[18px]" />
            </button>
          )}
        </div>

        {/* =================================================
            CLUB
        ================================================= */}

        <div className="relative z-[100] shrink-0 px-3 pt-3">
          {!collapsed ? (
            <button
              ref={clubButtonRef}
              type="button"
              onClick={handleToggleClubMenu}
              disabled={!canSwitchClub}
              className={`group w-full rounded-2xl border p-3 text-left transition-all ${
                clubMenuOpen
                  ? "border-blue-500/30 bg-white/[0.08]"
                  : "border-white/[0.08] bg-white/[0.035]"
              } ${
                canSwitchClub
                  ? "cursor-pointer hover:border-blue-500/20 hover:bg-white/[0.06]"
                  : "cursor-default"
              }`}
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-slate-600">
                  CURRENT CLUB
                </span>

                {canSwitchClub && (
                  <ChevronDown
                    className={`h-3.5 w-3.5 text-slate-500 transition-transform ${
                      clubMenuOpen ? "rotate-180 text-blue-400" : ""
                    }`}
                  />
                )}
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="h-4 w-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-white">
                    {club?.name ?? "Chưa chọn CLB"}
                  </p>

                  <div className="mt-1 flex items-center gap-1.5">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        canManage ? "bg-emerald-400" : "bg-slate-500"
                      }`}
                    />

                    <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">
                      {canManage ? "Manage" : "View only"}
                    </span>
                  </div>
                </div>

                {canSwitchClub && (
                  <span className="text-[9px] font-bold text-blue-400">
                    SWITCH
                  </span>
                )}
              </div>
            </button>
          ) : (
            <button
              ref={clubButtonRef}
              type="button"
              onClick={handleToggleClubMenu}
              disabled={!canSwitchClub}
              title={club?.name ?? "Chưa chọn CLB"}
              className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                canSwitchClub
                  ? "border-blue-500/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                  : "border-white/[0.08] bg-white/[0.035] text-slate-500"
              }`}
            >
              <Users className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <nav className="sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-5">
          <div className="space-y-6">
            {visibleSections.map((section) => (
              <div key={section.title}>
                {!collapsed ? (
                  <div className="mb-2 px-3">
                    <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
                      {section.title}
                    </p>
                  </div>
                ) : (
                  <div className="mb-2 h-px bg-white/[0.06]" />
                )}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;

                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" &&
                        pathname.startsWith(`${item.href}/`));

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={collapsed ? item.label : undefined}
                        className={`group relative flex items-center rounded-xl transition-all ${
                          collapsed
                            ? "mx-auto h-11 w-11 justify-center"
                            : "h-11 gap-3 px-3"
                        } ${
                          isActive
                            ? "bg-blue-500/10 text-blue-400"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        {/* ACTIVE BAR */}

                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-blue-500" />
                        )}

                        <Icon
                          className={`shrink-0 transition ${
                            collapsed
                              ? "h-[19px] w-[19px]"
                              : "h-[18px] w-[18px]"
                          } ${
                            isActive
                              ? "text-blue-400"
                              : "text-slate-500 group-hover:text-slate-200"
                          }`}
                          strokeWidth={isActive ? 2 : 1.8}
                        />

                        {!collapsed && (
                          <>
                            <span
                              className={`flex-1 truncate text-[13px] ${
                                isActive
                                  ? "font-semibold text-white"
                                  : "font-medium"
                              }`}
                            >
                              {item.label}
                            </span>

                            {isActive && (
                              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-blue-400/70" />
                            )}
                          </>
                        )}

                        {/* TOOLTIP */}

                        {collapsed && (
                          <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
                            {item.label}
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>

        {/* =================================================
            USER
        ================================================= */}

        <div
          className={`shrink-0 border-t border-white/[0.07] ${
            collapsed ? "px-2 py-4" : "px-3 py-4"
          }`}
        >
          {!collapsed ? (
            <>
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-3">
                <div className="flex items-center gap-3">
                  {/* AVATAR */}

                  <div className="relative shrink-0">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={username}
                        className="h-10 w-10 rounded-full object-cover ring-2 ring-white/10"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-black text-white shadow-lg">
                        {initials}
                      </div>
                    )}

                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#07101f] bg-emerald-400" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-semibold text-white">
                      {username}
                    </p>

                    <p className="truncate text-[10px] text-slate-500">
                      {email}
                    </p>

                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-blue-400">
                      {roleLabel}
                    </p>
                  </div>
                </div>
              </div>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="mt-2 flex h-10 w-full items-center gap-3 rounded-xl px-3 text-slate-500 transition hover:bg-blue-500/[0.08] hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut className="h-[18px] w-[18px]" strokeWidth={1.8} />

                <span className="text-[13px] font-medium">
                  {loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                </span>
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              {/* MINI PROFILE */}

              <div className="group relative">
                <button
                  type="button"
                  className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-xs font-black text-white shadow-lg"
                  title={`${username} · ${roleLabel}`}
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}

                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#07101f] bg-emerald-400" />
                </button>

                <div className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-[100] -translate-y-1/2 whitespace-nowrap rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-white opacity-0 shadow-xl transition group-hover:opacity-100">
                  {username}

                  <span className="ml-1 text-slate-500">· {roleLabel}</span>
                </div>
              </div>

              {/* LOGOUT */}

              <button
                type="button"
                onClick={handleSignOut}
                disabled={loggingOut}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-500/[0.08] hover:text-blue-400 disabled:opacity-50"
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

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <>
      {/* =================================================
          DESKTOP
      ================================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-50 hidden overflow-hidden border-r border-slate-800/80 shadow-2xl shadow-black/20 transition-[width] duration-300 ease-out lg:block ${
          open ? "w-[264px]" : "w-[76px]"
        }`}
      >
        <SidebarBody collapsed={!open} />
      </aside>

      {/* =================================================
          OPEN SIDEBAR BUTTON
      ================================================= */}

      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed left-[18px] top-4 z-[60] hidden h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900 text-slate-300 shadow-xl transition hover:border-blue-500/30 hover:bg-slate-800 hover:text-blue-400 lg:flex"
          title="Mở sidebar"
          aria-label="Mở sidebar"
        >
          <PanelLeftOpen className="h-[18px] w-[18px]" />
        </button>
      )}

      {/* =================================================
          MOBILE BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-lg lg:hidden"
        title="Mở menu"
        aria-label="Mở menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* =================================================
          MOBILE BACKDROP
      ================================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[70] bg-slate-950/60 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/* =================================================
          MOBILE SIDEBAR
      ================================================= */}

      <aside
        className={`fixed inset-y-0 left-0 z-[80] w-[285px] overflow-hidden shadow-2xl transition-transform duration-300 ease-out lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarBody mobile />
      </aside>

      {/* =================================================
          CLUB DROPDOWN
      ================================================= */}

      <ClubDropdown />

      {/* =================================================
          SCROLLBAR
      ================================================= */}

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
