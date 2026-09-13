"use client";

import { useEffect, useMemo, useState } from "react";

import {
  useAttendance,
  type AttendanceRecord,
} from "@/context/attendance-context";
import {
  CalendarDays,
  Check,
  ClipboardCheck,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useRole } from "@/hooks/use-role";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AttendanceStatus = "Có mặt" | "Vắng" | "Có phép";

const statusOptions: AttendanceStatus[] = ["Có mặt", "Vắng", "Có phép"];

export default function DiemDanhPage() {
  const { students } = useStudents();
  const { isStaff } = useRole();

  const { getAttendance, saveAttendance } = useAttendance();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [search, setSearch] = useState("");

  const [attendance, setAttendance] = useState<
    Record<number, AttendanceRecord>
  >({});

  useEffect(() => {
    if (!selectedClass || selectedClass === "all") {
      setAttendance({});
      return;
    }

    const savedAttendance = getAttendance(selectedDate, selectedClass);

    setAttendance(savedAttendance);
  }, [selectedDate, selectedClass, getAttendance]);

  // =========================
  // DANH SÁCH LỚP
  // =========================

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((student) => student.className)
          .filter((className) => className && className !== "Chưa xếp lớp"),
      ),
    );
  }, [students]);

  // =========================
  // HỌC VIÊN TRONG LỚP
  // =========================

  const classStudents = useMemo(() => {
    return students.filter((student) => {
      const matchClass =
        selectedClass === "all" || student.className === selectedClass;

      const keyword = search.toLowerCase().trim();

      const matchSearch =
        student.name.toLowerCase().includes(keyword) ||
        student.phone.toLowerCase().includes(keyword);

      return matchClass && matchSearch;
    });
  }, [students, selectedClass, search]);

  // =========================
  // ĐỔI TRẠNG THÁI
  // =========================

  function setAttendanceStatus(studentId: number, status: AttendanceStatus) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        status,
        note: prev[studentId]?.note || "",
      },
    }));
  }

  // =========================
  // GHI CHÚ
  // =========================

  function setAttendanceNote(studentId: number, note: string) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || "Có mặt",
        note,
      },
    }));
  }

  // =========================
  // ĐIỂM DANH TẤT CẢ
  // =========================

  function handleAttendanceAll() {
    const newAttendance: Record<number, AttendanceRecord> = {};

    classStudents.forEach((student) => {
      newAttendance[student.id] = {
        status: "Có mặt",
        note: "",
      };
    });

    setAttendance((prev) => ({
      ...prev,
      ...newAttendance,
    }));
  }

  // =========================
  // THỐNG KÊ
  // =========================

  const attendanceStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let excused = 0;

    classStudents.forEach((student) => {
      const status = attendance[student.id]?.status;

      if (status === "Có mặt") {
        present++;
      }

      if (status === "Vắng") {
        absent++;
      }

      if (status === "Có phép") {
        excused++;
      }
    });

    return {
      total: classStudents.length,
      present,
      absent,
      excused,
    };
  }, [classStudents, attendance]);

  // =========================
  // LƯU
  // =========================

  function handleSaveAttendance() {
    if (!selectedClass || selectedClass === "all") {
      alert("Vui lòng chọn lớp trước khi lưu điểm danh.");
      return;
    }

    saveAttendance(selectedDate, selectedClass, attendance);

    alert("Đã lưu điểm danh.");
  }

  return (
    <div className="space-y-6">
      {/* =========================
          HEADER
      ========================= */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Điểm danh</h1>

        <p className="text-muted-foreground">
          Quản lý điểm danh học viên theo từng buổi tập
        </p>
      </div>

      {/* =========================
          FILTER
      ========================= */}

      <div className="rounded-xl border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {/* LỚP */}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Lớp học</label>

            <Select
              value={selectedClass}
              onValueChange={(value) => setSelectedClass(value ?? "")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn lớp" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Tất cả lớp</SelectItem>

                {classOptions.map((className) => (
                  <SelectItem key={className} value={className}>
                    {className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* NGÀY */}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Ngày điểm danh</label>

            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* TÌM KIẾM */}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tìm học viên</label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Tên hoặc số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          STATISTICS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Tổng học viên</p>

          <div className="mt-2 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-muted-foreground" />

            <p className="text-2xl font-bold">{attendanceStats.total}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Có mặt</p>

          <div className="mt-2 flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />

            <p className="text-2xl font-bold">{attendanceStats.present}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Vắng</p>

          <div className="mt-2 flex items-center gap-2">
            <X className="h-5 w-5 text-red-600" />

            <p className="text-2xl font-bold">{attendanceStats.absent}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Có phép</p>

          <div className="mt-2 flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-yellow-600" />

            <p className="text-2xl font-bold">{attendanceStats.excused}</p>
          </div>
        </div>
      </div>

      {/* =========================
          ACTIONS
      ========================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Danh sách điểm danh</h2>

          <p className="text-sm text-muted-foreground">
            {selectedDate}
            {selectedClass !== "all" && ` · ${selectedClass}`}
          </p>
        </div>

        <div className="flex gap-2">
          {!isStaff && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleAttendanceAll}
                disabled={classStudents.length === 0}
              >
                <Check className="mr-2 h-4 w-4" />
                Điểm danh tất cả
              </Button>

              <Button
                onClick={handleSaveAttendance}
                disabled={classStudents.length === 0}
              >
                Lưu điểm danh
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">STT</TableHead>

              <TableHead>Học viên</TableHead>

              <TableHead>Lớp</TableHead>

              <TableHead>Cấp đai</TableHead>

              <TableHead className="text-center">Trạng thái</TableHead>

              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {classStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không có học viên.
                </TableCell>
              </TableRow>
            ) : (
              classStudents.map((student, index) => {
                const currentStatus = attendance[student.id]?.status;

                return (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>

                        <p className="text-xs text-muted-foreground">
                          {student.phone}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{student.className}</TableCell>

                    <TableCell>
                      <Badge variant="secondary">{student.belt}</Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-center gap-1">
                        {statusOptions.map((status) => {
                          const active = currentStatus === status;

                          return (
                            <Button
                              key={status}
                              type="button"
                              size="sm"
                              variant={active ? "default" : "outline"}
                              disabled={isStaff}
                              onClick={() =>
                                setAttendanceStatus(student.id, status)
                              }
                            >
                              {status}
                            </Button>
                          );
                        })}
                      </div>
                    </TableCell>

                    <TableCell>
                      <Input
                        placeholder="Ghi chú..."
                        value={attendance[student.id]?.note || ""}
                        readOnly={isStaff}
                        onChange={(e) =>
                          setAttendanceNote(student.id, e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
