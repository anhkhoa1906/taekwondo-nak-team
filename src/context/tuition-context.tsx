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

export type TuitionStatus = "Đã đóng" | "Chưa đóng" | "Quá hạn";

export type TuitionRecord = {
  studentId: number;
  month: string;
  amount: number;
  dueDate: string;
  paidDate: string;
  status: TuitionStatus;
  note: string;
};

type TuitionContextType = {
  getTuition: (studentId: number, month: string) => TuitionRecord | undefined;

  saveTuition: (record: TuitionRecord) => Promise<void>;

  getAllTuition: (month: string) => TuitionRecord[];
};

type TuitionRow = {
  id: number;
  club_id: string;
  student_id: number;
  month: string;
  amount: number;
  due_date: string | null;
  paid_date: string | null;
  status: TuitionStatus;
  note: string | null;
};

const TuitionContext = createContext<TuitionContextType | undefined>(undefined);

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

function mapTuition(row: TuitionRow): TuitionRecord {
  return {
    studentId: row.student_id,
    month: row.month,
    amount: Number(row.amount),
    dueDate: formatDateForDisplay(row.due_date),
    paidDate: formatDateForDisplay(row.paid_date),
    status: row.status,
    note: row.note ?? "",
  };
}

export function TuitionProvider({ children }: { children: React.ReactNode }) {
  const { club, loading: clubLoading } = useClub();

  const [tuitionData, setTuitionData] = useState<TuitionRecord[]>([]);

  // ==========================================
  // Tải học phí của CLB hiện tại
  // ==========================================

  const loadTuition = useCallback(async () => {
    if (!club?.id) {
      setTuitionData([]);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("tuition")
      .select("*")
      .eq("club_id", club.id)
      .order("month", { ascending: false });

    if (error) {
      console.error("Lỗi tải dữ liệu học phí:", error);
      return;
    }

    setTuitionData((data as TuitionRow[]).map(mapTuition));
  }, [club?.id]);

  useEffect(() => {
    if (clubLoading) return;

    loadTuition();
  }, [clubLoading, loadTuition]);

  // ==========================================
  // Lấy học phí
  // ==========================================

  const getTuition = useCallback(
    (studentId: number, month: string) => {
      return tuitionData.find(
        (item) => item.studentId === studentId && item.month === month,
      );
    },
    [tuitionData],
  );

  // ==========================================
  // Lưu học phí
  // ==========================================

  const saveTuition = useCallback(
    async (record: TuitionRecord) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("tuition")
        .upsert(
          {
            club_id: club.id,
            student_id: record.studentId,
            month: record.month,
            amount: record.amount,
            due_date: formatDateForDatabase(record.dueDate),
            paid_date: formatDateForDatabase(record.paidDate),
            status: record.status,
            note: record.note,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "student_id,month",
          },
        )
        .select()
        .single();

      if (error) {
        console.error("Lỗi lưu học phí:", error);
        return;
      }

      const savedRecord = mapTuition(data as TuitionRow);

      setTuitionData((prev) => {
        const exists = prev.some(
          (item) =>
            item.studentId === savedRecord.studentId &&
            item.month === savedRecord.month,
        );

        if (exists) {
          return prev.map((item) =>
            item.studentId === savedRecord.studentId &&
            item.month === savedRecord.month
              ? savedRecord
              : item,
          );
        }

        return [...prev, savedRecord];
      });
    },
    [club?.id],
  );

  // ==========================================
  // Lấy toàn bộ học phí theo tháng
  // ==========================================

  const getAllTuition = useCallback(
    (month: string) => {
      return tuitionData.filter((item) => item.month === month);
    },
    [tuitionData],
  );

  return (
    <TuitionContext.Provider
      value={{
        getTuition,
        saveTuition,
        getAllTuition,
      }}
    >
      {children}
    </TuitionContext.Provider>
  );
}

export function useTuition() {
  const context = useContext(TuitionContext);

  if (!context) {
    throw new Error("useTuition phải được sử dụng bên trong TuitionProvider");
  }

  return context;
}
