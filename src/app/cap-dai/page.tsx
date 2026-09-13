"use client";

import { useMemo, useState } from "react";
import {
  Award,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  History,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useRole } from "@/hooks/use-role";
import { BELT_LEVELS, BELT_NAMES, useBelt } from "@/context/belt-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const beltOrder: string[] = [...BELT_NAMES];

function getBeltClass(belt: string) {
  switch (belt) {
    case "Trắng":
      return "border-slate-300 bg-slate-50 text-slate-700";

    case "Trắng 1 vạch":
      return "border-slate-300 bg-slate-100 text-slate-700";

    case "Trắng 2 vạch":
      return "border-slate-300 bg-slate-200 text-slate-700";

    case "Vàng":
      return "border-yellow-300 bg-yellow-100 text-yellow-700";

    case "Xanh lá":
      return "border-green-300 bg-green-100 text-green-700";

    case "Xanh dương":
      return "border-blue-300 bg-blue-100 text-blue-700";

    case "Đỏ cấp 4":
      return "border-red-300 bg-red-100 text-red-700";

    case "Đỏ cấp 3":
      return "border-red-400 bg-red-200 text-red-700";

    case "Đỏ cấp 2":
      return "border-red-500 bg-red-300 text-red-800";

    case "Đỏ cấp 1":
      return "border-red-600 bg-red-400 text-red-900";

    case "Đen":
      return "border-slate-800 bg-slate-800 text-white";

    default:
      return "border-slate-200 bg-slate-50 text-slate-600";
  }
}

function getBeltColor(belt: string) {
  return BELT_LEVELS.find((item) => item.name === belt)?.color ?? "#CBD5E1";
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function formatDate(date: string) {
  if (!date) return "";

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return date;
  }

  return `${day}/${month}/${year}`;
}

