"use client";

import { createContext, useContext, useState } from "react";

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
  addStudent: (student: Student) => void;
  updateStudent: (student: Student) => void;
  deleteStudent: (id: number) => void;
};

const initialStudents: Student[] = [
  {
    id: 1,
    name: "Nguyễn Văn An",
    phone: "0901 234 567",
    birthDate: "12/05/2010",
    gender: "Nam",
    className: "Lớp A",
    belt: "Vàng",
    status: "Đang tập",
    address: "Tân Hiệp",
    joinDate: "10/01/2025",
    note: "",
  },
  {
    id: 2,
    name: "Trần Thị Bảo Ngọc",
    phone: "0902 345 678",
    birthDate: "03/08/2011",
    gender: "Nữ",
    className: "Lớp B",
    belt: "Xanh",
    status: "Đang tập",
    address: "Long Phước",
    joinDate: "15/02/2025",
    note: "",
  },
  {
    id: 3,
    name: "Lê Minh Khang",
    phone: "0903 456 789",
    birthDate: "21/11/2009",
    gender: "Nam",
    className: "Lớp A",
    belt: "Đỏ",
    status: "Hết hạn",
    address: "Phước Thái",
    joinDate: "20/03/2024",
    note: "Cần gia hạn học phí",
  },
  {
    id: 4,
    name: "Phạm Gia Hân",
    phone: "0904 567 890",
    birthDate: "17/03/2012",
    gender: "Nữ",
    className: "Lớp C",
    belt: "Trắng",
    status: "Đang tập",
    address: "Tân Thành",
    joinDate: "01/06/2025",
    note: "",
  },
  {
    id: 5,
    name: "Hoàng Anh Tuấn",
    phone: "0905 678 901",
    birthDate: "28/07/2010",
    gender: "Nam",
    className: "Lớp B",
    belt: "Xanh",
    status: "Đang tập",
    address: "Long Phước",
    joinDate: "05/04/2025",
    note: "",
  },
  {
    id: 6,
    name: "Đỗ Thị Mai",
    phone: "0906 789 012",
    birthDate: "14/01/2011",
    gender: "Nữ",
    className: "Lớp A",
    belt: "Vàng",
    status: "Hết hạn",
    address: "Tân Hiệp",
    joinDate: "12/02/2025",
    note: "",
  },
  {
    id: 7,
    name: "Nguyễn Gia Bảo",
    phone: "0907 890 123",
    birthDate: "09/09/2009",
    gender: "Nam",
    className: "Lớp C",
    belt: "Đen",
    status: "Đang tập",
    address: "Phước Thái",
    joinDate: "10/01/2024",
    note: "",
  },
  {
    id: 8,
    name: "Vũ Ngọc Trâm",
    phone: "0908 901 234",
    birthDate: "25/04/2011",
    gender: "Nữ",
    className: "Lớp B",
    belt: "Đỏ",
    status: "Đang tập",
    address: "Tân Thành",
    joinDate: "18/05/2025",
    note: "",
  },
];

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>(initialStudents);

  function addStudent(student: Student) {
    setStudents((prev) => [student, ...prev]);
  }

  function updateStudent(student: Student) {
    setStudents((prev) =>
      prev.map((item) => (item.id === student.id ? student : item)),
    );
  }

  function deleteStudent(id: number) {
    setStudents((prev) => prev.filter((item) => item.id !== id));
  }

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
