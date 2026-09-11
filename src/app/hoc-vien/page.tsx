"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, Users } from "lucide-react";
import { useStudents, type Student } from "@/context/student-context";

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

type NewStudent = {
  name: string;
  birthDate: string;
  gender: string;
  phone: string;
  address: string;
  joinDate: string;
  className: string;
  belt: string;
  status: string;
  note: string;
};

const beltOptions = ["Trắng", "Vàng", "Xanh", "Đỏ", "Đen"];
const classOptions = ["Lớp A", "Lớp B", "Lớp C"];

function getBeltClass(belt: string) {
  switch (belt) {
    case "Trắng":
      return "bg-slate-100 text-slate-700 border-slate-200";
    case "Vàng":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "Xanh":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Đỏ":
      return "bg-red-100 text-red-700 border-red-200";
    case "Đen":
      return "bg-slate-800 text-white border-slate-800";
    default:
      return "";
  }
}

function getStatusClass(status: string) {
  if (status === "Đang tập") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-red-100 text-red-700 border-red-200";
}

export default function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useStudents();

  const [search, setSearch] = useState("");
  const [beltFilter, setBeltFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [newStudent, setNewStudent] = useState<NewStudent>({
    name: "",
    birthDate: "",
    gender: "",
    phone: "",
    address: "",
    joinDate: "",
    className: "",
    belt: "",
    status: "Đang tập",
    note: "",
  });

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const keyword = search.toLowerCase();

      const matchesSearch =
        student.name.toLowerCase().includes(keyword) ||
        student.phone.toLowerCase().includes(keyword);

      const matchesBelt = beltFilter === "all" || student.belt === beltFilter;

      const matchesClass =
        classFilter === "all" || student.className === classFilter;

      const matchesStatus =
        statusFilter === "all" || student.status === statusFilter;

      return matchesSearch && matchesBelt && matchesClass && matchesStatus;
    });
  }, [students, search, beltFilter, classFilter, statusFilter]);

  function handleOpenAddStudent() {
    setSelectedStudent(null);

    setNewStudent({
      name: "",
      birthDate: "",
      gender: "",
      phone: "",
      address: "",
      joinDate: "",
      className: "",
      belt: "",
      status: "Đang tập",
      note: "",
    });

    setOpen(true);
  }

  function handleAddStudent() {
    if (
      !newStudent.name ||
      !newStudent.birthDate ||
      !newStudent.gender ||
      !newStudent.phone ||
      !newStudent.joinDate ||
      !newStudent.belt
    ) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    const student: Student = {
      id: Date.now(),
      name: newStudent.name,
      phone: newStudent.phone,
      birthDate: newStudent.birthDate,
      gender: newStudent.gender,
      className: newStudent.className || "Chưa xếp lớp",
      belt: newStudent.belt,
      status: newStudent.status,
      address: newStudent.address,
      joinDate: newStudent.joinDate,
      note: newStudent.note,
    };

    addStudent(student);

    setNewStudent({
      name: "",
      birthDate: "",
      gender: "",
      phone: "",
      address: "",
      joinDate: "",
      className: "",
      belt: "",
      status: "Đang tập",
      note: "",
    });

    setOpen(false);
  }

  function handleEditStudent(student: Student) {
    setSelectedStudent(student);

    setNewStudent({
      name: student.name,
      birthDate: student.birthDate,
      gender: student.gender,
      phone: student.phone,
      address: student.address,
      joinDate: student.joinDate,
      className: student.className,
      belt: student.belt,
      status: student.status,
      note: student.note,
    });

    setEditOpen(true);
  }

  function handleUpdateStudent() {
    if (!selectedStudent) return;

    if (
      !newStudent.name ||
      !newStudent.birthDate ||
      !newStudent.gender ||
      !newStudent.phone ||
      !newStudent.joinDate ||
      !newStudent.belt
    ) {
      alert("Vui lòng nhập đầy đủ các thông tin bắt buộc.");
      return;
    }

    updateStudent({
      ...selectedStudent,
      name: newStudent.name,
      birthDate: newStudent.birthDate,
      gender: newStudent.gender,
      phone: newStudent.phone,
      address: newStudent.address,
      joinDate: newStudent.joinDate,
      className: newStudent.className || "Chưa xếp lớp",
      belt: newStudent.belt,
      status: newStudent.status,
      note: newStudent.note,
    });

    setEditOpen(false);
    setSelectedStudent(null);
  }

  function handleDelete(id: number) {
    const student = students.find((item) => item.id === id);

    if (!student) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa học viên "${student.name}" không?`,
    );

    if (!confirmed) return;

    deleteStudent(id);
  }
  function handleViewStudent(student: Student) {
    setSelectedStudent(student);
    setViewOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Users className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Học viên
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Quản lý danh sách học viên của CLB Taekwondo
              </p>
            </div>
          </div>
        </div>

        {/* Add student */}
        <Dialog open={open} onOpenChange={setOpen}>
          <Button className="gap-2" onClick={handleOpenAddStudent}>
            <Plus className="h-4 w-4" />
            Thêm học viên
          </Button>

          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm học viên</DialogTitle>

              <DialogDescription>
                Nhập thông tin học viên mới vào hệ thống.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4 md:grid-cols-2">
              {/* Họ tên */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Họ và tên <span className="text-red-500">*</span>
                </label>

                <Input
                  placeholder="Nguyễn Văn A"
                  value={newStudent.name}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Ngày sinh */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ngày sinh <span className="text-red-500">*</span>
                </label>

                <Input
                  type="date"
                  value={newStudent.birthDate}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      birthDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* Giới tính */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Giới tính <span className="text-red-500">*</span>
                </label>

                <Select
                  value={newStudent.gender}
                  onValueChange={(value) =>
                    setNewStudent({
                      ...newStudent,
                      gender: value ?? "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Số điện thoại */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Số điện thoại <span className="text-red-500">*</span>
                </label>

                <Input
                  placeholder="0901 234 567"
                  value={newStudent.phone}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      phone: e.target.value,
                    })
                  }
                />
              </div>

              {/* Địa chỉ */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Địa chỉ</label>

                <Input
                  placeholder="Nhập địa chỉ"
                  value={newStudent.address}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      address: e.target.value,
                    })
                  }
                />
              </div>

              {/* Ngày tham gia */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Ngày tham gia <span className="text-red-500">*</span>
                </label>

                <Input
                  type="date"
                  value={newStudent.joinDate}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
                      joinDate: e.target.value,
                    })
                  }
                />
              </div>

              {/* Lớp học */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Lớp học</label>

                <Select
                  value={newStudent.className}
                  onValueChange={(value) =>
                    setNewStudent({
                      ...newStudent,
                      className: value ?? "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp học" />
                  </SelectTrigger>

                  <SelectContent>
                    {classOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Cấp đai */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Cấp đai <span className="text-red-500">*</span>
                </label>

                <Select
                  value={newStudent.belt}
                  onValueChange={(value) =>
                    setNewStudent({
                      ...newStudent,
                      belt: value ?? "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp đai" />
                  </SelectTrigger>

                  <SelectContent>
                    {beltOptions.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Trạng thái */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>

                <Select
                  value={newStudent.status}
                  onValueChange={(value) =>
                    setNewStudent({
                      ...newStudent,
                      status: value ?? "",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Đang tập">Đang tập</SelectItem>

                    <SelectItem value="Hết hạn">Hết hạn</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ghi chú */}
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium">Ghi chú</label>

                <Input
                  placeholder="Nhập ghi chú nếu có"
                  value={newStudent.note}
                  onChange={(e) =>
                    setNewStudent({
                      ...newStudent,
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

              <Button onClick={handleAddStudent}>Lưu học viên</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit student */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa học viên</DialogTitle>

            <DialogDescription>Cập nhật thông tin học viên.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 md:grid-cols-2">
            {/* Họ tên */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Họ và tên <span className="text-red-500">*</span>
              </label>

              <Input
                value={newStudent.name}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    name: e.target.value,
                  })
                }
              />
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ngày sinh <span className="text-red-500">*</span>
              </label>

              <Input
                type="text"
                placeholder="DD/MM/YYYY"
                value={newStudent.birthDate}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    birthDate: e.target.value,
                  })
                }
              />
            </div>

            {/* Giới tính */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Giới tính <span className="text-red-500">*</span>
              </label>

              <Select
                value={newStudent.gender}
                onValueChange={(value) =>
                  setNewStudent({
                    ...newStudent,
                    gender: value ?? "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Nam">Nam</SelectItem>
                  <SelectItem value="Nữ">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Số điện thoại */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Số điện thoại <span className="text-red-500">*</span>
              </label>

              <Input
                value={newStudent.phone}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    phone: e.target.value,
                  })
                }
              />
            </div>

            {/* Địa chỉ */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Địa chỉ</label>

              <Input
                value={newStudent.address}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    address: e.target.value,
                  })
                }
              />
            </div>

            {/* Ngày tham gia */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ngày tham gia <span className="text-red-500">*</span>
              </label>

              <Input
                type="text"
                placeholder="DD/MM/YYYY"
                value={newStudent.joinDate}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    joinDate: e.target.value,
                  })
                }
              />
            </div>

            {/* Lớp học */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Lớp học</label>

              <Select
                value={newStudent.className}
                onValueChange={(value) =>
                  setNewStudent({
                    ...newStudent,
                    className: value ?? "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn lớp học" />
                </SelectTrigger>

                <SelectContent>
                  {classOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Cấp đai */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Cấp đai <span className="text-red-500">*</span>
              </label>

              <Select
                value={newStudent.belt}
                onValueChange={(value) =>
                  setNewStudent({
                    ...newStudent,
                    belt: value ?? "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn cấp đai" />
                </SelectTrigger>

                <SelectContent>
                  {beltOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Trạng thái */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>

              <Select
                value={newStudent.status}
                onValueChange={(value) =>
                  setNewStudent({
                    ...newStudent,
                    status: value ?? "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Đang tập">Đang tập</SelectItem>
                  <SelectItem value="Hết hạn">Hết hạn</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Ghi chú */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Ghi chú</label>

              <Input
                value={newStudent.note}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
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

            <Button onClick={handleUpdateStudent}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              className="pl-9"
              placeholder="Tìm tên, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Belt */}
          <Select
            value={beltFilter}
            onValueChange={(value) => setBeltFilter(value ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cấp đai" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả cấp đai</SelectItem>

              {beltOptions.map((belt) => (
                <SelectItem key={belt} value={belt}>
                  Đai {belt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Class */}
          <Select
            value={classFilter}
            onValueChange={(value) => setClassFilter(value ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Lớp học" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>

              {classOptions.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>

              <SelectItem value="Đang tập">Đang tập</SelectItem>

              <SelectItem value="Hết hạn">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">STT</TableHead>

              <TableHead>Họ và tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Ngày sinh</TableHead>
              <TableHead>Giới tính</TableHead>
              <TableHead>Lớp học</TableHead>
              <TableHead>Cấp đai</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student, index) => (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>

                  <TableCell>
                    <div className="font-medium text-slate-900">
                      {student.name}
                    </div>

                    <div className="text-xs text-slate-400">
                      Tham gia {student.joinDate}
                    </div>
                  </TableCell>

                  <TableCell>{student.phone}</TableCell>

                  <TableCell>{student.birthDate}</TableCell>

                  <TableCell>{student.gender}</TableCell>

                  <TableCell>{student.className}</TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getBeltClass(student.belt)}
                    >
                      {student.belt}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusClass(student.status)}
                    >
                      {student.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Xem chi tiết"
                        onClick={() => handleViewStudent(student)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Chỉnh sửa"
                        onClick={() => handleEditStudent(student)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Xóa"
                        onClick={() => handleDelete(student.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-slate-500"
                >
                  Không tìm thấy học viên.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Footer */}
        <div className="flex items-center justify-between border-t px-4 py-4 text-sm text-slate-500">
          <span>
            Hiển thị {filteredStudents.length} / {students.length} học viên
          </span>

          <span>
            Tổng cộng:{" "}
            <strong className="text-slate-900">{students.length}</strong>
          </span>
        </div>
        {/* View student */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Thông tin học viên</DialogTitle>
              <DialogDescription>
                Chi tiết thông tin học viên trong CLB.
              </DialogDescription>
            </DialogHeader>

            {selectedStudent && (
              <div className="grid gap-4 py-4 md:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-500">Họ và tên</p>
                  <p className="font-medium">{selectedStudent.name}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Số điện thoại</p>
                  <p className="font-medium">{selectedStudent.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Ngày sinh</p>
                  <p className="font-medium">{selectedStudent.birthDate}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Giới tính</p>
                  <p className="font-medium">{selectedStudent.gender}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Lớp học</p>
                  <p className="font-medium">{selectedStudent.className}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Cấp đai</p>
                  <Badge
                    variant="outline"
                    className={getBeltClass(selectedStudent.belt)}
                  >
                    {selectedStudent.belt}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Trạng thái</p>
                  <Badge
                    variant="outline"
                    className={getStatusClass(selectedStudent.status)}
                  >
                    {selectedStudent.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-slate-500">Ngày tham gia</p>
                  <p className="font-medium">{selectedStudent.joinDate}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500">Địa chỉ</p>
                  <p className="font-medium">
                    {selectedStudent.address || "Chưa cập nhật"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500">Ghi chú</p>
                  <p className="font-medium">
                    {selectedStudent.note || "Không có ghi chú"}
                  </p>
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
      </div>
    </div>
  );
}
