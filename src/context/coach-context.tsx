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
};

type CoachContextType = {
  coaches: Coach[];
  addCoach: (coach: Coach) => Promise<void>;
  updateCoach: (coach: Coach) => Promise<void>;
  deleteCoach: (id: number) => Promise<void>;
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
};

const CoachContext = createContext<CoachContextType | undefined>(undefined);

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

  // DD/MM/YYYY -> YYYY-MM-DD
  const parts = date.split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // YYYY-MM-DD
  return date;
}

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
  };
}

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const { club, loading: clubLoading } = useClub();

  const [coaches, setCoaches] = useState<Coach[]>([]);

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
      .order("id", { ascending: true });

    if (error) {
      console.error("Lỗi tải danh sách HLV:", error);
      return;
    }

    setCoaches((data as CoachRow[]).map(mapCoach));
  }, [club?.id]);

  useEffect(() => {
    if (clubLoading) return;

    loadCoaches();
  }, [clubLoading, loadCoaches]);

  const addCoach = useCallback(
    async (coach: Coach) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("coaches")
        .insert({
          club_id: club.id,
          name: coach.name,
          phone: coach.phone,
          birth_date: formatDateForDatabase(coach.birthDate),
          gender: coach.gender,
          specialization: coach.specialization,
          join_date: formatDateForDatabase(coach.joinDate),
          status: coach.status,
          note: coach.note,
        })
        .select()
        .single();

      if (error) {
        console.error("Lỗi thêm HLV:", error);
        return;
      }

      setCoaches((prev) => [mapCoach(data as CoachRow), ...prev]);
    },
    [club?.id],
  );

  const updateCoach = useCallback(
    async (coach: Coach) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("coaches")
        .update({
          name: coach.name,
          phone: coach.phone,
          birth_date: formatDateForDatabase(coach.birthDate),
          gender: coach.gender,
          specialization: coach.specialization,
          join_date: formatDateForDatabase(coach.joinDate),
          status: coach.status,
          note: coach.note,
          updated_at: new Date().toISOString(),
        })
        .eq("id", coach.id)
        .eq("club_id", club.id)
        .select()
        .single();

      if (error) {
        console.error("Lỗi cập nhật HLV:", error);
        return;
      }

      setCoaches((prev) =>
        prev.map((item) =>
          item.id === coach.id ? mapCoach(data as CoachRow) : item,
        ),
      );
    },
    [club?.id],
  );

  const deleteCoach = useCallback(
    async (id: number) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { error } = await supabase
        .from("coaches")
        .delete()
        .eq("id", id)
        .eq("club_id", club.id);

      if (error) {
        console.error("Lỗi xóa HLV:", error);
        return;
      }

      setCoaches((prev) => prev.filter((item) => item.id !== id));
    },
    [club?.id],
  );

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

export function useCoaches() {
  const context = useContext(CoachContext);

  if (!context) {
    throw new Error("useCoaches phải được sử dụng bên trong CoachProvider");
  }

  return context;
}
