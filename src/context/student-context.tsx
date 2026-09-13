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
  avatarUrl: string;
};

type StudentContextType = {
  students: Student[];
  loading: boolean;

  addStudent: (student: Student) => Promise<void>;

  updateStudent: (student: Student) => Promise<void>;

  deleteStudent: (id: number) => Promise<void>;

  refreshStudents: () => Promise<void>;
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
  avatar_url: string | null;
};

// =====================================================
// DATE
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
    avatarUrl: row.avatar_url ?? "",
  };
}

// =====================================================
// CONTEXT
// =====================================================

const StudentContext = createContext<StudentContextType | undefined>(undefined);

// =====================================================
// PROVIDER
// =====================================================

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const { club, loading: clubLoading } = useClub();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // ===================================================
  // LOAD STUDENTS
  // ===================================================

  const loadStudents = useCallback(async () => {
    const clubId = club?.id;

    if (!clubId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const supabase = createClient();

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("club_id", clubId)
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error("Lỗi tải danh sách học viên:", error);

      setStudents([]);
      setLoading(false);
      return;
    }

    const mappedStudents = (data as StudentRow[]).map(mapStudent);

    setStudents(mappedStudents);

    setLoading(false);
  }, [club?.id]);

  // ===================================================
  // LOAD KHI ĐỔI CLB
  // ===================================================

  useEffect(() => {
    if (clubLoading) {
      return;
    }

    setStudents([]);

    if (!club?.id) {
      setLoading(false);
      return;
    }

    loadStudents();
  }, [club?.id, clubLoading, loadStudents]);

  // ===================================================
  // CLUB CHANGED
  // ===================================================

  useEffect(() => {
    function handleClubChanged() {
      console.log("🔄 StudentProvider: CLB đã thay đổi, tải lại học viên...");

      loadStudents();
    }

    window.addEventListener("club-changed", handleClubChanged);

    return () => {
      window.removeEventListener("club-changed", handleClubChanged);
    };
  }, [loadStudents]);

  // ===================================================
  // ADD STUDENT
  // ===================================================

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
          avatar_url: student.avatarUrl || null,
        })
        .select()
        .single();

      if (error) {
        console.error("Lỗi thêm học viên:", error);
        return;
      }

      const newStudent = mapStudent(data as StudentRow);

      setStudents((prev) => [...prev, newStudent]);
    },
    [club?.id],
  );

  // ===================================================
  // UPDATE STUDENT
  // ===================================================

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
          avatar_url: student.avatarUrl || null,
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

      const updatedStudent = mapStudent(data as StudentRow);

      setStudents((prev) =>
        prev.map((item) => (item.id === student.id ? updatedStudent : item)),
      );
    },
    [club?.id],
  );

  // ===================================================
  // DELETE STUDENT
  // ===================================================

  const deleteStudent = useCallback(
    async (id: number) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const student = students.find((item) => item.id === id);

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

      // Xóa avatar khỏi Storage nếu có
      if (student?.avatarUrl) {
        const marker = "/student-avatars/";

        const index = student.avatarUrl.indexOf(marker);

        if (index !== -1) {
          const filePath = decodeURIComponent(
            student.avatarUrl.substring(index + marker.length),
          );

          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from("student-avatars")
              .remove([filePath]);

            if (storageError) {
              console.warn("Không thể xóa avatar cũ:", storageError);
            }
          }
        }
      }

      setStudents((prev) => prev.filter((item) => item.id !== id));
    },
    [club?.id, students],
  );

  // ===================================================
  // PROVIDER
  // ===================================================

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        addStudent,
        updateStudent,
        deleteStudent,
        refreshStudents: loadStudents,
      }}
    >
      {children}
    </StudentContext.Provider>
  );
}

// =====================================================
// HOOK
// =====================================================

export function useStudents() {
  const context = useContext(StudentContext);

  if (!context) {
    throw new Error("useStudents phải được sử dụng bên trong StudentProvider");
  }

  return context;
}
