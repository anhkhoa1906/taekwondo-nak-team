"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useClasses } from "@/context/class-context";
import type { ClassItem } from "@/context/class-context";
import { useCoaches } from "@/context/coach-context";
import { useRole } from "@/hooks/use-role";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type NewClass = {
  name: string;
  coach: string;
  schedule: string;
  time: string;
  status: string;
  note: string;
};

const SCHEDULE_OPTIONS = [
  "Thứ 2 - 4 - 6",
  "Thứ 3 - 5 - 7",
  "Thứ 3 - 5 - 6 - 7",
  "Full Tuần",
  "Thứ 7 - Chủ nhật",
];

const STATUS_OPTIONS = ["Đang hoạt động", "Tạm nghỉ"];

const EMPTY_CLASS: NewClass = {
  name: "",
  coach: "",
  schedule: "",
  time: "",
  status: "Đang hoạt động",
  note: "",
};

function getStatusClass(status: string) {
  if (status === "Đang hoạt động") {
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
  }

  return "bg-slate-100 text-slate-600 border-slate-200";
}

export default function LopHocPage() {
  const { students, updateStudent } = useStudents();

  const { classes, addClass, updateClass, deleteClass } = useClasses();

  const { coaches } = useCoaches();

  const { isStaff } = useRole();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addStudentOpen, setAddStudentOpen] = useState(false);

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);

  const [studentSearch, setStudentSearch] = useState("");

  const [newClass, setNewClass] = useState<NewClass>({
    ...EMPTY_CLASS,
  });

  // =====================================================
  // THỐNG KÊ
  // =====================================================

  const activeClasses = classes.filter(
    (item) => item.status === "Đang hoạt động",
  ).length;

  const pausedClasses = classes.filter(
    (item) => item.status === "Tạm nghỉ",
  ).length;

  const assignedStudents = students.filter(
    (student) => student.className && student.className !== "Chưa xếp lớp",
  ).length;

  // =====================================================
  // FILTER LỚP
  // =====================================================

  const filteredClasses = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return classes.filter((item) => {
      const matchSearch =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        item.coach.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [classes, search, statusFilter]);

  // =====================================================
  // LẤY HỌC VIÊN TRONG LỚP
  // =====================================================

  function getStudentsInClass(classItem: ClassItem) {
    return students.filter((student) => student.className === classItem.name);
  }

  // =====================================================
  // RESET FORM
  // =====================================================

  function resetForm() {
    setNewClass({
      ...EMPTY_CLASS,
    });
  }

  // =====================================================
  // MỞ FORM THÊM
  // =====================================================

  function handleOpenAddClass() {
    setSelectedClass(null);
    resetForm();
    setOpen(true);
  }

  // =====================================================
  // THÊM LỚP
  // =====================================================

  function handleAddClass() {
    const name = newClass.name.trim();

    const time = newClass.time.trim();

    const note = newClass.note.trim();

    if (!name || !newClass.coach || !newClass.schedule || !time) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    const duplicate = classes.some(
      (item) => item.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      alert("Tên lớp này đã tồn tại.");
      return;
    }

    const newItem: ClassItem = {
      id: Date.now(),
      name,
      coach: newClass.coach,
      schedule: newClass.schedule,
      time,
      status: newClass.status,
      note,
    };

    addClass(newItem);

    resetForm();
    setOpen(false);
  }

  // =====================================================
  // XEM LỚP
  // =====================================================

  function handleViewClass(item: ClassItem) {
    setSelectedClass(item);
    setStudentSearch("");
    setViewOpen(true);
  }

  // =====================================================
  // MỞ FORM SỬA
  // =====================================================

  function handleEditClass(item: ClassItem) {
    setSelectedClass(item);

    setNewClass({
      name: item.name,
      coach: item.coach,
      schedule: item.schedule,
      time: item.time,
      status: item.status,
      note: item.note,
    });

    setEditOpen(true);
  }

  // =====================================================
  // CẬP NHẬT LỚP
  // =====================================================

  function handleUpdateClass() {
    if (!selectedClass) {
      return;
    }

    const name = newClass.name.trim();

    const time = newClass.time.trim();

    const note = newClass.note.trim();

    if (!name || !newClass.coach || !newClass.schedule || !time) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    const duplicate = classes.some(
      (item) =>
        item.id !== selectedClass.id &&
        item.name.trim().toLowerCase() === name.toLowerCase(),
    );

    if (duplicate) {
      alert("Tên lớp này đã tồn tại.");
      return;
    }

    const oldClassName = selectedClass.name;

    const updatedClass: ClassItem = {
      ...selectedClass,
      name,
      coach: newClass.coach,
      schedule: newClass.schedule,
      time,
      status: newClass.status,
      note,
    };

    updateClass(updatedClass);

    // Nếu đổi tên lớp thì cập nhật học viên
    if (oldClassName !== name) {
      const studentsInOldClass = students.filter(
        (student) => student.className === oldClassName,
      );

      studentsInOldClass.forEach((student) => {
        updateStudent({
          ...student,
          className: name,
        });
      });
    }

    resetForm();
    setSelectedClass(null);
    setEditOpen(false);
  }

  // =====================================================
  // XÓA LỚP
  // =====================================================

  function handleDeleteClass(item: ClassItem) {
    const classStudents = getStudentsInClass(item);

    if (classStudents.length > 0) {
      alert(
        `Không thể xóa lớp "${item.name}" vì lớp đang có ${classStudents.length} học viên.\n\nVui lòng chuyển học viên sang lớp khác hoặc "Chưa xếp lớp" trước khi xóa.`,
      );

      return;
    }

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa lớp "${item.name}" không?`,
    );

    if (!confirmed) {
      return;
    }

    deleteClass(item.id);

    if (selectedClass?.id === item.id) {
      setSelectedClass(null);
      setViewOpen(false);
      setEditOpen(false);
    }
  }

  // =====================================================
  // MỞ FORM THÊM HỌC VIÊN
  // =====================================================

  function handleOpenAddStudent() {
    setStudentSearch("");
    setAddStudentOpen(true);
  }

  // =====================================================
  // THÊM HỌC VIÊN VÀO LỚP
  // =====================================================

  function handleAddStudentToClass(studentId: number) {
    if (!selectedClass) {
      return;
    }

    const student = students.find((item) => item.id === studentId);

    if (!student) {
      return;
    }

    updateStudent({
      ...student,
      className: selectedClass.name,
    });

    setAddStudentOpen(false);
    setStudentSearch("");
  }

  // =====================================================
  // ĐƯA HỌC VIÊN RA KHỎI LỚP
  // =====================================================

  function handleRemoveStudent(studentId: number) {
    if (!selectedClass) {
      return;
    }

    const student = students.find((item) => item.id === studentId);

    if (!student) {
      return;
    }

    const confirmed = window.confirm(
      `Đưa "${student.name}" ra khỏi lớp "${selectedClass.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    updateStudent({
      ...student,
      className: "Chưa xếp lớp",
    });
  }

  // =====================================================
  // DANH SÁCH HỌC VIÊN CÓ THỂ THÊM
  // =====================================================

  const availableStudents = useMemo(() => {
    const keyword = studentSearch.trim().toLowerCase();

    return students.filter((student) => {
      const matchSearch =
        !keyword ||
        student.name.toLowerCase().includes(keyword) ||
        student.phone.toLowerCase().includes(keyword);

      const notInCurrentClass =
        !selectedClass || student.className !== selectedClass.name;

      return matchSearch && notInCurrentClass;
    });
  }, [students, studentSearch, selectedClass]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="space-y-6">
      {/* =================================================
          HEADER
      ================================================= */}

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
            <CalendarDays className="h-6 w-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Lớp học
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý lớp tập, lịch học và học viên
            </p>
          </div>
        </div>

        {!isStaff && (
          <Button
            className="w-full gap-2 md:w-auto"
            onClick={handleOpenAddClass}
          >
            <Plus className="h-4 w-4" />
            Thêm lớp
          </Button>
        )}
      </div>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Tổng lớp */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tổng số lớp</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {classes.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
              <CalendarDays className="h-5 w-5 text-slate-700" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">Tất cả lớp trong CLB</p>
        </div>

        {/* Đang hoạt động */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Đang hoạt động
              </p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {activeClasses}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50">
              <Clock className="h-5 w-5 text-emerald-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Lớp đang tổ chức tập luyện
          </p>
        </div>

        {/* Tạm nghỉ */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Tạm nghỉ</p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {pausedClasses}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">Lớp hiện đang tạm dừng</p>
        </div>

        {/* Học viên */}
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                Học viên đã xếp lớp
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {assignedStudents}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-400">
            Học viên đang thuộc một lớp
          </p>
        </div>
      </div>

      {/* =================================================
          FILTER
      ================================================= */}

      <div className="rounded-2xl border bg-white p-4 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">Danh sách lớp học</h2>

          <p className="mt-1 text-xs text-slate-500">
            Tìm kiếm lớp học hoặc lọc theo trạng thái
          </p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              placeholder="Tìm tên lớp hoặc HLV..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (!value) {
                return;
              }

              setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-full md:w-[220px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>

              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* =================================================
          TABLE
      ================================================= */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[60px]">STT</TableHead>

                <TableHead className="min-w-[180px]">Tên lớp</TableHead>

                <TableHead className="min-w-[160px]">HLV phụ trách</TableHead>

                <TableHead className="min-w-[150px]">Lịch tập</TableHead>

                <TableHead className="min-w-[150px]">Thời gian</TableHead>

                <TableHead className="min-w-[120px] text-center">
                  Học viên
                </TableHead>

                <TableHead className="min-w-[140px]">Trạng thái</TableHead>

                <TableHead className="min-w-[120px] text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((item, index) => {
                  const classStudents = getStudentsInClass(item);

                  return (
                    <TableRow key={item.id} className="group">
                      <TableCell className="font-medium text-slate-500">
                        {index + 1}
                      </TableCell>

                      <TableCell>
                        <div>
                          <p className="font-semibold text-slate-900">
                            {item.name}
                          </p>

                          {item.note && (
                            <p className="mt-1 max-w-[220px] truncate text-xs text-slate-400">
                              {item.note}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {item.coach}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          {item.schedule}
                        </div>
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="h-4 w-4 text-slate-400" />

                          {item.time}
                        </div>
                      </TableCell>

                      <TableCell className="text-center">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700">
                          <Users className="h-3.5 w-3.5" />

                          {classStudents.length}
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getStatusClass(item.status)}
                        >
                          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />

                          {item.status}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex justify-end gap-1">
                          {/* Xem */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xem chi tiết"
                            onClick={() => handleViewClass(item)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Sửa + Xóa */}
                          {!isStaff && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Chỉnh sửa"
                                onClick={() => handleEditClass(item)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="icon"
                                title="Xóa lớp"
                                onClick={() => handleDeleteClass(item)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                        <Search className="h-5 w-5 text-slate-400" />
                      </div>

                      <p className="font-medium text-slate-700">
                        Không tìm thấy lớp học
                      </p>

                      <p className="text-sm text-slate-400">
                        Thử thay đổi từ khóa hoặc bộ lọc.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-2 border-t px-4 py-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Hiển thị{" "}
            <strong className="text-slate-900">{filteredClasses.length}</strong>{" "}
            / {classes.length} lớp
          </span>

          <span>
            Tổng học viên đã xếp lớp:{" "}
            <strong className="text-slate-900">{assignedStudents}</strong>
          </span>
        </div>
      </div>

      {/* =================================================
          DIALOG: THÊM LỚP
      ================================================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Thêm lớp học</DialogTitle>

            <DialogDescription>Nhập thông tin lớp học mới.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* TÊN LỚP */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tên lớp <span className="text-red-500">*</span>
              </label>

              <Input
                placeholder="Ví dụ: Lớp Taekwondo thiếu nhi"
                value={newClass.name}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    name: e.target.value,
                  })
                }
              />
            </div>

            {/* HLV */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                HLV phụ trách <span className="text-red-500">*</span>
              </label>

              <Select
                value={newClass.coach}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  setNewClass({
                    ...newClass,
                    coach: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn HLV" />
                </SelectTrigger>

                <SelectContent>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.name}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* LỊCH TẬP */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Lịch tập <span className="text-red-500">*</span>
              </label>

              <Select
                value={newClass.schedule}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  setNewClass({
                    ...newClass,
                    schedule: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lịch tập" />
                </SelectTrigger>

                <SelectContent>
                  {SCHEDULE_OPTIONS.map((schedule) => (
                    <SelectItem key={schedule} value={schedule}>
                      {schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* THỜI GIAN */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Thời gian <span className="text-red-500">*</span>
              </label>

              <Input
                placeholder="Ví dụ: 18:00 - 19:30"
                value={newClass.time}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    time: e.target.value,
                  })
                }
              />
            </div>

            {/* TRẠNG THÁI */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>

              <Select
                value={newClass.status}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  setNewClass({
                    ...newClass,
                    status: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GHI CHÚ */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>

              <Input
                placeholder="Ghi chú về lớp..."
                value={newClass.note}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    note: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>

            <Button onClick={handleAddClass}>Thêm lớp</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================================================
          DIALOG: SỬA LỚP
      ================================================= */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Chỉnh sửa lớp học</DialogTitle>

            <DialogDescription>Cập nhật thông tin lớp học.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* TÊN LỚP */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Tên lớp <span className="text-red-500">*</span>
              </label>

              <Input
                value={newClass.name}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    name: e.target.value,
                  })
                }
              />
            </div>

            {/* HLV */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                HLV phụ trách <span className="text-red-500">*</span>
              </label>

              <Select
                value={newClass.coach}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  setNewClass({
                    ...newClass,
                    coach: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn HLV" />
                </SelectTrigger>

                <SelectContent>
                  {coaches.map((coach) => (
                    <SelectItem key={coach.id} value={coach.name}>
                      {coach.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* LỊCH TẬP */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Lịch tập <span className="text-red-500">*</span>
              </label>

              <Select
                value={newClass.schedule}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  setNewClass({
                    ...newClass,
                    schedule: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lịch tập" />
                </SelectTrigger>

                <SelectContent>
                  {SCHEDULE_OPTIONS.map((schedule) => (
                    <SelectItem key={schedule} value={schedule}>
                      {schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* THỜI GIAN */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Thời gian <span className="text-red-500">*</span>
              </label>

              <Input
                value={newClass.time}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    time: e.target.value,
                  })
                }
              />
            </div>

            {/* TRẠNG THÁI */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>

              <Select
                value={newClass.status}
                onValueChange={(value) => {
                  if (!value) {
                    return;
                  }

                  setNewClass({
                    ...newClass,
                    status: value,
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GHI CHÚ */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>

              <Input
                value={newClass.note}
                onChange={(e) =>
                  setNewClass({
                    ...newClass,
                    note: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>

            <Button onClick={handleUpdateClass}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================================================
          DIALOG: XEM CHI TIẾT
      ================================================= */}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">Chi tiết lớp học</DialogTitle>

            <DialogDescription>
              Thông tin lớp và danh sách học viên.
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="space-y-5 py-2">
              {/* THÔNG TIN LỚP */}
              <div className="rounded-2xl bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      {selectedClass.name}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      HLV: {selectedClass.coach}
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className={getStatusClass(selectedClass.status)}
                  >
                    {selectedClass.status}
                  </Badge>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <CalendarDays className="h-4 w-4 text-slate-400" />

                    {selectedClass.schedule}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock className="h-4 w-4 text-slate-400" />

                    {selectedClass.time}
                  </div>
                </div>
              </div>

              {/* GHI CHÚ */}
              {selectedClass.note && (
                <div className="rounded-xl border p-4">
                  <p className="text-xs text-slate-400">Ghi chú</p>

                  <p className="mt-1 text-sm font-medium text-slate-700">
                    {selectedClass.note}
                  </p>
                </div>
              )}

              {/* HỌC VIÊN */}
              <div>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Học viên trong lớp
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {getStudentsInClass(selectedClass).length} học viên
                    </p>
                  </div>

                  {!isStaff && (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={handleOpenAddStudent}
                    >
                      <Plus className="h-4 w-4" />
                      Thêm học viên
                    </Button>
                  )}
                </div>

                <div className="overflow-hidden rounded-xl border">
                  {getStudentsInClass(selectedClass).length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 p-8 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                        <Users className="h-5 w-5 text-slate-400" />
                      </div>

                      <p className="font-medium text-slate-700">
                        Lớp chưa có học viên
                      </p>

                      <p className="text-sm text-slate-400">
                        Thêm học viên để bắt đầu quản lý lớp.
                      </p>
                    </div>
                  ) : (
                    getStudentsInClass(selectedClass).map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between border-b p-3 last:border-b-0"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
                            {index + 1}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {student.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-500">
                              {student.belt} · {student.phone}
                            </p>
                          </div>
                        </div>

                        {!isStaff && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Đưa ra khỏi lớp"
                            onClick={() => handleRemoveStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setViewOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =================================================
          DIALOG: THÊM HỌC VIÊN VÀO LỚP
      ================================================= */}

      <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm học viên vào lớp</DialogTitle>

            <DialogDescription>
              {selectedClass
                ? `Chọn học viên muốn thêm vào "${selectedClass.name}".`
                : "Chọn học viên muốn thêm vào lớp."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* SEARCH */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <Input
                placeholder="Tìm tên hoặc số điện thoại..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* STUDENTS */}
            <div className="max-h-[350px] overflow-y-auto rounded-xl border">
              {availableStudents.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="mx-auto h-8 w-8 text-slate-300" />

                  <p className="mt-2 text-sm font-medium text-slate-700">
                    Không có học viên phù hợp
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Thử tìm kiếm với thông tin khác.
                  </p>
                </div>
              ) : (
                availableStudents.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    className="flex w-full items-center justify-between border-b p-3 text-left transition last:border-b-0 hover:bg-slate-50"
                    onClick={() => handleAddStudentToClass(student.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                        {student.name.charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <p className="font-medium text-slate-900">
                          {student.name}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-500">
                          {student.belt} · {student.phone}
                        </p>
                      </div>
                    </div>

                    <Plus className="h-4 w-4 text-slate-400" />
                  </button>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddStudentOpen(false);
                setStudentSearch("");
              }}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