export default function CapDaiPage() {
  const { students, updateStudent } = useStudents();
  const { isStaff } = useRole();

  const { beltRecords, promoteStudent, getStudentBeltHistory } = useBelt();

  const [search, setSearch] = useState("");
  const [beltFilter, setBeltFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );

  const [newBelt, setNewBelt] = useState("");
  const [promotionDate, setPromotionDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [coach, setCoach] = useState("");
  const [note, setNote] = useState("");

  const selectedStudent = students.find(
    (student) => student.id === selectedStudentId,
  );

  /*
   * =========================
   * STATS
   * =========================
   */

  const stats = useMemo(() => {
    const total = students.length;

    const white = students.filter((student) =>
      ["Trắng", "Trắng 1 vạch", "Trắng 2 vạch"].includes(student.belt),
    ).length;

    const color = students.filter((student) =>
      [
        "Vàng",
        "Xanh lá",
        "Xanh dương",
        "Đỏ cấp 4",
        "Đỏ cấp 3",
        "Đỏ cấp 2",
        "Đỏ cấp 1",
      ].includes(student.belt),
    ).length;

    const black = students.filter((student) => student.belt === "Đen").length;

    return {
      total,
      white,
      color,
      black,
    };
  }, [students]);

  /*
   * =========================
   * FILTER
   * =========================
   */

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !keyword ||
        student.name.toLowerCase().includes(keyword) ||
        String(student.phone ?? "")
          .toLowerCase()
          .includes(keyword);

      const matchesBelt = beltFilter === "all" || student.belt === beltFilter;

      return matchesSearch && matchesBelt;
    });
  }, [students, search, beltFilter]);

  /*
   * =========================
   * OPEN PROMOTION
   * =========================
   */

  function handleOpenPromotion(studentId: number) {
    const student = students.find((item) => item.id === studentId);

    if (!student) return;

    setSelectedStudentId(studentId);

    const currentIndex = beltOrder.indexOf(student.belt);

    const nextBelt =
      currentIndex >= 0 && currentIndex < beltOrder.length - 1
        ? beltOrder[currentIndex + 1]
        : "";

    setNewBelt(nextBelt);

    setPromotionDate(new Date().toISOString().split("T")[0]);

    setCoach("");
    setNote("");

    setOpen(true);
  }

  /*
   * =========================
   * PROMOTE
   * =========================
   */

  function handlePromote() {
    if (!selectedStudent) return;

    if (!newBelt) {
      alert("Vui lòng chọn cấp đai mới.");
      return;
    }

    const currentIndex = beltOrder.indexOf(selectedStudent.belt);

    const newIndex = beltOrder.indexOf(newBelt);

    if (currentIndex < 0 || newIndex !== currentIndex + 1) {
      alert("Học viên chỉ được thăng lên cấp đai kế tiếp.");
      return;
    }

    const record = {
      id: Date.now(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      fromBelt: selectedStudent.belt,
      toBelt: newBelt,
      date: promotionDate,
      coach: coach.trim(),
      note: note.trim(),
    };

    promoteStudent(record);

    updateStudent({
      ...selectedStudent,
      belt: newBelt,
    });

    setOpen(false);

    alert(`Đã thăng đai cho ${selectedStudent.name} lên đai ${newBelt}.`);
  }

  /*
   * =========================
   * HISTORY
   * =========================
   */

  function handleOpenHistory(studentId: number) {
    setSelectedStudentId(studentId);
    setHistoryOpen(true);
  }

  const history = selectedStudent
    ? getStudentBeltHistory(selectedStudent.id)
    : [];

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
                <Award className="h-3.5 w-3.5" />
                Quản lý cấp đai
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Cấp đai
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                Quản lý cấp đai, thăng đai và lịch sử phát triển của học viên.
              </p>
            </div>

            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 md:flex">
              <Award className="h-10 w-10" />
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/5" />

        <div className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-white/5" />
      </div>

      {/* =========================
          STATS
      ========================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng học viên</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.total}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Tất cả cấp đai
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <Users className="h-5 w-5 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Đai trắng</p>

              <p className="mt-2 text-3xl font-bold text-slate-700">
                {stats.white}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">3 cấp đầu</p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <ShieldCheck className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Đai màu</p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {stats.color}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Từ vàng đến đỏ cấp 1
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Award className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Đai đen</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.black}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Đã hoàn thành hệ thống đai
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <Award className="h-5 w-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* =========================
          FILTER
      ========================= */}

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">Tìm kiếm & bộ lọc</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tìm học viên theo tên, số điện thoại hoặc cấp đai.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm học viên hoặc số điện thoại..."
              className="h-11 pl-9"
            />
          </div>

          <Select
            value={beltFilter}
            onValueChange={(value) => setBeltFilter(value ?? "all")}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Lọc cấp đai" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả cấp đai</SelectItem>

              {BELT_NAMES.map((belt) => (
                <SelectItem key={belt} value={belt}>
                  Đai {belt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* =========================
          TABLE HEADER
      ========================= */}

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">Danh sách cấp đai</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Hiển thị {filteredStudents.length} / {students.length} học viên
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="h-4 w-4" />
          {beltRecords.length} lần thăng đai
        </div>
      </div>

      {/* =========================
          TABLE
      ========================= */}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[60px]">STT</TableHead>

                <TableHead className="min-w-[230px]">Học viên</TableHead>

                <TableHead className="min-w-[160px]">Lớp học</TableHead>

                <TableHead className="min-w-[170px]">
                  Cấp đai hiện tại
                </TableHead>

                <TableHead className="min-w-[160px]">Trạng thái</TableHead>

                <TableHead className="min-w-[210px] text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => {
                  const currentIndex = beltOrder.indexOf(student.belt);

                  const isBlackBelt = student.belt === "Đen";

                  const nextBelt =
                    currentIndex >= 0 && currentIndex < beltOrder.length - 1
                      ? beltOrder[currentIndex + 1]
                      : "";

                  return (
                    <TableRow key={student.id} className="hover:bg-slate-50/70">
                      {/* STT */}

                      <TableCell className="font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>

                      {/* STUDENT */}

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                            {getInitials(student.name)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-900">
                              {student.name}
                            </p>

                            <p className="truncate text-xs text-muted-foreground">
                              {student.phone}
                            </p>
                          </div>
                        </div>
                      </TableCell>

                      {/* CLASS */}

                      <TableCell>
                        <span className="text-sm font-medium text-slate-700">
                          {student.className || "Chưa xếp lớp"}
                        </span>
                      </TableCell>

                      {/* BELT */}

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span
                            className="h-4 w-4 rounded-full border shadow-sm"
                            style={{
                              backgroundColor: getBeltColor(student.belt),
                            }}
                          />

                          <Badge
                            variant="outline"
                            className={getBeltClass(student.belt)}
                          >
                            {student.belt}
                          </Badge>
                        </div>
                      </TableCell>

                      {/* STATUS */}

                      <TableCell>
                        {isBlackBelt ? (
                          <Badge className="gap-1.5 bg-slate-900 text-white hover:bg-slate-900">
                            <Check className="h-3 w-3" />
                            Hoàn thành
                          </Badge>
                        ) : (
                          <div className="space-y-1">
                            <Badge
                              variant="outline"
                              className="border-blue-200 bg-blue-50 text-blue-700"
                            >
                              Có thể thăng đai
                            </Badge>

                            {nextBelt && (
                              <p className="text-xs text-muted-foreground">
                                Tiếp theo: <strong>{nextBelt}</strong>
                              </p>
                            )}
                          </div>
                        )}
                      </TableCell>

                      {/* ACTION */}

                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenHistory(student.id)}
                          >
                            <Eye className="mr-1.5 h-4 w-4" />
                            Lịch sử
                          </Button>

                          {!isBlackBelt && !isStaff && (
                            <Button
                              size="sm"
                              onClick={() => handleOpenPromotion(student.id)}
                            >
                              <ShieldCheck className="mr-1.5 h-4 w-4" />
                              Thăng đai
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                        <Award className="h-6 w-6 text-slate-400" />
                      </div>

                      <p className="mt-3 font-medium text-slate-700">
                        Không tìm thấy học viên
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        Thử thay đổi từ khóa hoặc bộ lọc.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-2 border-t px-5 py-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>
            Hiển thị{" "}
            <strong className="text-slate-900">
              {filteredStudents.length}
            </strong>{" "}
            / {students.length} học viên
          </span>

          <span>
            Tổng lần thăng đai:{" "}
            <strong className="text-slate-900">{beltRecords.length}</strong>
          </span>
        </div>
      </div>

      {/* =========================
          PROMOTION DIALOG
      ========================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Xác nhận thăng đai</DialogTitle>

            <DialogDescription>
              Cập nhật cấp đai mới và lưu lại lịch sử thăng đai.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5">
              {/* STUDENT */}

              <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {getInitials(selectedStudent.name)}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedStudent.name}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {selectedStudent.phone}
                  </p>
                </div>
              </div>

              {/* BELT FLOW */}

              <div className="rounded-2xl border bg-white p-4">
                <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Cấp đai
                </p>

                <div className="flex items-center justify-center gap-3">
                  <Badge
                    variant="outline"
                    className={getBeltClass(selectedStudent.belt)}
                  >
                    Đai {selectedStudent.belt}
                  </Badge>

                  <ChevronRight className="h-5 w-5 text-muted-foreground" />

                  <Badge variant="outline" className={getBeltClass(newBelt)}>
                    Đai {newBelt}
                  </Badge>
                </div>
              </div>

              {/* DATE */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Ngày thăng đai</label>

                <div className="relative">
                  <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    type="date"
                    value={promotionDate}
                    onChange={(e) => setPromotionDate(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* COACH */}

              <div className="space-y-2">
                <label className="text-sm font-medium">HLV xác nhận</label>

                <div className="relative">
                  <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                  <Input
                    value={coach}
                    onChange={(e) => setCoach(e.target.value)}
                    placeholder="Nhập tên HLV..."
                    className="pl-9"
                  />
                </div>
              </div>

              {/* NOTE */}

              <div className="space-y-2">
                <label className="text-sm font-medium">Ghi chú</label>

                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Đạt yêu cầu kỳ kiểm tra..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>

            <Button onClick={handlePromote}>
              <Check className="mr-2 h-4 w-4" />
              Xác nhận thăng đai
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================
          HISTORY DIALOG
      ========================= */}

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử cấp đai</DialogTitle>

            <DialogDescription>
              Quá trình thay đổi cấp đai của học viên.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5">
              {/* PROFILE */}

              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                  {getInitials(selectedStudent.name)}
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    {selectedStudent.name}
                  </p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Hiện tại:
                    </span>

                    <Badge
                      variant="outline"
                      className={getBeltClass(selectedStudent.belt)}
                    >
                      {selectedStudent.belt}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* HISTORY */}

              {history.length === 0 ? (
                <div className="rounded-2xl border border-dashed p-10 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                    <History className="h-6 w-6 text-slate-400" />
                  </div>

                  <p className="mt-3 font-medium text-slate-700">
                    Chưa có lịch sử thăng đai
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Học viên chưa có lần thăng đai nào được ghi nhận.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record, index) => (
                    <div
                      key={record.id}
                      className="relative rounded-2xl border bg-white p-4"
                    >
                      <div className="flex gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <Award className="h-5 w-5 text-slate-600" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant="outline"
                                className={getBeltClass(record.fromBelt)}
                              >
                                {record.fromBelt}
                              </Badge>

                              <ChevronRight className="h-4 w-4 text-muted-foreground" />

                              <Badge
                                variant="outline"
                                className={getBeltClass(record.toBelt)}
                              >
                                {record.toBelt}
                              </Badge>
                            </div>

                            <span className="text-xs text-muted-foreground">
                              {formatDate(record.date)}
                            </span>
                          </div>

                          {record.coach && (
                            <p className="mt-3 text-sm">
                              <span className="text-muted-foreground">
                                HLV xác nhận:
                              </span>{" "}
                              <strong>{record.coach}</strong>
                            </p>
                          )}

                          {record.note && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {record.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {index < history.length - 1 && (
                        <div className="absolute left-[34px] top-[58px] h-5 w-px bg-slate-200" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setHistoryOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
