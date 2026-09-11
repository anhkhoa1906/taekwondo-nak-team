"use client";

import { createContext, useCallback, useContext, useState } from "react";

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
  addCoach: (coach: Coach) => void;
  updateCoach: (coach: Coach) => void;
  deleteCoach: (id: number) => void;
};

const initialCoaches: Coach[] = [
  {
    id: 1,
    name: "Nguyễn Anh Khoa",
    phone: "0901234567",
    birthDate: "15/03/2001",
    gender: "Nam",
    specialization: "Taekwondo",
    joinDate: "01/01/2023",
    status: "Đang hoạt động",
    note: "",
  },
  {
    id: 2,
    name: "Trần Minh Đức",
    phone: "0912345678",
    birthDate: "20/08/1998",
    gender: "Nam",
    specialization: "Taekwondo",
    joinDate: "10/02/2023",
    status: "Đang hoạt động",
    note: "",
  },
  {
    id: 3,
    name: "Lê Hoàng Nam",
    phone: "0923456789",
    birthDate: "12/11/1995",
    gender: "Nam",
    specialization: "Taekwondo",
    joinDate: "05/03/2024",
    status: "Đang hoạt động",
    note: "",
  },
];

const CoachContext = createContext<CoachContextType | undefined>(undefined);

export function CoachProvider({ children }: { children: React.ReactNode }) {
  const [coaches, setCoaches] = useState<Coach[]>(initialCoaches);

  const addCoach = useCallback((coach: Coach) => {
    setCoaches((prev) => [coach, ...prev]);
  }, []);

  const updateCoach = useCallback((coach: Coach) => {
    setCoaches((prev) =>
      prev.map((item) => (item.id === coach.id ? coach : item)),
    );
  }, []);

  const deleteCoach = useCallback((id: number) => {
    setCoaches((prev) => prev.filter((item) => item.id !== id));
  }, []);

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
