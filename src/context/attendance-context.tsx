"use client";

import { createContext, useContext, useState, useCallback } from "react";

export type AttendanceStatus = "Có mặt" | "Vắng" | "Có phép";

export type AttendanceRecord = {
  status: AttendanceStatus;
  note: string;
};

type AttendanceData = Record<string, Record<number, AttendanceRecord>>;

type AttendanceContextType = {
  getAttendance: (
    date: string,
    className: string,
  ) => Record<number, AttendanceRecord>;

  saveAttendance: (
    date: string,
    className: string,
    records: Record<number, AttendanceRecord>,
  ) => void;
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
  const [attendanceData, setAttendanceData] = useState<AttendanceData>({});

  const getAttendance = useCallback(
    (date: string, className: string) => {
      const key = getKey(date, className);

      return attendanceData[key] || {};
    },
    [attendanceData],
  );

  const saveAttendance = useCallback(
    (
      date: string,
      className: string,
      records: Record<number, AttendanceRecord>,
    ) => {
      const key = getKey(date, className);

      setAttendanceData((prev) => ({
        ...prev,
        [key]: records,
      }));
    },
    [],
  );

  return (
    <AttendanceContext.Provider
      value={{
        getAttendance,
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
