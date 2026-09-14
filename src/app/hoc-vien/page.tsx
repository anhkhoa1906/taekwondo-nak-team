"use client";

import { useMemo, useRef, useState } from "react";

import {
  Camera,
  Eye,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

import { useStudents, type Student } from "@/context/student-context";

import { useClasses } from "@/context/class-context";
import { BELT_NAMES } from "@/context/belt-context";
import { useRole } from "@/hooks/use-role";

import { createClient } from "@/lib/supabase/client";

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

// =====================================================
// TYPES
// =====================================================

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
  avatarUrl: string;
};

// =====================================================
// DEFAULT FORM
// =====================================================

const EMPTY_STUDENT: NewStudent = {
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
  avatarUrl: "",
};

// =====================================================
// BELT
// =====================================================

function getBeltClass(belt: string) {
  switch (belt) {
    case "Trắng":
      return "bg-slate-50 text-slate-700 border-slate-300";

    case "Trắng 1 vạch":
      return "bg-slate-100 text-slate-700 border-slate-300";

    case "Trắng 2 vạch":
      return "bg-slate-200 text-slate-700 border-slate-300";

    case "Vàng":
      return "bg-yellow-100 text-yellow-700 border-yellow-300";

    case "Xanh lá":
      return "bg-green-100 text-green-700 border-green-300";

    case "Xanh dương":
      return "bg-blue-100 text-blue-700 border-blue-300";

    case "Đỏ cấp 4":
      return "bg-red-100 text-red-700 border-red-300";

    case "Đỏ cấp 3":
      return "bg-red-200 text-red-700 border-red-400";

    case "Đỏ cấp 2":
      return "bg-red-300 text-red-800 border-red-500";

    case "Đỏ cấp 1":
      return "bg-red-400 text-red-900 border-red-600";

    case "Đen":
      return "bg-slate-800 text-white border-slate-800";

    default:
      return "";
  }
}

// =====================================================
// STATUS
// =====================================================

function getStatusClass(status: string) {
  if (status === "Đang tập") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }

  return "bg-red-100 text-red-700 border-red-200";
}

// =====================================================
// AVATAR
// =====================================================

function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((item) => item.charAt(0))
      .join("")
      .toUpperCase() || "HV";

  const sizeClass =
    size === "sm"
      ? "h-9 w-9 text-[10px]"
      : size === "lg"
        ? "h-24 w-24 text-xl"
        : size === "xl"
          ? "h-32 w-32 text-2xl"
          : "h-11 w-11 text-xs";

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full object-cover ring-2 ring-white shadow-md`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-950 font-black text-white shadow-md`}
    >
      {initials}
    </div>
  );
}

// =====================================================
// PAGE
// =====================================================

