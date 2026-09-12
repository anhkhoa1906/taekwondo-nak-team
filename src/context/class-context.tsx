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

export type ClassItem = {
  id: number;
  name: string;
  coach: string;
  schedule: string;
  time: string;
  status: string;
  note: string;
};

type ClassContextType = {
  classes: ClassItem[];
  addClass: (classItem: ClassItem) => Promise<void>;
  updateClass: (classItem: ClassItem) => Promise<void>;
  deleteClass: (id: number) => Promise<void>;
};

type ClassRow = {
  id: number;
  club_id: string;
  name: string;
  coach: string | null;
  schedule: string | null;
  time: string | null;
  status: string | null;
  note: string | null;
};

const ClassContext = createContext<ClassContextType | undefined>(undefined);

function mapClass(row: ClassRow): ClassItem {
  return {
    id: row.id,
    name: row.name,
    coach: row.coach ?? "",
    schedule: row.schedule ?? "",
    time: row.time ?? "",
    status: row.status ?? "",
    note: row.note ?? "",
  };
}

export function ClassProvider({ children }: { children: React.ReactNode }) {
  const { club, loading: clubLoading } = useClub();

  const [classes, setClasses] = useState<ClassItem[]>([]);

  const loadClasses = useCallback(async () => {
    if (!club?.id) {
      setClasses([]);
      return;
    }

    const supabase = createClient();

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("club_id", club.id)
      .order("id", { ascending: true });

    if (error) {
      console.error("Lỗi tải danh sách lớp học:", error);
      return;
    }

    setClasses((data as ClassRow[]).map(mapClass));
  }, [club?.id]);

  useEffect(() => {
    if (clubLoading) return;

    loadClasses();
  }, [clubLoading, loadClasses]);

  const addClass = useCallback(
    async (classItem: ClassItem) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("classes")
        .insert({
          club_id: club.id,
          name: classItem.name,
          coach: classItem.coach,
          schedule: classItem.schedule,
          time: classItem.time,
          status: classItem.status,
          note: classItem.note,
        })
        .select()
        .single();

      if (error) {
        console.error("Lỗi thêm lớp học:", error);
        return;
      }

      setClasses((prev) => [mapClass(data as ClassRow), ...prev]);
    },
    [club?.id],
  );

  const updateClass = useCallback(
    async (classItem: ClassItem) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { data, error } = await supabase
        .from("classes")
        .update({
          name: classItem.name,
          coach: classItem.coach,
          schedule: classItem.schedule,
          time: classItem.time,
          status: classItem.status,
          note: classItem.note,
          updated_at: new Date().toISOString(),
        })
        .eq("id", classItem.id)
        .eq("club_id", club.id)
        .select()
        .single();

      if (error) {
        console.error("Lỗi cập nhật lớp học:", error);
        return;
      }

      setClasses((prev) =>
        prev.map((item) =>
          item.id === classItem.id ? mapClass(data as ClassRow) : item,
        ),
      );
    },
    [club?.id],
  );

  const deleteClass = useCallback(
    async (id: number) => {
      if (!club?.id) {
        console.error("Không xác định được CLB hiện tại.");
        return;
      }

      const supabase = createClient();

      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", id)
        .eq("club_id", club.id);

      if (error) {
        console.error("Lỗi xóa lớp học:", error);
        return;
      }

      setClasses((prev) => prev.filter((item) => item.id !== id));
    },
    [club?.id],
  );

  return (
    <ClassContext.Provider
      value={{
        classes,
        addClass,
        updateClass,
        deleteClass,
      }}
    >
      {children}
    </ClassContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassContext);

  if (!context) {
    throw new Error("useClasses phải được sử dụng bên trong ClassProvider");
  }

  return context;
}
