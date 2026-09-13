"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useAttendance,
  type AttendanceRecord,
} from "@/context/attendance-context";
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

function formatDate(date: string) {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

function getStatusStyle(status?: AttendanceStatus) {
  switch (status) {
    case "Có mặt":
      return {
        badge:
          "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50",
        dot: "bg-emerald-500",
      };

    case "Vắng":
      return {
        badge: "border-red-200 bg-red-50 text-red-700 hover:bg-red-50",
        dot: "bg-red-500",
      };

    case "Có phép":
      return {
        badge: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50",
        dot: "bg-amber-500",
      };

    default:
      return {
        badge: "border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-50",
        dot: "bg-slate-400",
      };
  }
}

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

  /*
   * =========================
   * DANH SÁCH LỚP
   * =========================
   */

  const classOptions = useMemo(() => {
    return Array.from(
      new Set(
        students
          .map((student) => student.className)
          .filter((className) => className && className !== "Chưa xếp lớp"),
      ),
    );
  }, [students]);

  /*
   * =========================
   * HỌC VIÊN TRONG LỚP
   * =========================
   */

  const classStudents = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return students.filter((student) => {
      const matchClass =
        selectedClass === "all"
          ? true
          : selectedClass
            ? student.className === selectedClass
            : false;

      const matchSearch =
        !keyword ||
        student.name.toLowerCase().includes(keyword) ||
        student.phone.toLowerCase().includes(keyword);

      return matchClass && matchSearch;
    });
  }, [students, selectedClass, search]);

  /*
   * =========================
   * LOAD ĐIỂM DANH
   * =========================
   */

  useEffect(() => {
    if (!selectedClass || selectedClass === "all") {
      setAttendance({});
      return;
    }

    const savedAttendance = getAttendance(selectedDate, selectedClass);

    setAttendance(savedAttendance);
  }, [selectedDate, selectedClass, getAttendance]);

  /*
   * =========================
   * ĐỔI TRẠNG THÁI
   * =========================
   */

  function setAttendanceStatus(studentId: number, status: AttendanceStatus) {
    if (isStaff) return;

    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        status,
        note: prev[studentId]?.note || "",
      },
    }));
  }

  /*
   * =========================
   * GHI CHÚ
   * =========================
   */

  function setAttendanceNote(studentId: number, note: string) {
    if (isStaff) return;

    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || "Có mặt",
        note,
      },
    }));
  }

  /*
   * =========================
   * ĐIỂM DANH TẤT CẢ
   * =========================
   */

  function handleAttendanceAll() {
    if (isStaff || !selectedClass || selectedClass === "all") {
      return;
    }

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

  /*
   * =========================
   * THỐNG KÊ
   * =========================
   */

  const attendanceStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let excused = 0;
    let notMarked = 0;

    classStudents.forEach((student) => {
      const status = attendance[student.id]?.status;

      if (status === "Có mặt") {
        present++;
      } else if (status === "Vắng") {
        absent++;
      } else if (status === "Có phép") {
        excused++;
      } else {
        notMarked++;
      }
    });

    return {
      total: classStudents.length,
      present,
      absent,
      excused,
      notMarked,
    };
  }, [classStudents, attendance]);

  /*
   * =========================
   * TỶ LỆ CÓ MẶT
   * =========================
   */

  const attendanceRate = useMemo(() => {
    if (attendanceStats.total === 0) {
      return 0;
    }

    return Math.round((attendanceStats.present / attendanceStats.total) * 100);
  }, [attendanceStats]);

  /*
   * =========================
   * LƯU
   * =========================
   */

  async function handleSaveAttendance() {
    if (!selectedClass || selectedClass === "all") {
      alert("Vui lòng chọn một lớp trước khi lưu điểm danh.");
      return;
    }

    try {
      await saveAttendance(selectedDate, selectedClass, attendance);

      alert("Đã lưu điểm danh thành công.");
    } catch (error) {
      console.error(error);
      alert("Không thể lưu điểm danh. Vui lòng thử lại.");
    }
  }

  /*
   * =========================
   * RENDER
   * =========================
   */

  return (
    <div className="space-y-6">
      {/* =========================
          HERO
      ========================= */}

      <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-sm md:p-8">
        <div className="relative z-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                <ClipboardCheck className="h-3.5 w-3.5" />
                Quản lý điểm danh
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Điểm danh học viên
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                Theo dõi tình hình tham gia tập luyện của học viên theo từng lớp
                và từng buổi tập.
              </p>
            </div>

            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 md:flex">
              <ClipboardCheck className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/5" />
        <div className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-white/5" />
      </div>

      {/* =========================
          FILTER
      ========================= */}

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-5">
          <h2 className="font-semibold text-slate-900">Bộ lọc điểm danh</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Chọn lớp và ngày để xem danh sách học viên.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* LỚP */}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Lớp học</label>

            <Select
              value={selectedClass}
              onValueChange={(value) => setSelectedClass(value ?? "")}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder="Chọn lớp học" />
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
                className="h-11 pl-9"
              />
            </div>
          </div>

          {/* SEARCH */}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tìm học viên</label>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Tên hoặc số điện thoại..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-11 pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          STATS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL */}

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng học viên</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {attendanceStats.total}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Trong lớp đã chọn
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        {/* PRESENT */}

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Có mặt</p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {attendanceStats.present}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Tỷ lệ {attendanceRate}%
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        {/* ABSENT */}

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Vắng</p>

              <p className="mt-2 text-3xl font-bold text-red-600">
                {attendanceStats.absent}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">Không có mặt</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50">
              <X className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </div>

        {/* EXCUSED */}

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Có phép</p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {attendanceStats.excused}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Nghỉ có lý do
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Clock3 className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          NOTICE
      ========================= */}

      {!selectedClass && (
        <div className="rounded-2xl border border-dashed bg-slate-50 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
            <ClipboardCheck className="h-7 w-7 text-slate-500" />
          </div>

          <h3 className="mt-4 font-semibold text-slate-900">Chưa chọn lớp</h3>

          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Vui lòng chọn một lớp học phía trên để bắt đầu điểm danh.
          </p>
        </div>
      )}

      {selectedClass === "all" && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100">
              <ClipboardCheck className="h-4 w-4 text-amber-700" />
            </div>

            <div>
              <p className="font-medium text-amber-900">
                Chế độ xem tất cả lớp
              </p>

              <p className="mt-1 text-sm text-amber-700">
                Bạn đang xem học viên của tất cả lớp. Hãy chọn một lớp cụ thể để
                thực hiện và lưu điểm danh.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          ACTION HEADER
      ========================= */}

      {selectedClass && (
        <div className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                Danh sách điểm danh
              </h2>

              {selectedClass !== "all" && (
                <Badge variant="secondary">{selectedClass}</Badge>
              )}
            </div>

            <p className="mt-1 text-sm text-muted-foreground">
              Ngày {formatDate(selectedDate)}
              {" · "}
              {attendanceStats.total} học viên
              {attendanceStats.notMarked > 0 &&
                ` · ${attendanceStats.notMarked} chưa điểm danh`}
            </p>
          </div>

          {!isStaff && selectedClass !== "all" && (
            <div className="flex flex-col gap-2 sm:flex-row">
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
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Lưu điểm danh
              </Button>
            </div>
          )}
        </div>
      )}

      {/* =========================
          TABLE
      ========================= */}

      {selectedClass && (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-50">
                  <TableHead className="w-[60px]">STT</TableHead>

                  <TableHead className="min-w-[220px]">Học viên</TableHead>

                  <TableHead className="min-w-[120px]">Lớp</TableHead>

                  <TableHead className="min-w-[130px]">Cấp đai</TableHead>

                  <TableHead className="min-w-[300px] text-center">
                    Trạng thái
                  </TableHead>

                  <TableHead className="min-w-[220px]">Ghi chú</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {classStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                          <UserRound className="h-6 w-6 text-slate-400" />
                        </div>

                        <p className="mt-3 font-medium text-slate-700">
                          Không có học viên
                        </p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          Không tìm thấy học viên phù hợp với bộ lọc hiện tại.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  classStudents.map((student, index) => {
                    const currentStatus = attendance[student.id]?.status;

                    const statusStyle = getStatusStyle(currentStatus);

                    return (
                      <TableRow
                        key={student.id}
                        className="hover:bg-slate-50/70"
                      >
                        {/* STT */}

                        <TableCell className="font-medium text-muted-foreground">
                          {index + 1}
                        </TableCell>

                        {/* STUDENT */}

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                              <UserRound className="h-5 w-5 text-slate-500" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {student.name}
                              </p>

                              <p className="truncate text-xs text-muted-foreground">
                                {student.phone || "Chưa có SĐT"}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        {/* CLASS */}

                        <TableCell>
                          <span className="text-sm font-medium">
                            {student.className || "Chưa xếp lớp"}
                          </span>
                        </TableCell>

                        {/* BELT */}

                        <TableCell>
                          <Badge variant="secondary" className="font-medium">
                            {student.belt}
                          </Badge>
                        </TableCell>

                        {/* STATUS */}

                        <TableCell>
                          <div className="flex flex-wrap justify-center gap-2">
                            {statusOptions.map((status) => {
                              const active = currentStatus === status;

                              const style = getStatusStyle(status);

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
                                  className={
                                    active
                                      ? "min-w-[86px]"
                                      : "min-w-[86px] text-muted-foreground"
                                  }
                                >
                                  {status === "Có mặt" && (
                                    <Check className="mr-1.5 h-3.5 w-3.5" />
                                  )}

                                  {status === "Vắng" && (
                                    <X className="mr-1.5 h-3.5 w-3.5" />
                                  )}

                                  {status === "Có phép" && (
                                    <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                                  )}

                                  {status}
                                </Button>
                              );
                            })}
                          </div>

                          <div className="mt-2 flex justify-center">
                            <Badge
                              variant="outline"
                              className={statusStyle.badge}
                            >
                              <span
                                className={`mr-1.5 h-1.5 w-1.5 rounded-full ${statusStyle.dot}`}
                              />

                              {currentStatus || "Chưa điểm danh"}
                            </Badge>
                          </div>
                        </TableCell>

                        {/* NOTE */}

                        <TableCell>
                          <Input
                            placeholder="Nhập ghi chú..."
                            value={attendance[student.id]?.note || ""}
                            readOnly={isStaff}
                            onChange={(e) =>
                              setAttendanceNote(student.id, e.target.value)
                            }
                            className="h-9"
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
      )}

      {/* =========================
          FOOTER SUMMARY
      ========================= */}

      {selectedClass && classStudents.length > 0 && (
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-semibold text-slate-900">Tổng quan buổi tập</p>

              <p className="mt-1 text-sm text-muted-foreground">
                Ngày {formatDate(selectedDate)}
                {selectedClass !== "all" && ` · ${selectedClass}`}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 px-4 py-3 text-center">
                <p className="text-xs text-muted-foreground">Tổng</p>

                <p className="mt-1 font-bold text-slate-900">
                  {attendanceStats.total}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-center">
                <p className="text-xs text-emerald-700">Có mặt</p>

                <p className="mt-1 font-bold text-emerald-700">
                  {attendanceStats.present}
                </p>
              </div>

              <div className="rounded-xl bg-red-50 px-4 py-3 text-center">
                <p className="text-xs text-red-700">Vắng</p>

                <p className="mt-1 font-bold text-red-700">
                  {attendanceStats.absent}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 px-4 py-3 text-center">
                <p className="text-xs text-amber-700">Có phép</p>

                <p className="mt-1 font-bold text-amber-700">
                  {attendanceStats.excused}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