export default function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useStudents();

  const { classes } = useClasses();

  const { isStaff } = useRole();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState("");

  const [beltFilter, setBeltFilter] = useState("all");

  const [beltSort, setBeltSort] = useState<"none" | "asc" | "desc">("none");

  const [classFilter, setClassFilter] = useState("all");

  const [statusFilter, setStatusFilter] = useState("all");

  const [open, setOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [newStudent, setNewStudent] = useState<NewStudent>(EMPTY_STUDENT);

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [avatarError, setAvatarError] = useState("");

  // ===================================================
  // FILTER
  // ===================================================

  const filteredStudents = useMemo(() => {
    // Thứ tự cấp đai từ thấp → cao
    const beltOrder: Record<string, number> = {
      Trắng: 1,
      "Trắng 1 vạch": 2,
      "Trắng 2 vạch": 3,
      Vàng: 4,
      "Xanh lá": 5,
      "Xanh dương": 6,
      "Đỏ cấp 4": 7,
      "Đỏ cấp 3": 8,
      "Đỏ cấp 2": 9,
      "Đỏ cấp 1": 10,
      Đen: 11,
    };

    const result = students.filter((student) => {
      const keyword = search.toLowerCase().trim();

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

    // Không sắp xếp
    if (beltSort === "none") {
      return result;
    }

    // Sắp xếp theo cấp đai
    return [...result].sort((a, b) => {
      const beltA = beltOrder[a.belt] ?? 0;
      const beltB = beltOrder[b.belt] ?? 0;

      if (beltSort === "asc") {
        return beltA - beltB;
      }

      return beltB - beltA;
    });
  }, [students, search, beltFilter, beltSort, classFilter, statusFilter]);

  // ===================================================
  // ADD
  // ===================================================

  function handleOpenAddStudent() {
    setSelectedStudent(null);
    setNewStudent(EMPTY_STUDENT);
    setAvatarError("");
    setOpen(true);
  }

  async function handleAddStudent() {
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
      avatarUrl: newStudent.avatarUrl,
    };

    await addStudent(student);

    setNewStudent(EMPTY_STUDENT);
    setOpen(false);
  }

  // ===================================================
  // EDIT
  // ===================================================

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
      avatarUrl: student.avatarUrl,
    });

    setAvatarError("");
    setEditOpen(true);
  }

  async function handleUpdateStudent() {
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

    await updateStudent({
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
      avatarUrl: newStudent.avatarUrl,
    });

    setEditOpen(false);
    setSelectedStudent(null);
  }

  // ===================================================
  // DELETE
  // ===================================================

  async function handleDelete(id: number) {
    const student = students.find((item) => item.id === id);

    if (!student) return;

    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa học viên "${student.name}" không?`,
    );

    if (!confirmed) return;

    await deleteStudent(id);
  }

  // ===================================================
  // VIEW
  // ===================================================

  function handleViewStudent(student: Student) {
    setSelectedStudent(student);
    setViewOpen(true);
  }

  // ===================================================
  // UPLOAD AVATAR
  // ===================================================

  async function handleAvatarUpload(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setAvatarError("");

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError("Ảnh không được vượt quá 2MB.");
      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setAvatarError("Chỉ hỗ trợ JPG, PNG hoặc WEBP.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const supabase = createClient();

      const extension = file.name.split(".").pop() || "jpg";

      const fileName = `${crypto.randomUUID()}.${extension}`;

      const filePath = `students/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("student-avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Lỗi upload avatar:", uploadError);

        setAvatarError("Không thể tải ảnh lên. Vui lòng thử lại.");

        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("student-avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      setNewStudent((prev) => ({
        ...prev,
        avatarUrl: publicUrl,
      }));
    } catch (error) {
      console.error(error);

      setAvatarError("Có lỗi xảy ra khi tải ảnh.");
    } finally {
      setUploadingAvatar(false);
    }
  }

  // ===================================================
  // REMOVE AVATAR
  // ===================================================

  function handleRemoveAvatar() {
    setNewStudent((prev) => ({
      ...prev,
      avatarUrl: "",
    }));
  }

  // ===================================================
  // AVATAR SECTION
  // ===================================================

  function AvatarUploadSection({ editing = false }: { editing?: boolean }) {
    return (
      <div className="mb-2 rounded-2xl border bg-slate-50 p-5">
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative">
            <Avatar
              name={newStudent.name || "Học viên"}
              src={newStudent.avatarUrl}
              size="xl"
            />

            {!newStudent.avatarUrl && (
              <div className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 bg-slate-900 text-white shadow-md">
                <Camera className="h-4 w-4" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="font-semibold text-slate-900">Ảnh đại diện</p>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {editing
                ? "Bạn có thể thay đổi ảnh đại diện bất cứ lúc nào."
                : "Thêm ảnh để dễ nhận diện học viên trong danh sách."}
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={uploadingAvatar}
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 rounded-xl"
              >
                {uploadingAvatar ? (
                  <>
                    <Upload className="h-4 w-4 animate-pulse" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <ImagePlus className="h-4 w-4" />
                    {newStudent.avatarUrl ? "Đổi ảnh" : "Thêm ảnh"}
                  </>
                )}
              </Button>

              {newStudent.avatarUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploadingAvatar}
                  onClick={handleRemoveAvatar}
                  className="gap-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                  Xóa ảnh
                </Button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleAvatarUpload}
            />

            <p className="mt-2 text-[11px] text-slate-400">
              JPG, PNG, WEBP · tối đa 2MB
            </p>

            {avatarError && (
              <p className="mt-2 text-xs font-medium text-red-600">
                {avatarError}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ===================================================
  // FORM
  // ===================================================

  function renderStudentFormFields() {
    return (
      <>
        {/* NAME */}
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

        {/* BIRTH */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Ngày sinh <span className="text-red-500">*</span>
          </label>

          <Input
            type={editOpen ? "text" : "date"}
            placeholder={editOpen ? "DD/MM/YYYY" : undefined}
            value={newStudent.birthDate}
            onChange={(e) =>
              setNewStudent({
                ...newStudent,
                birthDate: e.target.value,
              })
            }
          />
        </div>

        {/* GENDER */}
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

        {/* PHONE */}
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

        {/* ADDRESS */}
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

        {/* JOIN DATE */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Ngày tham gia <span className="text-red-500">*</span>
          </label>

          <Input
            type={editOpen ? "text" : "date"}
            placeholder={editOpen ? "DD/MM/YYYY" : undefined}
            value={newStudent.joinDate}
            onChange={(e) =>
              setNewStudent({
                ...newStudent,
                joinDate: e.target.value,
              })
            }
          />
        </div>

        {/* CLASS */}
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
              {classes.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* BELT */}
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
              {BELT_NAMES.map((belt) => (
                <SelectItem key={belt} value={belt}>
                  {belt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* STATUS */}
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

        {/* NOTE */}
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
      </>
    );
  }

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="space-y-6">
      {/* HEADER */}

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

        {/* ADD */}

        {!isStaff && (
          <Dialog open={open} onOpenChange={setOpen}>
            <Button className="gap-2" onClick={handleOpenAddStudent}>
              <Plus className="h-4 w-4" />
              Thêm học viên
            </Button>

            <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Thêm học viên</DialogTitle>

                <DialogDescription>
                  Nhập thông tin học viên mới vào hệ thống.
                </DialogDescription>
              </DialogHeader>

              <AvatarUploadSection />

              <div className="grid gap-4 py-2 md:grid-cols-2">
                {renderStudentFormFields()}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Hủy
                </Button>

                <Button disabled={uploadingAvatar} onClick={handleAddStudent}>
                  Lưu học viên
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* EDIT */}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa học viên</DialogTitle>

            <DialogDescription>
              Cập nhật thông tin và ảnh đại diện học viên.
            </DialogDescription>
          </DialogHeader>

          <AvatarUploadSection editing />

          <div className="grid gap-4 py-2 md:grid-cols-2">
            {renderStudentFormFields()}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Hủy
            </Button>

            <Button disabled={uploadingAvatar} onClick={handleUpdateStudent}>
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FILTER */}

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* SEARCH */}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <Input
              className="pl-9"
              placeholder="Tìm tên, số điện thoại..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* BELT FILTER */}

          <Select
            value={beltFilter}
            onValueChange={(value) => setBeltFilter(value ?? "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Cấp đai" />
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

          {/* BELT SORT */}

          <Select
            value={beltSort}
            onValueChange={(value) =>
              setBeltSort((value as "none" | "asc" | "desc") ?? "none")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sắp xếp cấp đai" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="none">Không sắp xếp</SelectItem>

              <SelectItem value="desc">Cấp đai cao → thấp</SelectItem>

              <SelectItem value="asc">Cấp đai thấp → cao</SelectItem>
            </SelectContent>
          </Select>

          {/* CLASS */}

          <Select
            value={classFilter}
            onValueChange={(value) => setClassFilter(value ?? "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Lớp học" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">Tất cả lớp</SelectItem>

              {classes.map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* STATUS */}

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "all")}
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

      {/* TABLE */}

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
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={student.name}
                        src={student.avatarUrl}
                        size="sm"
                      />

                      <div className="min-w-0">
                        <div className="font-medium text-slate-900">
                          {student.name}
                        </div>

                        <div className="text-xs text-slate-400">
                          Tham gia {student.joinDate}
                        </div>
                      </div>
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
                      {/* VIEW */}

                      <Button
                        variant="ghost"
                        size="icon"
                        title="Xem chi tiết"
                        onClick={() => handleViewStudent(student)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>

                      {/* EDIT / DELETE */}

                      {!isStaff && (
                        <>
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
                        </>
                      )}
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

        {/* FOOTER */}

        <div className="flex items-center justify-between border-t px-4 py-4 text-sm text-slate-500">
          <span>
            Hiển thị {filteredStudents.length} / {students.length} học viên
          </span>

          <span>
            Tổng cộng:{" "}
            <strong className="text-slate-900">{students.length}</strong>
          </span>
        </div>
      </div>

      {/* VIEW */}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Thông tin học viên</DialogTitle>

            <DialogDescription>
              Chi tiết thông tin học viên trong CLB.
            </DialogDescription>
          </DialogHeader>

          {selectedStudent && (
            <div className="py-2">
              {/* PROFILE HEADER */}

              <div className="mb-6 flex flex-col items-center rounded-2xl bg-slate-50 p-5">
                <Avatar
                  name={selectedStudent.name}
                  src={selectedStudent.avatarUrl}
                  size="xl"
                />

                <h3 className="mt-3 text-lg font-bold text-slate-900">
                  {selectedStudent.name}
                </h3>

                <div className="mt-2">
                  <Badge
                    variant="outline"
                    className={getBeltClass(selectedStudent.belt)}
                  >
                    {selectedStudent.belt}
                  </Badge>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <InfoItem label="Số điện thoại" value={selectedStudent.phone} />

                <InfoItem label="Ngày sinh" value={selectedStudent.birthDate} />

                <InfoItem label="Giới tính" value={selectedStudent.gender} />

                <InfoItem label="Lớp học" value={selectedStudent.className} />

                <InfoItem
                  label="Trạng thái"
                  value={selectedStudent.status}
                  badge
                />

                <InfoItem
                  label="Ngày tham gia"
                  value={selectedStudent.joinDate}
                />

                <div className="md:col-span-2">
                  <InfoItem
                    label="Địa chỉ"
                    value={selectedStudent.address || "Chưa cập nhật"}
                  />
                </div>

                <div className="md:col-span-2">
                  <InfoItem
                    label="Ghi chú"
                    value={selectedStudent.note || "Không có ghi chú"}
                  />
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
    </div>
  );
}

// =====================================================
// INFO ITEM
// =====================================================

function InfoItem({
  label,
  value,
  badge = false,
}: {
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">{label}</p>

      {badge ? (
        <Badge variant="outline" className={`mt-1 ${getStatusClass(value)}`}>
          {value}
        </Badge>
      ) : (
        <p className="mt-1 font-medium text-slate-900">{value}</p>
      )}
    </div>
  );
}
