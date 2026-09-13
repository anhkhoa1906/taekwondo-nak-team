"use client";

import { useMemo, useState } from "react";
import { useStudents } from "@/context/student-context";
import { useClasses } from "@/context/class-context";
import type { ClassItem } from "@/context/class-context";
import { useCoaches } from "@/context/coach-context";
import { useRole } from "@/hooks/use-role";

import {
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  CalendarDays,
  Clock,
} from "lucide-react";

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

const scheduleOptions = [
  "Thứ 2 - 4 - 6",
  "Thứ 3 - 5 - 7",
  "Thứ 2 - 4",
  "Thứ 3 - 5",
  "Thứ 7 - Chủ nhật",
];

const statusOptions = ["Đang hoạt động", "Tạm nghỉ"];

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

  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [addStudentOpen, setAddStudentOpen] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");

  const [newClass, setNewClass] = useState<NewClass>({
    name: "",
    coach: "",
    schedule: "",
    time: "",
    status: "Đang hoạt động",
    note: "",
  });

  // =========================
  // FILTER
  // =========================

  const filteredClasses = useMemo(() => {
    return classes.filter((item) => {
      const keyword = search.toLowerCase();

      const matchSearch =
        item.name.toLowerCase().includes(keyword) ||
        item.coach.toLowerCase().includes(keyword);

      const matchStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [classes, search, statusFilter]);

  // =========================
  // RESET FORM
  // =========================

  function resetForm() {
    setNewClass({
      name: "",
      coach: "",
      schedule: "",
      time: "",
      status: "Đang hoạt động",
      note: "",
    });
  }

  // =========================
  // OPEN ADD
  // =========================

  function handleOpenAddClass() {
    setSelectedClass(null);
    resetForm();
    setOpen(true);
  }

  // =========================
  // ADD CLASS
  // =========================

  function handleAddClass() {
    if (
      !newClass.name ||
      !newClass.coach ||
      !newClass.schedule ||
      !newClass.time
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    const newItem: ClassItem = {
      id: Date.now(),
      name: newClass.name,
      coach: newClass.coach,
      schedule: newClass.schedule,
      time: newClass.time,
      status: newClass.status,
      note: newClass.note,
    };

    addClass(newItem);

    resetForm();
    setOpen(false);
  }

  // =========================
  // VIEW
  // =========================

  function handleViewClass(item: ClassItem) {
    setSelectedClass(item);
    setViewOpen(true);
  }

  // =========================
  // EDIT
  // =========================

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

  // =========================
  // UPDATE
  // =========================

  function handleUpdateClass() {
    if (!selectedClass) return;

    if (
      !newClass.name ||
      !newClass.coach ||
      !newClass.schedule ||
      !newClass.time
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc.");
      return;
    }

    updateClass({
      ...selectedClass,
      name: newClass.name,
      coach: newClass.coach,
      schedule: newClass.schedule,
      time: newClass.time,
      status: newClass.status,
      note: newClass.note,
    });
    resetForm();
    setSelectedClass(null);
    setEditOpen(false);
  }

  // =========================
  // DELETE
  // =========================

  function handleDelete(id: number) {
    const confirmDelete = window.confirm(
      "Bạn có chắc muốn xóa lớp học này không?",
    );

    if (!confirmDelete) return;

    deleteClass(id);
  }

  function getStudentsInClass(classItem: ClassItem) {
    return students.filter((student) => student.className === classItem.name);
  }
  function handleAddStudentToClass(studentId: number) {
    if (!selectedClass) return;

    const student = students.find((item) => item.id === studentId);

    if (!student) return;

    updateStudent({
      ...student,
      className: selectedClass.name,
    });

    setAddStudentOpen(false);
    setStudentSearch("");
  }

  const availableStudents = students.filter((student) => {
    const keyword = studentSearch.toLowerCase().trim();

    const matchSearch =
      student.name.toLowerCase().includes(keyword) ||
      student.phone.toLowerCase().includes(keyword);

    const notInCurrentClass =
      !selectedClass || student.className !== selectedClass.name;

    return matchSearch && notInCurrentClass;
  });

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lớp học</h1>
          <p className="text-muted-foreground">
            Quản lý danh sách lớp học của CLB Taekwondo
          </p>
        </div>

        {!isStaff && (
          <Button className="gap-2" onClick={handleOpenAddClass}>
            <Plus className="h-4 w-4" />
            Thêm lớp
          </Button>
        )}
      </div>

      {/* STATISTICS */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng số lớp</p>
              <p className="mt-1 text-2xl font-bold">{classes.length}</p>
            </div>

            <div className="rounded-lg bg-primary/10 p-3">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Lớp đang hoạt động
              </p>
              <p className="mt-1 text-2xl font-bold">
                {
                  classes.filter((item) => item.status === "Đang hoạt động")
                    .length
                }
              </p>
            </div>

            <div className="rounded-lg bg-green-500/10 p-3">
              <Clock className="h-5 w-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng học viên</p>
              <p className="mt-1 text-2xl font-bold">
                {classes.reduce(
                  (total, item) => total + getStudentsInClass(item).length,
                  0,
                )}
              </p>
            </div>

            <div className="rounded-lg bg-blue-500/10 p-3">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            placeholder="Tìm kiếm theo tên lớp hoặc HLV..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(value) => {
            if (value) {
              setStatusFilter(value);
            }
          }}
        >
          <SelectTrigger className="w-full md:w-[220px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>

            {statusOptions.map((status) => (
              <SelectItem key={status} value={status}>
                {status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">STT</TableHead>
              <TableHead>Tên lớp</TableHead>
              <TableHead>HLV phụ trách</TableHead>
              <TableHead>Lịch tập</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead className="text-center">Học viên</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredClasses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không tìm thấy lớp học.
                </TableCell>
              </TableRow>
            ) : (
              filteredClasses.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>

                  <TableCell className="font-medium">{item.name}</TableCell>

                  <TableCell>{item.coach}</TableCell>

                  <TableCell>{item.schedule}</TableCell>

                  <TableCell>{item.time}</TableCell>

                  <TableCell className="text-center">
                    <div className="inline-flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {getStudentsInClass(item).length}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        item.status === "Đang hoạt động"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {item.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Xem chi tiết"
                        onClick={() => handleViewClass(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

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
                            title="Xóa"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* =========================
          ADD DIALOG
      ========================= */}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Thêm lớp học</DialogTitle>

            <DialogDescription>Nhập thông tin lớp học mới.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* TÊN LỚP */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tên lớp *</label>

              <Input
                placeholder="Ví dụ: Lớp A"
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
            <div className="grid gap-2">
              <label className="text-sm font-medium">HLV phụ trách *</label>

              <Select
                value={newClass.coach}
                onValueChange={(value) => {
                  if (!value) return;

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

            {/* LỊCH */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Lịch tập *</label>

              <Select
                value={newClass.schedule}
                onValueChange={(value) => {
                  if (!value) return;

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
                  {scheduleOptions.map((schedule) => (
                    <SelectItem key={schedule} value={schedule}>
                      {schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GIỜ */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Thời gian *</label>

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

            {/* STATUS */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trạng thái</label>

              <Select
                value={newClass.status}
                onValueChange={(value) => {
                  if (!value) return;

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
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GHI CHÚ */}
            <div className="grid gap-2">
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

      {/* =========================
          VIEW DIALOG
      ========================= */}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Chi tiết lớp học</DialogTitle>

            <DialogDescription>
              Thông tin chi tiết và danh sách học viên của lớp.
            </DialogDescription>
          </DialogHeader>

          {selectedClass && (
            <div className="grid gap-5 py-4">
              {/* THÔNG TIN LỚP */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tên lớp</p>

                  <p className="font-medium">{selectedClass.name}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">HLV phụ trách</p>

                  <p className="font-medium">{selectedClass.coach}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Lịch tập</p>

                  <p className="font-medium">{selectedClass.schedule}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Thời gian</p>

                  <p className="font-medium">{selectedClass.time}</p>
                </div>
              </div>

              {/* TRẠNG THÁI */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Số học viên</p>

                  <p className="font-medium">
                    {getStudentsInClass(selectedClass).length} học viên
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Trạng thái</p>

                  <Badge
                    variant={
                      selectedClass.status === "Đang hoạt động"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedClass.status}
                  </Badge>
                </div>
              </div>

              {/* GHI CHÚ */}
              <div>
                <p className="text-sm text-muted-foreground">Ghi chú</p>

                <p className="font-medium">
                  {selectedClass.note || "Không có"}
                </p>
              </div>

              {/* DANH SÁCH HỌC VIÊN */}
              <div className="border-t pt-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <p className="font-medium">Học viên trong lớp</p>

                    <p className="text-sm text-muted-foreground">
                      {getStudentsInClass(selectedClass).length} học viên
                    </p>
                  </div>

                  {!isStaff && (
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={() => setAddStudentOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                      Thêm học viên
                    </Button>
                  )}
                </div>

                <div className="max-h-[250px] overflow-y-auto rounded-lg border">
                  {getStudentsInClass(selectedClass).length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      Lớp chưa có học viên.
                    </div>
                  ) : (
                    getStudentsInClass(selectedClass).map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between border-b p-3 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 text-sm text-muted-foreground">
                            {index + 1}
                          </span>

                          <div>
                            <p className="font-medium">{student.name}</p>

                            <p className="text-xs text-muted-foreground">
                              {student.belt} · {student.phone}
                            </p>
                          </div>
                        </div>

                        {!isStaff && (
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Xóa khỏi lớp"
                            onClick={() => {
                              updateStudent({
                                ...student,
                                className: "Chưa xếp lớp",
                              });
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={addStudentOpen} onOpenChange={setAddStudentOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm học viên vào {selectedClass?.name}</DialogTitle>

            <DialogDescription>
              Chọn học viên muốn thêm vào lớp.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Tìm tên hoặc số điện thoại..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="max-h-[350px] overflow-y-auto rounded-lg border">
              {availableStudents.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  Không có học viên phù hợp.
                </div>
              ) : (
                availableStudents.map((student) => (
                  <button
                    key={student.id}
                    type="button"
                    className="flex w-full items-center justify-between border-b p-3 text-left transition last:border-b-0 hover:bg-muted"
                    onClick={() => handleAddStudentToClass(student.id)}
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>

                      <p className="text-xs text-muted-foreground">
                        {student.belt} · {student.phone}
                      </p>
                    </div>

                    <Plus className="h-4 w-4 text-muted-foreground" />
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
      {/* =========================
          EDIT DIALOG
      ========================= */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa lớp học</DialogTitle>

            <DialogDescription>Cập nhật thông tin lớp học.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* TÊN */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Tên lớp *</label>

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
            <div className="grid gap-2">
              <label className="text-sm font-medium">HLV phụ trách *</label>

              <Select
                value={newClass.coach}
                onValueChange={(value) => {
                  if (!value) return;

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

            {/* LỊCH */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Lịch tập *</label>

              <Select
                value={newClass.schedule}
                onValueChange={(value) => {
                  if (!value) return;

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
                  {scheduleOptions.map((schedule) => (
                    <SelectItem key={schedule} value={schedule}>
                      {schedule}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GIỜ */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Thời gian *</label>

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

            {/* STATUS */}
            <div className="grid gap-2">
              <label className="text-sm font-medium">Trạng thái</label>

              <Select
                value={newClass.status}
                onValueChange={(value) => {
                  if (!value) return;

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
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* GHI CHÚ */}
            <div className="grid gap-2">
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
    </div>
  );
}
