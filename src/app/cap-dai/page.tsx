"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

import { BELT_LEVELS, BELT_NAMES, useBelt } from "@/context/belt-context";

import { Student, useStudents } from "@/context/student-context";

import { useClub } from "@/context/club-context";

import {
  Award,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  GraduationCap,
  Search,
  Users,
  X,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/* =====================================================
   TYPE
===================================================== */

type ExamResult = "Đạt" | "Không đạt" | null;

type ExamStudent = Student & {
  thiCap: boolean;
  ketQuaThiCap: ExamResult;
};

/* =====================================================
   BELT LEVEL
===================================================== */

function getBeltLevel(belt: string) {
  const index = BELT_NAMES.indexOf(belt.trim() as (typeof BELT_NAMES)[number]);

  return index === -1 ? 0 : index;
}

/* =====================================================
   NEXT BELT
===================================================== */

function getNextBelt(belt: string) {
  const currentIndex = getBeltLevel(belt);

  if (currentIndex < 0 || currentIndex >= BELT_NAMES.length - 1) {
    return null;
  }

  return BELT_NAMES[currentIndex + 1];
}

/* =====================================================
   DATE
===================================================== */

function getTodayDatabaseDate() {
  return new Date().toISOString().split("T")[0];
}

/* =====================================================
   CSV
===================================================== */

function escapeCsv(value: unknown) {
  const text = String(value ?? "");

  return `"${text.replace(/"/g, '""')}"`;
}

/* =====================================================
   PAGE
===================================================== */

export default function CapDaiPage() {
  const supabase = createClient();

  const { students, refreshStudents } = useStudents();

  const { beltRecords, promoteStudent, promoteStudents } = useBelt();

  const { club, canManage } = useClub();

  /*
   * Staff hoặc Coach view-only
   */
  const isStaff = club?.role === "staff";

  const canEdit = !isStaff && canManage;

  /* ===================================================
     FILTER
  =================================================== */

  const [search, setSearch] = useState("");

  const [beltFilter, setBeltFilter] = useState("all");

  const [examFilter, setExamFilter] = useState("all");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  /* ===================================================
     EXAM DATA
     
     Lấy trực tiếp từ StudentContext.
     StudentContext đã map:
     
     thi_cap
     ket_qua_thi_cap
  =================================================== */

  const examStudents = useMemo<ExamStudent[]>(() => {
    return students.map((student) => ({
      ...student,

      thiCap: student.thiCap ?? false,

      ketQuaThiCap: student.ketQuaThiCap ?? null,
    }));
  }, [students]);

  /* ===================================================
     FILTERED STUDENTS
  =================================================== */

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    let result = [...examStudents];

    /* SEARCH */

    if (keyword) {
      result = result.filter(
        (student) =>
          student.name.toLowerCase().includes(keyword) ||
          student.phone.toLowerCase().includes(keyword) ||
          student.className.toLowerCase().includes(keyword),
      );
    }

    /* BELT */

    if (beltFilter !== "all") {
      result = result.filter((student) => student.belt.trim() === beltFilter);
    }

    /* EXAM */

    if (examFilter === "exam") {
      result = result.filter((student) => student.thiCap);
    }

    if (examFilter === "not-exam") {
      result = result.filter((student) => !student.thiCap);
    }

    /* SORT */

    result.sort((a, b) => {
      const levelA = getBeltLevel(a.belt);

      const levelB = getBeltLevel(b.belt);

      if (sortOrder === "asc") {
        return levelA - levelB;
      }

      return levelB - levelA;
    });

    return result;
  }, [examStudents, search, beltFilter, examFilter, sortOrder]);

  /* ===================================================
     STATISTICS
  =================================================== */

  const totalStudents = examStudents.length;

  const totalExam = examStudents.filter((student) => student.thiCap).length;

  const totalPassed = examStudents.filter(
    (student) => student.thiCap && student.ketQuaThiCap === "Đạt",
  ).length;

  const totalFailed = examStudents.filter(
    (student) => student.thiCap && student.ketQuaThiCap === "Không đạt",
  ).length;

  /* ===================================================
     BULK EXAM
  =================================================== */

  const [savingAllExam, setSavingAllExam] = useState(false);

  const allFilteredExamSelected =
    filteredStudents.length > 0 &&
    filteredStudents.every((student) => student.thiCap);

  /* ===================================================
     TOGGLE ONE EXAM
  =================================================== */

  const [savingExamId, setSavingExamId] = useState<number | null>(null);

  async function handleToggleExam(student: ExamStudent) {
    if (!canEdit || !club?.id) {
      return;
    }

    const nextValue = !student.thiCap;

    setSavingExamId(student.id);

    try {
      const updateData: {
        thi_cap: boolean;
        ket_qua_thi_cap?: ExamResult;
      } = {
        thi_cap: nextValue,
      };

      /*
       * Nếu bỏ thi:
       * xóa kết quả cũ.
       */
      if (!nextValue) {
        updateData.ket_qua_thi_cap = null;
      }

      const { error } = await supabase
        .from("students")
        .update(updateData)
        .eq("id", student.id)
        .eq("club_id", club.id);

      if (error) {
        console.error("Lỗi cập nhật thi cấp:", error);

        alert("Không thể cập nhật trạng thái thi cấp.");

        return;
      }

      await refreshStudents();
    } finally {
      setSavingExamId(null);
    }
  }

  /* ===================================================
     CHỌN TẤT CẢ THI CẤP
     
     Chỉ áp dụng danh sách đang filter.
  =================================================== */

  async function handleToggleAllExam() {
    if (!canEdit || !club?.id || filteredStudents.length === 0) {
      return;
    }

    const nextValue = !allFilteredExamSelected;

    const studentIds = filteredStudents.map((student) => student.id);

    setSavingAllExam(true);

    try {
      const updateData: {
        thi_cap: boolean;
        ket_qua_thi_cap?: ExamResult;
      } = {
        thi_cap: nextValue,
      };

      /*
       * Bỏ chọn tất cả:
       * xóa luôn kết quả.
       */
      if (!nextValue) {
        updateData.ket_qua_thi_cap = null;
      }

      const { error } = await supabase
        .from("students")
        .update(updateData)
        .eq("club_id", club.id)
        .in("id", studentIds);

      if (error) {
        console.error("Lỗi chọn tất cả thi cấp:", error);

        alert("Không thể cập nhật danh sách thi cấp.");

        return;
      }

      await refreshStudents();
    } finally {
      setSavingAllExam(false);
    }
  }

  /* ===================================================
     SET RESULT
  =================================================== */

  async function handleSetResult(student: ExamStudent, result: ExamResult) {
    if (!canEdit || !club?.id || !student.thiCap) {
      return;
    }

    setSavingExamId(student.id);

    try {
      const { error } = await supabase
        .from("students")
        .update({
          ket_qua_thi_cap: result,
        })
        .eq("id", student.id)
        .eq("club_id", club.id);

      if (error) {
        console.error("Lỗi cập nhật kết quả thi:", error);

        alert("Không thể cập nhật kết quả.");

        return;
      }

      await refreshStudents();
    } finally {
      setSavingExamId(null);
    }
  }

  /* ===================================================
     CHỌN TẤT CẢ ĐẠT
     
     CHỈ những người đang THI CẤP
     trong danh sách đang filter.
  =================================================== */

  const [savingAllPassed, setSavingAllPassed] = useState(false);

  async function handleSelectAllPassed() {
    if (!canEdit || !club?.id) {
      return;
    }

    const targetStudents = filteredStudents.filter((student) => student.thiCap);

    if (targetStudents.length === 0) {
      alert("Không có học viên nào đang thi cấp trong danh sách.");

      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn chọn "Đạt" cho ${targetStudents.length} học viên đang thi cấp?`,
    );

    if (!confirmed) {
      return;
    }

    setSavingAllPassed(true);

    try {
      const studentIds = targetStudents.map((student) => student.id);

      const { error } = await supabase
        .from("students")
        .update({
          ket_qua_thi_cap: "Đạt",
        })
        .eq("club_id", club.id)
        .in("id", studentIds);

      if (error) {
        console.error("Lỗi chọn tất cả đạt:", error);

        alert("Không thể chọn tất cả đạt.");

        return;
      }

      await refreshStudents();
    } finally {
      setSavingAllPassed(false);
    }
  }

  /* ===================================================
     EXPORT
  =================================================== */

  function handleExportExamList() {
    const list = examStudents
      .filter((student) => student.thiCap)
      .sort((a, b) => getBeltLevel(b.belt) - getBeltLevel(a.belt));

    if (list.length === 0) {
      alert("Chưa có học viên nào đăng ký thi cấp.");

      return;
    }

    const header = [
      "STT",
      "Họ và tên",
      "SĐT",
      "Ngày sinh",
      "Lớp học",
      "Cấp đai hiện tại",
      "Cấp đai dự kiến",
      "Thi cấp",
      "Kết quả",
    ];

    const rows = list.map((student, index) => {
      return [
        index + 1,
        student.name,
        student.phone,
        student.birthDate,
        student.className,
        student.belt,
        getNextBelt(student.belt) ?? "Đen",
        "Thi cấp",
        student.ketQuaThiCap ?? "",
      ];
    });

    const csv = [
      header.map(escapeCsv).join(","),
      ...rows.map((row) => row.map(escapeCsv).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "danh-sach-thi-cap.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  /* ===================================================
     PROMOTION DIALOG
  =================================================== */

  const [promotionStudent, setPromotionStudent] = useState<ExamStudent | null>(
    null,
  );

  const [promotionOpen, setPromotionOpen] = useState(false);

  const [promotionLoading, setPromotionLoading] = useState(false);

  function openPromotionDialog(student: ExamStudent) {
    if (!canEdit) {
      return;
    }

    if (!student.thiCap || student.ketQuaThiCap !== "Đạt") {
      alert("Chỉ học viên thi cấp và có kết quả Đạt mới được thăng đai.");

      return;
    }

    const nextBelt = getNextBelt(student.belt);

    if (!nextBelt) {
      alert("Học viên này đã đạt đai Đen.");

      return;
    }

    setPromotionStudent(student);

    setPromotionOpen(true);
  }

  /* ===================================================
     PROMOTE ONE
  =================================================== */

  async function handlePromoteOne() {
    if (!promotionStudent || !club?.id || !canEdit) {
      return;
    }

    const nextBelt = getNextBelt(promotionStudent.belt);

    if (!nextBelt) {
      return;
    }

    setPromotionLoading(true);

    try {
      /*
       * 1. Lưu lịch sử cấp đai
       */
      const result = await promoteStudent({
        id: 0,
        studentId: promotionStudent.id,
        studentName: promotionStudent.name,
        fromBelt: promotionStudent.belt,
        toBelt: nextBelt,
        date: getTodayDatabaseDate(),
        coach: "",
        note: "Thăng đai sau kỳ thi cấp",
      });

      if (result.error) {
        alert(result.error);

        return;
      }

      /*
       * 2. Cập nhật học viên
       */
      const { error } = await supabase
        .from("students")
        .update({
          belt: nextBelt,

          /*
           * Reset kỳ thi
           */
          thi_cap: false,
          ket_qua_thi_cap: null,
        })
        .eq("id", promotionStudent.id)
        .eq("club_id", club.id);

      if (error) {
        console.error("Lỗi cập nhật cấp đai:", error);

        alert("Đã lưu lịch sử nhưng chưa cập nhật cấp đai học viên.");

        return;
      }

      setPromotionOpen(false);

      setPromotionStudent(null);

      await refreshStudents();
    } finally {
      setPromotionLoading(false);
    }
  }

  /* ===================================================
     PROMOTE ALL PASSED
  =================================================== */

  const [promotingAll, setPromotingAll] = useState(false);

  async function handlePromoteAllPassed() {
    if (!canEdit || !club?.id) {
      return;
    }

    const passedStudents = examStudents.filter(
      (student) =>
        student.thiCap &&
        student.ketQuaThiCap === "Đạt" &&
        getNextBelt(student.belt),
    );

    if (passedStudents.length === 0) {
      alert("Chưa có học viên nào đạt và đủ điều kiện thăng đai.");

      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn thăng đai cho ${passedStudents.length} học viên đạt?`,
    );

    if (!confirmed) {
      return;
    }

    setPromotingAll(true);

    try {
      /*
       * Chuẩn bị lịch sử
       */
      const records = passedStudents
        .map((student) => {
          const nextBelt = getNextBelt(student.belt);

          if (!nextBelt) {
            return null;
          }

          return {
            id: 0,
            studentId: student.id,
            studentName: student.name,
            fromBelt: student.belt,
            toBelt: nextBelt,
            date: getTodayDatabaseDate(),
            coach: "",
            note: "Thăng đai sau kỳ thi cấp",
          };
        })
        .filter((record) => record !== null);

      /*
       * 1. Lưu lịch sử cấp đai
       */
      const historyResult = await promoteStudents(records);

      if (historyResult.error) {
        alert(historyResult.error);

        return;
      }

      /*
       * 2. Cập nhật tất cả học viên
       *
       * Không dùng một update chung vì
       * mỗi người có cấp đai tiếp theo khác nhau.
       */
      for (const student of passedStudents) {
        const nextBelt = getNextBelt(student.belt);

        if (!nextBelt) {
          continue;
        }

        const { error } = await supabase
          .from("students")
          .update({
            belt: nextBelt,

            /*
             * Reset kỳ thi
             */
            thi_cap: false,
            ket_qua_thi_cap: null,
          })
          .eq("id", student.id)
          .eq("club_id", club.id);

        if (error) {
          console.error(`Lỗi cập nhật ${student.name}:`, error);
        }
      }

      await refreshStudents();
    } finally {
      setPromotingAll(false);
    }
  }

  /* ===================================================
     HISTORY
  =================================================== */

  const recentHistory = useMemo(() => {
    return beltRecords.slice(0, 10);
  }, [beltRecords]);

  /* ===================================================
     RENDER
  =================================================== */

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Award className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Cấp đai
                </h1>

                <p className="text-sm text-slate-500">
                  Quản lý thi cấp và thăng cấp đai
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {/* CHỌN TẤT CẢ THI CẤP */}

            {canEdit && (
              <Button
                type="button"
                variant="outline"
                disabled={filteredStudents.length === 0 || savingAllExam}
                onClick={handleToggleAllExam}
                className={
                  allFilteredExamSelected
                    ? "border-slate-300 text-slate-700 hover:bg-slate-100"
                    : "border-blue-200 text-blue-700 hover:bg-blue-50"
                }
              >
                {savingAllExam ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                    Đang lưu...
                  </>
                ) : allFilteredExamSelected ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Bỏ chọn tất cả
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Chọn tất cả thi cấp
                  </>
                )}
              </Button>
            )}

            {/* CHỌN TẤT CẢ ĐẠT */}

            {canEdit && (
              <Button
                type="button"
                variant="outline"
                disabled={totalExam === 0 || savingAllPassed || promotingAll}
                onClick={handleSelectAllPassed}
                className="border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50"
              >
                {savingAllPassed ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-emerald-300 border-t-emerald-700" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Chọn tất cả đạt
                  </>
                )}
              </Button>
            )}

            {/* THĂNG TẤT CẢ */}

            {canEdit && (
              <Button
                type="button"
                disabled={totalPassed === 0 || promotingAll}
                onClick={handlePromoteAllPassed}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                {promotingAll ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                    Đang thăng đai...
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    Thăng đai tất cả đạt
                    {totalPassed > 0 && ` (${totalPassed})`}
                  </>
                )}
              </Button>
            )}

            {/* EXPORT */}

            <Button
              type="button"
              variant="outline"
              disabled={totalExam === 0}
              onClick={handleExportExamList}
            >
              <Download className="mr-2 h-4 w-4" />
              Xuất danh sách thi
            </Button>
          </div>
        </div>

        {/* =================================================
            STAFF NOTICE
        ================================================= */}

        {isStaff && (
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Bạn đang ở chế độ <b>Chỉ xem</b>.
          </div>
        )}

        {/* =================================================
            STATS
        ================================================= */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* TOTAL */}

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Tổng học viên</p>

                  <p className="mt-1 text-2xl font-bold text-slate-900">
                    {totalStudents}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Users className="h-5 w-5 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* EXAM */}

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Thi cấp</p>

                  <p className="mt-1 text-2xl font-bold text-blue-700">
                    {totalExam}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <GraduationCap className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PASSED */}

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Đạt</p>

                  <p className="mt-1 text-2xl font-bold text-emerald-600">
                    {totalPassed}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <Check className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAILED */}

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">Không đạt</p>

                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {totalFailed}
                  </p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
                  <X className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* =================================================
            FILTER
        ================================================= */}

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              {/* SEARCH */}

              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm học viên, số điện thoại, lớp..."
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {/* BELT */}

                <Select
                  value={beltFilter}
                  onValueChange={(value) => setBeltFilter(value ?? "all")}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Cấp đai" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">Tất cả cấp đai</SelectItem>

                    {BELT_NAMES.map((belt) => (
                      <SelectItem key={belt} value={belt}>
                        {belt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* EXAM FILTER */}

                <Select
                  value={examFilter}
                  onValueChange={(value) => setExamFilter(value ?? "all")}
                >
                  <SelectTrigger className="w-[170px]">
                    <SelectValue placeholder="Thi cấp" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">Tất cả</SelectItem>

                    <SelectItem value="exam">Đang thi cấp</SelectItem>

                    <SelectItem value="not-exam">Không thi</SelectItem>
                  </SelectContent>
                </Select>

                {/* SORT */}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                >
                  {sortOrder === "asc" ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Đai thấp → cao
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      Đai cao → thấp
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* =================================================
            TABLE
        ================================================= */}

        <Card className="overflow-hidden">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Danh sách học viên</CardTitle>

                <p className="mt-1 text-sm text-slate-500">
                  Hiển thị {filteredStudents.length} / {totalStudents} học viên
                </p>
              </div>

              {totalExam > 0 && (
                <Badge
                  variant="outline"
                  className="w-fit border-blue-200 bg-blue-50 text-blue-700"
                >
                  {totalExam} người thi cấp
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60px]">STT</TableHead>

                    <TableHead>Học viên</TableHead>

                    <TableHead>Lớp</TableHead>

                    <TableHead>Cấp đai</TableHead>

                    <TableHead className="text-center">Thi cấp</TableHead>

                    <TableHead className="text-center">Kết quả</TableHead>

                    <TableHead className="text-center">Cấp dự kiến</TableHead>

                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="h-32 text-center text-slate-500"
                      >
                        Không có học viên phù hợp.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((student, index) => {
                      const nextBelt = getNextBelt(student.belt);

                      const isSaving = savingExamId === student.id;

                      const isPassed =
                        student.thiCap && student.ketQuaThiCap === "Đạt";

                      return (
                        <TableRow
                          key={student.id}
                          className={student.thiCap ? "bg-blue-50/40" : ""}
                        >
                          {/* STT */}

                          <TableCell className="font-medium text-slate-500">
                            {index + 1}
                          </TableCell>

                          {/* STUDENT */}

                          <TableCell>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {student.name}
                              </p>

                              {student.phone && (
                                <p className="text-xs text-slate-500">
                                  {student.phone}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          {/* CLASS */}

                          <TableCell>
                            <span className="text-sm text-slate-600">
                              {student.className || "—"}
                            </span>
                          </TableCell>

                          {/* BELT */}

                          <TableCell>
                            <Badge
                              variant="outline"
                              className="border-slate-200 bg-white"
                            >
                              {student.belt}
                            </Badge>
                          </TableCell>

                          {/* EXAM */}

                          <TableCell className="text-center">
                            <button
                              type="button"
                              disabled={!canEdit || isSaving}
                              onClick={() => handleToggleExam(student)}
                              className={`
                                  group inline-flex h-9 min-w-[112px]
                                  items-center justify-center gap-2
                                  rounded-full border px-3.5
                                  text-xs font-semibold
                                  transition-all duration-200
                                  focus:outline-none
                                  focus:ring-2
                                  focus:ring-blue-200
                                  disabled:cursor-not-allowed
                                  disabled:opacity-60
                                  ${
                                    student.thiCap
                                      ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm hover:border-blue-300 hover:bg-blue-100"
                                      : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700"
                                  }
                                `}
                            >
                              {isSaving ? (
                                <>
                                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
                                  Đang lưu
                                </>
                              ) : student.thiCap ? (
                                <>
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
                                    <Check className="h-3 w-3 stroke-[3]" />
                                  </span>
                                  Thi cấp
                                </>
                              ) : (
                                <>
                                  <span className="flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white">
                                    <X className="h-3 w-3 text-slate-400" />
                                  </span>
                                  Không thi
                                </>
                              )}
                            </button>
                          </TableCell>

                          {/* RESULT */}

                          <TableCell className="text-center">
                            {!student.thiCap ? (
                              <span className="text-sm text-slate-400">—</span>
                            ) : (
                              <div className="flex items-center justify-center gap-1.5">
                                {/* ĐẠT */}

                                <button
                                  type="button"
                                  disabled={!canEdit || isSaving}
                                  onClick={() =>
                                    handleSetResult(student, "Đạt")
                                  }
                                  className={`
                                      inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition
                                      disabled:cursor-not-allowed disabled:opacity-50
                                      ${
                                        student.ketQuaThiCap === "Đạt"
                                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                          : "border-slate-200 bg-white text-slate-400 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                      }
                                    `}
                                >
                                  <Check className="mr-1 h-3.5 w-3.5" />
                                  Đạt
                                </button>

                                {/* KHÔNG ĐẠT */}

                                <button
                                  type="button"
                                  disabled={!canEdit || isSaving}
                                  onClick={() =>
                                    handleSetResult(student, "Không đạt")
                                  }
                                  className={`
                                      inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold transition
                                      disabled:cursor-not-allowed disabled:opacity-50
                                      ${
                                        student.ketQuaThiCap === "Không đạt"
                                          ? "border-red-200 bg-red-50 text-red-700"
                                          : "border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                                      }
                                    `}
                                >
                                  <X className="mr-1 h-3.5 w-3.5" />
                                  Không đạt
                                </button>
                              </div>
                            )}
                          </TableCell>

                          {/* NEXT BELT */}

                          <TableCell className="text-center">
                            {isPassed && nextBelt ? (
                              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                                {nextBelt}
                              </Badge>
                            ) : (
                              <span className="text-sm text-slate-400">—</span>
                            )}
                          </TableCell>

                          {/* ACTION */}

                          <TableCell className="text-right">
                            {isPassed && nextBelt && canEdit ? (
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => openPromotionDialog(student)}
                                className="bg-slate-900 text-white hover:bg-slate-800"
                              >
                                <GraduationCap className="mr-1.5 h-4 w-4" />
                                Thăng đai
                              </Button>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* =================================================
            LỊCH SỬ CẤP ĐAI GẦN ĐÂY
        ================================================= */}

        <Card>
          <CardHeader>
            <CardTitle>Lịch sử cấp đai gần đây</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            {recentHistory.length === 0 ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Chưa có lịch sử cấp đai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Học viên</TableHead>

                      <TableHead>Từ đai</TableHead>

                      <TableHead>Sang đai</TableHead>

                      <TableHead>Ngày</TableHead>

                      <TableHead>Ghi chú</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {recentHistory.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.studentName}
                        </TableCell>

                        <TableCell>{record.fromBelt}</TableCell>

                        <TableCell>
                          <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                            {record.toBelt}
                          </Badge>
                        </TableCell>

                        <TableCell>{record.date}</TableCell>

                        <TableCell className="text-slate-500">
                          {record.note || "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ===================================================
          PROMOTION DIALOG
      =================================================== */}

      <Dialog open={promotionOpen} onOpenChange={setPromotionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận thăng đai</DialogTitle>

            <DialogDescription>
              Xác nhận nâng cấp đai cho học viên.
            </DialogDescription>
          </DialogHeader>

          {promotionStudent && (
            <div className="space-y-4 py-3">
              <div className="rounded-xl border bg-slate-50 p-5">
                <p className="text-center text-lg font-bold text-slate-900">
                  {promotionStudent.name}
                </p>

                <div className="mt-5 flex items-center justify-center gap-4">
                  <Badge variant="outline" className="px-3 py-1">
                    {promotionStudent.belt}
                  </Badge>

                  <span className="text-xl text-slate-400">→</span>

                  <Badge className="bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-600">
                    {getNextBelt(promotionStudent.belt)}
                  </Badge>
                </div>
              </div>

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />

                  <p>
                    Kết quả thi:
                    <b> Đạt</b>. Sau khi thăng đai, hệ thống sẽ tự động chuyển
                    thành <b>Không thi</b> và xóa kết quả.
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={promotionLoading}
              onClick={() => setPromotionOpen(false)}
            >
              Hủy
            </Button>

            <Button
              type="button"
              disabled={promotionLoading}
              onClick={handlePromoteOne}
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              {promotionLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-white" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Xác nhận thăng đai
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
