"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { createClient } from "@/lib/supabase/client";
import { useClub } from "@/context/club-context";

export type Coach = {
  id: number;
  name: string;
  phone: string;
  birthDate: string;
  gender: string;
  specialization: string;
  joinDate: string;
  status: string;
  note: string;
  avatarUrl: string;
};

type CoachActionResult = {
  error: string | null;
};

type CoachContextType = {
  coaches: Coach[];

  addCoach: (coach: Coach) => Promise<CoachActionResult>;

  updateCoach: (coach: Coach) => Promise<CoachActionResult>;

  deleteCoach: (id: number) => Promise<CoachActionResult>;
};

type CoachRow = {
  id: number;
  club_id: string;
  name: string;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  specialization: string | null;
  join_date: string | null;
  status: string | null;
  note: string | null;
  avatar_url: string | null;
};

const CoachContext = createContext<CoachContextType | undefined>(undefined);

// =====================================================
// DATE HELPERS
// =====================================================

function formatDateForDisplay(date: string | null) {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function formatDateForDatabase(date: string) {
  if (!date) return null;

  const parts = date.split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return date;
}

// =====================================================
// MAP
// =====================================================

function mapCoach(row: CoachRow): Coach {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    birthDate: formatDateForDisplay(row.birth_date),
    gender: row.gender ?? "",
    specialization: row.specialization ?? "",
    joinDate: formatDateForDisplay(row.join_date),
    status: row.status ?? "",
    note: row.note ?? "",
    avatarUrl: row.avatar_url ?? "",
  };
}

// =====================================================
// AVATAR PATH
// =====================================================

function getCoachAvatarPath(avatarUrl: string) {
  if (!avatarUrl) return null;

  try {
    const url = new URL(avatarUrl);

    const marker = "/storage/v1/object/public/coach-avatars/";

    const index = url.pathname.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return url.pathname.substring(index + marker.length);
  } catch {
    return null;
  }
}

// =====================================================
// PROVIDER
// =====================================================

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const { club, loading: clubLoading } = useClub();

  const [coaches, setCoaches] = useState<Coach[]>([]);

  // ===================================================
  // LOAD
  // ===================================================

  const loadCoaches = useCallback(async () => {
    if (!club?.id) {
      setCoaches([]);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("coaches")
      .select("*")
      .eq("club_id", club.id)
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error("Lỗi tải danh sách HLV:", error);
      setCoaches([]);
      return;
    }

    setCoaches((data as CoachRow[]).map(mapCoach));
  }, [club?.id]);

  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {
    if (clubLoading) return;

    loadCoaches();
  }, [clubLoading, loadCoaches]);

  // ===================================================
  // LISTEN CLUB CHANGE
  // ===================================================

  useEffect(() => {
    function handleClubChanged() {
      loadCoaches();
    }

    window.addEventListener("club-changed", handleClubChanged);

    return () => {
      window.removeEventListener("club-changed", handleClubChanged);
    };
  }, [loadCoaches]);

  // ===================================================
  // ADD
  // ===================================================

  const addCoach = useCallback(
    async (coach: Coach): Promise<CoachActionResult> => {
      if (!club?.id) {
        return {
          error: "Không xác định được CLB hiện tại.",
        };
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("coaches")
        .insert({
          club_id: club.id,
          name: coach.name.trim(),
          phone: coach.phone.trim(),
          birth_date: formatDateForDatabase(coach.birthDate),
          gender: coach.gender,
          specialization: coach.specialization,
          join_date: formatDateForDatabase(coach.joinDate),
          status: coach.status,
          note: coach.note.trim(),
          avatar_url: coach.avatarUrl || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Lỗi thêm HLV:", error);

        return {
          error: error.message,
        };
      }

      setCoaches((prev) => [mapCoach(data as CoachRow), ...prev]);

      return {
        error: null,
      };
    },
    [club?.id],
  );

  // ===================================================
  // UPDATE
  // ===================================================

  const updateCoach = useCallback(
    async (coach: Coach): Promise<CoachActionResult> => {
      if (!club?.id) {
        return {
          error: "Không xác định được CLB hiện tại.",
        };
      }

      const supabase = createClient();

      const oldCoach = coaches.find((item) => item.id === coach.id);

      const { data, error } = await supabase
        .from("coaches")
        .update({
          name: coach.name.trim(),
          phone: coach.phone.trim(),
          birth_date: formatDateForDatabase(coach.birthDate),
          gender: coach.gender,
          specialization: coach.specialization,
          join_date: formatDateForDatabase(coach.joinDate),
          status: coach.status,
          note: coach.note.trim(),
          avatar_url: coach.avatarUrl || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", coach.id)
        .eq("club_id", club.id)
        .select()
        .single();

      if (error) {
        console.error("Lỗi cập nhật HLV:", error);

        return {
          error: error.message,
        };
      }

      const updatedCoach = mapCoach(data as CoachRow);

      setCoaches((prev) =>
        prev.map((item) => (item.id === coach.id ? updatedCoach : item)),
      );

      // ---------------------------------------------
      // XÓA AVATAR CŨ NẾU ĐÃ ĐỔI ẢNH
      // ---------------------------------------------

      if (oldCoach?.avatarUrl && oldCoach.avatarUrl !== coach.avatarUrl) {
        const oldPath = getCoachAvatarPath(oldCoach.avatarUrl);

        if (oldPath) {
          const { error: removeError } = await supabase.storage
            .from("coach-avatars")
            .remove([oldPath]);

          if (removeError) {
            console.warn("Không thể xóa avatar cũ:", removeError);
          }
        }
      }

      return {
        error: null,
      };
    },
    [club?.id, coaches],
  );

  // ===================================================
  // DELETE
  // ===================================================

  const deleteCoach = useCallback(
    async (id: number): Promise<CoachActionResult> => {
      if (!club?.id) {
        return {
          error: "Không xác định được CLB hiện tại.",
        };
      }

      const supabase = createClient();

      const coach = coaches.find((item) => item.id === id);

      const { error } = await supabase
        .from("coaches")
        .delete()
        .eq("id", id)
        .eq("club_id", club.id);

      if (error) {
        console.error("Lỗi xóa HLV:", error);

        return {
          error: error.message,
        };
      }

      setCoaches((prev) => prev.filter((item) => item.id !== id));

      // ---------------------------------------------
      // XÓA AVATAR SAU KHI XÓA DB THÀNH CÔNG
      // ---------------------------------------------

      if (coach?.avatarUrl) {
        const avatarPath = getCoachAvatarPath(coach.avatarUrl);

        if (avatarPath) {
          const { error: removeError } = await supabase.storage
            .from("coach-avatars")
            .remove([avatarPath]);

          if (removeError) {
            console.warn("Không thể xóa avatar HLV:", removeError);
          }
        }
      }

      return {
        error: null,
      };
    },
    [club?.id, coaches],
  );

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <CoachContext.Provider
      value={{
        coaches,
        addCoach,
        updateCoach,
        deleteCoach,
      }}
    >
      {children}
    </CoachContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useCoaches() {
  const context = useContext(CoachContext);

  if (!context) {
    throw new Error("useCoaches phải được sử dụng bên trong CoachProvider");
  }

  return context;
}
