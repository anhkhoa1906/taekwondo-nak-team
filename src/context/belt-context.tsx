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

export type BeltRecord = {
  id: number;
  studentId: number;
  studentName: string;
  fromBelt: string;
  toBelt: string;
  date: string;
  coach: string;
  note: string;
};

type BeltContextType = {
  beltRecords: BeltRecord[];
  promoteStudent: (record: BeltRecord) => Promise<void>;
  getStudentBeltHistory: (studentId: number) => BeltRecord[];
};

type BeltRow = {
  id: number;
  club_id: string;
  student_id: number;
  from_belt: string | null;
  to_belt: string | null;
  promotion_date: string | null;
  coach: string | null;
  note: string | null;
  students:
    | {
        name: string;
      }
    | {
        name: string;
      }[]
    | null;
};

const BeltContext = createContext<BeltContextType | undefined>(undefined);

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

function mapBelt(row: BeltRow): BeltRecord {
  const student = Array.isArray(row.students) ? row.students[0] : row.students;

  return {
    id: row.id,
    studentId: row.student_id,
    studentName: student?.name ?? "",
    fromBelt: row.from_belt ?? "",
    toBelt: row.to_belt ?? "",
    date: formatDateForDisplay(row.promotion_date),
    coach: row.coach ?? "",
    note: row.note ?? "",
  };
}

export function BeltProvider({ children }: { children: React.ReactNode }) {
  const { club, loading: clubLoading } = useClub();

  const [beltRecords, setBeltRecords] = useState<BeltRecord[]>([]);

  // ==========================================
  // Tải lịch sử cấp đai của CLB hiện tại
  // ==========================================

  const loadBeltRecords = useCallback(async () => {
    if (!club?.id) {
      setBeltRecords([]);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("belt_history")
      .select(
        `
        *,
        students (
          name
        )
      `,
      )
      .eq("club_id", club.id)
      .order("promotion_date", { ascending: false });

    if (error) {
      console.error("Lỗi tải lịch sử cấp đai:", error);
      return;
    }

    setBeltRecords((data as BeltRow[]).map(mapBelt));
  }, [club?.id]);

  useEffect(() => {
    if (clubLoading) return;

    loadBeltRecords();
  }, [clubLoading, loadBeltRecords]);

  // ==========================================
  // Thêm lịch sử cấp đai
  // ==========================================

  const promoteStudent = useCallback(
    async (record: BeltRecord) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("belt_history")
        .insert({
          club_id: club.id,
          student_id: record.studentId,
          from_belt: record.fromBelt,
          to_belt: record.toBelt,
          promotion_date: formatDateForDatabase(record.date),
          coach: record.coach,
          note: record.note,
        })
        .select(
          `
            *,
            students (
              name
            )
          `,
        )
        .single();

      if (error) {
        console.error("Lỗi lưu lịch sử cấp đai:", error);
        return;
      }

      setBeltRecords((prev) => [mapBelt(data as BeltRow), ...prev]);
    },
    [club?.id],
  );

  // ==========================================
  // Lấy lịch sử của một học viên
  // ==========================================

  const getStudentBeltHistory = useCallback(
    (studentId: number) => {
      return beltRecords.filter((item) => item.studentId === studentId);
    },
    [beltRecords],
  );

  return (
    <BeltContext.Provider
      value={{
        beltRecords,
        promoteStudent,
        getStudentBeltHistory,
      }}
    >
      {children}
    </BeltContext.Provider>
  );
}

export function useBelt() {
  const context = useContext(BeltContext);

  if (!context) {
    throw new Error("useBelt phải được sử dụng bên trong BeltProvider");
  }

  return context;
}
