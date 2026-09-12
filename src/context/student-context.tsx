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

export type Student = {
  id: number;
  name: string;
  phone: string;
  birthDate: string;
  gender: string;
  className: string;
  belt: string;
  status: string;
  address: string;
  joinDate: string;
  note: string;
};

type StudentContextType = {
  students: Student[];
  addStudent: (student: Student) => Promise<void>;
  updateStudent: (student: Student) => Promise<void>;
  deleteStudent: (id: number) => Promise<void>;
};

type StudentRow = {
  id: number;
  club_id: string;
  name: string;
  phone: string | null;
  birth_date: string | null;
  gender: string | null;
  class_name: string | null;
  belt: string | null;
  status: string | null;
  address: string | null;
  join_date: string | null;
  note: string | null;
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

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

function mapStudent(row: StudentRow): Student {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? "",
    birthDate: formatDateForDisplay(row.birth_date),
    gender: row.gender ?? "",
    className: row.class_name ?? "",
    belt: row.belt ?? "",
    status: row.status ?? "",
    address: row.address ?? "",
    joinDate: formatDateForDisplay(row.join_date),
    note: row.note ?? "",
  };
}

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const { club, loading: clubLoading } = useClub();

  const [students, setStudents] = useState<Student[]>([]);

  const loadStudents = useCallback(async () => {
    if (!club?.id) {
      setStudents([]);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("club_id", club.id)
      .order("id", { ascending: true });

    if (error) {
      console.error("Lỗi tải danh sách học viên:", error);
      return;
    }

    setStudents((data as StudentRow[]).map(mapStudent));
  }, [club?.id]);

  useEffect(() => {
    if (clubLoading) return;

    loadStudents();
  }, [clubLoading, loadStudents]);

  const addStudent = useCallback(
    async (student: Student) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("students")
        .insert({
          club_id: club.id,
          name: student.name,
          phone: student.phone,
          birth_date: formatDateForDatabase(student.birthDate),
          gender: student.gender,
          class_name: student.className,
          belt: student.belt,
          status: student.status,
          address: student.address,
          join_date: formatDateForDatabase(student.joinDate),
          note: student.note,
        })
        .select()
        .single();

      if (error) {
        console.error("Lỗi thêm học viên:", error);
        return;
      }

      setStudents((prev) => [mapStudent(data as StudentRow), ...prev]);
    },
    [club?.id],
  );

  const updateStudent = useCallback(
    async (student: Student) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("students")
        .update({
          name: student.name,
          phone: student.phone,
          birth_date: formatDateForDatabase(student.birthDate),
          gender: student.gender,
          class_name: student.className,
          belt: student.belt,
          status: student.status,
          address: student.address,
          join_date: formatDateForDatabase(student.joinDate),
          note: student.note,
          updated_at: new Date().toISOString(),
        })
        .eq("id", student.id)
        .eq("club_id", club.id)
        .select()
        .single();

      if (error) {
        console.error("Lỗi cập nhật học viên:", error);
        return;
      }

      setStudents((prev) =>
        prev.map((item) =>
          item.id === student.id ? mapStudent(data as StudentRow) : item,
        ),
      );
    },
    [club?.id],
  );

  const deleteStudent = useCallback(
    async (id: number) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", id)
        .eq("club_id", club.id);

      if (error) {
        console.error("Lỗi xóa học viên:", error);
        return;
      }

      setStudents((prev) => prev.filter((item) => item.id !== id));
    },
    [club?.id],
  );

  return (
    <StudentContext.Provider
      value={{
        students,
        addStudent,
        updateStudent,
        deleteStudent,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

export function useStudents() {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error("useStudents phải được sử dụng bên trong StudentProvider");
  }

  return context;
}
