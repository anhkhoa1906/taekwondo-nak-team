"use client";

import { createContext, useCallback, useContext, useState } from "react";

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

  saveTuition: (record: TuitionRecord) => void;

  getAllTuition: (month: string) => TuitionRecord[];
};

const TuitionContext = createContext<TuitionContextType | undefined>(undefined);

export function TuitionProvider({ children }: { children: React.ReactNode }) {
  const [tuitionData, setTuitionData] = useState<TuitionRecord[]>([]);

  const getTuition = useCallback(
    (studentId: number, month: string) => {
      return tuitionData.find(
        (item) => item.studentId === studentId && item.month === month,
      );
    },
    [tuitionData],
  );

  const saveTuition = useCallback((record: TuitionRecord) => {
    setTuitionData((prev) => {
      const exists = prev.some(
        (item) =>
          item.studentId === record.studentId && item.month === record.month,
      );

      if (exists) {
        return prev.map((item) =>
          item.studentId === record.studentId && item.month === record.month
            ? record
            : item,
        );
      }

      return [...prev, record];
    });
  }, []);

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
