"use client";

import { createContext, useCallback, useContext, useState } from "react";

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
  promoteStudent: (record: BeltRecord) => void;
  getStudentBeltHistory: (studentId: number) => BeltRecord[];
};

const BeltContext = createContext<BeltContextType | undefined>(undefined);

export function BeltProvider({ children }: { children: React.ReactNode }) {
  const [beltRecords, setBeltRecords] = useState<BeltRecord[]>([]);

  const promoteStudent = useCallback((record: BeltRecord) => {
    setBeltRecords((prev) => [record, ...prev]);
  }, []);

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
