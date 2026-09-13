"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/context/auth-context";

export type Club = {
  id: string;
  name: string;
  role: "admin" | "coach" | "staff";
  accessLevel: "manage" | "view";
};

type ClubContextType = {
  clubs: Club[];
  club: Club | null;
  role: Club["role"] | null;

  canManage: boolean;
  isAdmin: boolean;

  loading: boolean;

  switchClub: (clubId: string) => void;
  refreshClubs: () => Promise<void>;
};

const ClubContext = createContext<ClubContextType | undefined>(undefined);

const STORAGE_KEY = "nak-current-club-id";

export function ClubProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();

  const [clubs, setClubs] = useState<Club[]>([]);

  const [club, setClub] = useState<Club | null>(null);

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD CLUBS
  // =====================================================

  const loadClubs = useCallback(async () => {
    if (!user) {
      setClubs([]);
      setClub(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("club_members")
      .select(
        `
            club_id,
            role,
            access_level,
            clubs (
              id,
              name
            )
          `,
      )
      .eq("user_id", user.id);

    if (error) {
      console.error("Lỗi tải danh sách CLB:", error);

      setClubs([]);
      setClub(null);
      setLoading(false);

      return;
    }

    const mappedClubs: Club[] = (data ?? [])
      .map((item) => {
        const clubData = Array.isArray(item.clubs) ? item.clubs[0] : item.clubs;

        if (!clubData) {
          return null;
        }

        return {
          id: clubData.id,
          name: clubData.name,
          role: item.role as Club["role"],
          accessLevel: item.access_level as Club["accessLevel"],
        };
      })
      .filter((item): item is Club => item !== null);

    // =================================================
    // ADMIN
    // Admin được giữ toàn bộ danh sách CLB
    // =================================================

    const isAdmin = mappedClubs.some((item) => item.role === "admin");

    if (isAdmin) {
      setClubs(mappedClubs);

      const savedClubId =
        typeof window !== "undefined"
          ? localStorage.getItem(STORAGE_KEY)
          : null;

      const savedClub = mappedClubs.find((item) => item.id === savedClubId);

      if (savedClub) {
        setClub(savedClub);
      } else if (mappedClubs.length > 0) {
        const firstClub = mappedClubs[0];

        setClub(firstClub);

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, firstClub.id);
        }
      } else {
        setClub(null);
      }

      setLoading(false);
      return;
    }

    // =================================================
    // COACH / STAFF
    //
    // Chỉ được sử dụng CLB đầu tiên
    // Không cho chuyển CLB
    // =================================================

    const ownClub = mappedClubs[0] ?? null;

    const ownClubs = ownClub ? [ownClub] : [];

    setClubs(ownClubs);

    setClub(ownClub);

    // Xóa CLB cũ đã lưu của Admin
    // để tránh Coach/Staff mở lại CLB khác
    if (typeof window !== "undefined") {
      if (ownClub) {
        localStorage.setItem(STORAGE_KEY, ownClub.id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setLoading(false);
  }, [user]);

  // =====================================================
  // EFFECT
  // =====================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    loadClubs();
  }, [authLoading, loadClubs]);

  // =====================================================
  // SWITCH CLUB
  //
  // CHỈ ADMIN ĐƯỢC CHUYỂN
  // =====================================================

  const switchClub = useCallback(
    (clubId: string) => {
      // Không có CLB hiện tại
      if (!club) {
        console.error("Chưa xác định CLB hiện tại.");
        return;
      }

      // =================================================
      // COACH / STAFF KHÔNG ĐƯỢC CHUYỂN
      // =================================================

      if (club.role !== "admin") {
        console.warn("Coach/Staff không được phép chuyển CLB.");

        return;
      }

      // =================================================
      // ADMIN
      // =================================================

      const nextClub = clubs.find((item) => item.id === clubId);

      if (!nextClub) {
        console.error(
          "Không tìm thấy CLB hoặc không có quyền truy cập:",
          clubId,
        );

        return;
      }

      if (nextClub.role !== "admin") {
        console.error("Admin không có quyền quản lý CLB này.");

        return;
      }

      setClub(nextClub);

      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, nextClub.id);

        window.dispatchEvent(
          new CustomEvent("club-changed", {
            detail: {
              clubId: nextClub.id,
            },
          }),
        );
      }
    },
    [club, clubs],
  );

  // =====================================================
  // PERMISSION
  // =====================================================

  const canManage =
    club?.role === "admin" ||
    (club?.role === "coach" && club.accessLevel === "manage");

  const isAdmin = club?.role === "admin";

  // =====================================================
  // PROVIDER
  // =====================================================

  return (
    <ClubContext.Provider
      value={{
        clubs,
        club,
        role: club?.role ?? null,

        canManage,

        isAdmin,

        loading: authLoading || loading,

        switchClub,

        refreshClubs: loadClubs,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useClub() {
  const context = useContext(ClubContext);

  if (!context) {
    throw new Error("useClub phải được sử dụng bên trong ClubProvider");
  }

  return context;
}
