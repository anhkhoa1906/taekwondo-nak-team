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

export type AttendanceStatus = "Có mặt" | "Vắng" | "Có phép";

export type AttendanceRecord = {
  status: AttendanceStatus;
  note: string;
};

type AttendanceData = Record<string, Record<number, AttendanceRecord>>;

type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  excused: number;
};

type AttendanceContextType = {
  getAttendance: (
    date: string,
    className: string,
  ) => Record<number, AttendanceRecord>;

  getTodayAttendanceSummary: () => AttendanceSummary;

  saveAttendance: (
    date: string,
    className: string,
    records: Record<number, AttendanceRecord>,
  ) => Promise<void>;
};

type AttendanceRow = {
  id: number;
  club_id: string;
  attendance_date: string;
  class_name: string;
  student_id: number;
  status: AttendanceStatus;
  note: string | null;
};

const AttendanceContext = createContext<AttendanceContextType | undefined>(
  undefined,
);

function getKey(date: string, className: string) {
  return `${date}__${className}`;
}

export function AttendanceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { club, loading: clubLoading } = useClub();

  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});

  // ==========================================
  // Tải lịch sử điểm danh của CLB hiện tại
  // ==========================================

  const loadAttendance = useCallback(async () => {
    if (!club?.id) {
      setAttendanceData({});
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .eq("club_id", club.id)
      .order("attendance_date", { ascending: false });

    if (error) {
      console.error("Lỗi tải dữ liệu điểm danh:", error);
      return;
    }

    const groupedData: AttendanceData = {};

    (data as AttendanceRow[]).forEach((row) => {
      const key = getKey(row.attendance_date, row.class_name);

      if (!groupedData[key]) {
        groupedData[key] = {};
      }

      groupedData[key][row.student_id] = {
        status: row.status,
        note: row.note ?? "",
      };
    });

    setAttendanceData(groupedData);
  }, [club?.id]);

  useEffect(() => {
    if (clubLoading) return;

    loadAttendance();
  }, [clubLoading, loadAttendance]);

  // ==========================================
  // Lấy điểm danh
  // ==========================================

  const getAttendance = useCallback(
    (date: string, className: string) => {
      const key = getKey(date, className);

      return attendanceData[key] || {};
    },
    [attendanceData],
  );

  // ==========================================
  // Lưu điểm danh
  // ==========================================

  const saveAttendance = useCallback(
    async (
      date: string,
      className: string,
      records: Record<number, AttendanceRecord>,
    ) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      /*
       * Xóa dữ liệu điểm danh cũ
       * của CLB + ngày + lớp
       */
      const { error: deleteError } = await supabase
        .from("attendance")
        .delete()
        .eq("club_id", club.id)
        .eq("attendance_date", date)
        .eq("class_name", className);

      if (deleteError) {
        console.error("Lỗi xóa dữ liệu điểm danh cũ:", deleteError);
        return;
      }

      /*
       * Tạo dữ liệu điểm danh mới
       */
      const rows = Object.entries(records).map(([studentId, record]) => ({
        club_id: club.id,
        attendance_date: date,
        class_name: className,
        student_id: Number(studentId),
        status: record.status,
        note: record.note ?? "",
      }));

      if (rows.length > 0) {
        const { error: insertError } = await supabase
          .from("attendance")
          .insert(rows);

        if (insertError) {
          console.error("Lỗi lưu dữ liệu điểm danh:", insertError);
          return;
        }
      }

      const key = getKey(date, className);

      setAttendanceData((prev) => ({
        ...prev,
        [key]: records,
      }));
    },
    [club?.id],
  );

  const getTodayAttendanceSummary = useCallback(() => {
    const today = new Date().toISOString().slice(0, 10);

    let total = 0;
    let present = 0;
    let absent = 0;
    let excused = 0;

    Object.entries(attendanceData).forEach(([key, records]) => {
      if (!key.startsWith(`${today}__`)) return;

      Object.values(records).forEach((record) => {
        total++;

        if (record.status === "Có mặt") {
          present++;
        } else if (record.status === "Vắng") {
          absent++;
        } else if (record.status === "Có phép") {
          excused++;
        }
      });
    });

    return {
      total,
      present,
      absent,
      excused,
    };
  }, [attendanceData]);

  return (
    <AttendanceContext.Provider
      value={{
        getAttendance,
        getTodayAttendanceSummary,
        saveAttendance,
      }}
    >
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);

  if (!context) {
    throw new Error(
      "useAttendance phải được sử dụng bên trong AttendanceProvider",
    );
  }

  return context;
}
