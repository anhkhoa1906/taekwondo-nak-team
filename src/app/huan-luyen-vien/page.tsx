"use client";

import {
  Award,
  CalendarDays,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";

import { createClient } from "@/lib/supabase/client";

import { useStudents } from "@/context/student-context";
import { useTuition } from "@/context/tuition-context";
import { useAttendance } from "@/context/attendance-context";
import { useClasses } from "@/context/class-context";
import { useCoaches, type Coach } from "@/context/coach-context";
import { useClub } from "@/context/club-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

// =====================================================
// OPTIONS
// =====================================================

const statusOptions = ["Đang hoạt động", "Tạm nghỉ"];

const specializationOptions = ["Taekwondo", "Kyorugi", "Poomsae"];

// =====================================================
// TYPES
// =====================================================

type NewCoach = {
  name: string;
  phone: string;
  birthDate: string;
  gender: string;
  specialization: string;
  joinDate: string;
  status: string;
  note: string;
  avatarUrl: string;
};

type CoachFormProps = {
  newCoach: NewCoach;
  setNewCoach: React.Dispatch<React.SetStateAction<NewCoach>>;

  avatarFile: File | null;

  setAvatarFile: React.Dispatch<React.SetStateAction<File | null>>;

  avatarPreview: string;

  editingCoach: Coach | null;
};

// =====================================================
// HELPERS
// =====================================================

function getToday() {
  return new Date().toISOString().split("T")[0];
}

function formatDateForInput(date: string) {
  if (!date) return "";

  const parts = date.split("/");

  if (parts.length === 3) {
    const [day, month, year] = parts;

    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  return date;
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/);

  if (!words.length || !words[0]) {
    return "?";
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function getStatusClass(status: string) {
  if (status === "Đang hoạt động") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-600";
}

function getSpecializationClass(specialization: string) {
  if (specialization === "Kyorugi") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (specialization === "Poomsae") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

// =====================================================
// COACH FORM
// =====================================================
//
// Component nằm ngoài page để tránh remount.
// Không bị mất focus khi nhập.
// =====================================================

function CoachForm({
  newCoach,
  setNewCoach,
  avatarFile,
  setAvatarFile,
  avatarPreview,
  editingCoach,
}: CoachFormProps) {
  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file ảnh.");
      event.target.value = "";
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      alert("Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP.");

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Ảnh không được vượt quá 2MB.");

      event.target.value = "";
      return;
    }

    setAvatarFile(file);
  }

  function handleRemoveAvatar() {
    setAvatarFile(null);

    setNewCoach((prev) => ({
      ...prev,
      avatarUrl: "",
    }));
  }

  return (
    <div className="max-h-[70vh] overflow-y-auto pr-2">
      <div className="space-y-6 py-2">
        {/* AVATAR */}

        <div className="rounded-2xl border bg-slate-50 p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Ảnh đại diện</h3>

            <p className="mt-1 text-xs text-muted-foreground">
              {editingCoach
                ? "Bạn có thể đổi hoặc xóa ảnh đại diện hiện tại."
                : "Thêm ảnh đại diện cho huấn luyện viên."}
            </p>
          </div>

          <div className="flex flex-col items-center gap-5 sm:flex-row">
            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-slate-200 shadow-sm">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Ảnh đại diện HLV"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-12 w-12 text-slate-400" />
              )}
            </div>

            <div className="flex flex-col items-center gap-3 sm:items-start">
              <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                <label
                  htmlFor="coach-avatar"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                >
                  <Upload className="h-4 w-4" />

                  {editingCoach ? "Đổi ảnh" : "Chọn ảnh"}
                </label>

                {avatarPreview && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Xóa ảnh
                  </Button>
                )}
              </div>

              <input
                id="coach-avatar"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <p className="text-xs text-muted-foreground">
                JPG, PNG hoặc WEBP · Tối đa 2MB
              </p>

              {avatarFile && (
                <p className="max-w-[280px] truncate text-xs font-medium text-emerald-600">
                  Đã chọn: {avatarFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* PERSONAL */}

        <div>
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">Thông tin cá nhân</h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Thông tin cơ bản của huấn luyện viên.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Họ và tên <span className="text-red-500">*</span>
              </label>

              <Input
                value={newCoach.name}
                onChange={(e) =>
                  setNewCoach((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Số điện thoại <span className="text-red-500">*</span>
              </label>

              <Input
                type="tel"
                value={newCoach.phone}
                onChange={(e) =>
                  setNewCoach((prev) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                placeholder="0901 234 567"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ngày sinh <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="date"
                  value={newCoach.birthDate}
                  onChange={(e) =>
                    setNewCoach((prev) => ({
                      ...prev,
                      birthDate: e.target.value,
                    }))
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Giới tính <span className="text-red-500">*</span>
              </label>

              <Select
                value={newCoach.gender}
                onValueChange={(value) =>
                  setNewCoach((prev) => ({
                    ...prev,
                    gender: value ?? "",
                  }))
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
          </div>
        </div>

        {/* PROFESSIONAL */}

        <div className="border-t pt-5">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-900">
              Thông tin chuyên môn
            </h3>

            <p className="mt-1 text-xs text-muted-foreground">
              Chuyên môn và trạng thái làm việc tại CLB.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chuyên môn</label>

              <Select
                value={newCoach.specialization}
                onValueChange={(value) =>
                  setNewCoach((prev) => ({
                    ...prev,
                    specialization: value ?? "",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chuyên môn" />
                </SelectTrigger>

                <SelectContent>
                  {specializationOptions.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Ngày tham gia <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="date"
                  value={newCoach.joinDate}
                  onChange={(e) =>
                    setNewCoach((prev) => ({
                      ...prev,
                      joinDate: e.target.value,
                    }))
                  }
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>

              <Select
                value={newCoach.status}
                onValueChange={(value) =>
                  setNewCoach((prev) => ({
                    ...prev,
                    status: value ?? "",
                  }))
                }
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Ghi chú</label>

              <Input
                value={newCoach.note}
                onChange={(e) =>
                  setNewCoach((prev) => ({
                    ...prev,
                    note: e.target.value,
                  }))
                }
                placeholder="Ghi chú..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// =====================================================
// PAGE
// =====================================================

export default function HuanLuyenVienPage() {
  const { coaches, addCoach, updateCoach, deleteCoach } = useCoaches();

  const { classes } = useClasses();

  const { students } = useStudents();

  const { getAllTuition } = useTuition();

  const { getTodayAttendanceSummary } = useAttendance();

  const { club } = useClub();

  // ===================================================
  // ROLE / ACCESS
  // ===================================================

  const canManage =
    club?.role === "admin" ||
    (club?.role === "coach" && club.accessLevel === "manage");

  const isStaff = club?.role === "staff";

  // ===================================================
  // STATE
  // ===================================================

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("all");

  const [open, setOpen] = useState(false);

  const [viewOpen, setViewOpen] = useState(false);

  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState("");

  const [saving, setSaving] = useState(false);

  const [newCoach, setNewCoach] = useState<NewCoach>({
    name: "",
    phone: "",
    birthDate: "",
    gender: "",
    specialization: "Taekwondo",
    joinDate: getToday(),
    status: "Đang hoạt động",
    note: "",
    avatarUrl: "",
  });

  // ===================================================
  // AVATAR PREVIEW
  // ===================================================

  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(newCoach.avatarUrl || "");

      return;
    }

    const objectUrl = URL.createObjectURL(avatarFile);

    setAvatarPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [avatarFile, newCoach.avatarUrl]);

  // ===================================================
  // STATS
  // ===================================================

  const stats = useMemo(() => {
    const total = coaches.length;

    const active = coaches.filter(
      (coach) => coach.status === "Đang hoạt động",
    ).length;

    const inactive = coaches.filter(
      (coach) => coach.status === "Tạm nghỉ",
    ).length;

    const kyorugi = coaches.filter(
      (coach) => coach.specialization === "Kyorugi",
    ).length;

    return {
      total,
      active,
      inactive,
      kyorugi,
    };
  }, [coaches]);

  // ===================================================
  // FILTER
  // ===================================================

  const filteredCoaches = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return coaches.filter((coach) => {
      const matchesSearch =
        !keyword ||
        coach.name.toLowerCase().includes(keyword) ||
        coach.phone.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "all" || coach.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [coaches, search, statusFilter]);

  // ===================================================
  // RESET
  // ===================================================

  function resetForm() {
    setNewCoach({
      name: "",
      phone: "",
      birthDate: "",
      gender: "",
      specialization: "Taekwondo",
      joinDate: getToday(),
      status: "Đang hoạt động",
      note: "",
      avatarUrl: "",
    });

    setAvatarFile(null);
    setAvatarPreview("");
  }

  // ===================================================
  // OPEN ADD
  // ===================================================

  function handleOpenAdd() {
    if (!canManage) {
      return;
    }

    setEditingCoach(null);
    resetForm();
    setOpen(true);
  }

  // ===================================================
  // OPEN EDIT
  // ===================================================

  function handleOpenEdit(coach: Coach) {
    if (!canManage) {
      return;
    }

    setEditingCoach(coach);

    setNewCoach({
      name: coach.name,
      phone: coach.phone,
      birthDate: formatDateForInput(coach.birthDate),
      gender: coach.gender,
      specialization: coach.specialization,
      joinDate: formatDateForInput(coach.joinDate),
      status: coach.status,
      note: coach.note,
      avatarUrl: coach.avatarUrl || "",
    });

    setAvatarFile(null);

    setAvatarPreview(coach.avatarUrl || "");

    setOpen(true);
  }

  // ===================================================
  // VIEW
  // ===================================================

  function handleOpenView(coach: Coach) {
    setSelectedCoach(coach);
    setViewOpen(true);
  }

  // ===================================================
  // UPLOAD
  // ===================================================

  async function uploadCoachAvatar(file: File) {
    if (!club?.id) {
      throw new Error("Không xác định được CLB hiện tại.");
    }

    const supabase = createClient();

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;

    const filePath = `${club.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("coach-avatars")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      console.error("Lỗi upload ảnh HLV:", uploadError);

      throw new Error(uploadError.message || "Không thể tải ảnh lên.");
    }

    const { data: publicUrlData } = supabase.storage
      .from("coach-avatars")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

  // ===================================================
  // SAVE
  // ===================================================

  async function handleSave() {
    if (!canManage) {
      alert("Bạn không có quyền quản lý HLV.");

      return;
    }

    if (!newCoach.name.trim()) {
      alert("Vui lòng nhập tên huấn luyện viên.");

      return;
    }

    if (!newCoach.phone.trim()) {
      alert("Vui lòng nhập số điện thoại.");

      return;
    }

    if (!newCoach.birthDate) {
      alert("Vui lòng chọn ngày sinh.");

      return;
    }

    if (!newCoach.gender) {
      alert("Vui lòng chọn giới tính.");

      return;
    }

    if (!newCoach.joinDate) {
      alert("Vui lòng chọn ngày tham gia.");

      return;
    }

    if (!club?.id) {
      alert("Không xác định được CLB hiện tại.");

      return;
    }

    try {
      setSaving(true);

      let avatarUrl = newCoach.avatarUrl || "";

      // ---------------------------------------------
      // UPLOAD NEW AVATAR
      // ---------------------------------------------

      if (avatarFile) {
        avatarUrl = await uploadCoachAvatar(avatarFile);
      }

      // ---------------------------------------------
      // UPDATE
      // ---------------------------------------------

      if (editingCoach) {
        const result = await updateCoach({
          ...editingCoach,
          ...newCoach,
          avatarUrl,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        alert("Đã cập nhật huấn luyện viên.");
      }

      // ---------------------------------------------
      // ADD
      // ---------------------------------------------
      else {
        const result = await addCoach({
          id: 0,
          ...newCoach,
          avatarUrl,
        });

        if (result.error) {
          throw new Error(result.error);
        }

        alert("Đã thêm huấn luyện viên.");
      }

      setOpen(false);
      setEditingCoach(null);
      resetForm();
    } catch (error) {
      console.error("Lỗi lưu HLV:", error);

      alert(
        error instanceof Error ? error.message : "Có lỗi xảy ra khi lưu HLV.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ===================================================
  // DELETE
  // ===================================================

  async function handleDelete(coach: Coach) {
    if (!canManage) {
      alert("Bạn không có quyền xóa HLV.");

      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa HLV "${coach.name}" không?`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const result = await deleteCoach(coach.id);

      if (result.error) {
        throw new Error(result.error);
      }

      if (selectedCoach?.id === coach.id) {
        setSelectedCoach(null);

        setViewOpen(false);
      }

      alert("Đã xóa huấn luyện viên.");
    } catch (error) {
      console.error("Lỗi xóa HLV:", error);

      alert(error instanceof Error ? error.message : "Không thể xóa HLV.");
    }
  }

  // ===================================================
  // CLASSES
  // ===================================================

  function getCoachClasses(coachName: string) {
    return classes.filter((classItem) => classItem.coach === coachName);
  }

  // ===================================================
  // EXTRA DATA
  // ===================================================

  const activeStudents = students.filter(
    (student) => student.status === "Đang tập",
  );

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthTuition = getAllTuition(currentMonth);

  const paidTuition = monthTuition
    .filter((item) => item.status === "Đã đóng")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const attendanceSummary = getTodayAttendanceSummary();

  // Prevent unused-variable build warnings
  void activeStudents;
  void paidTuition;
  void attendanceSummary;
  void isStaff;

  // ===================================================
  // RENDER
  // ===================================================

  return (
    <div className="space-y-6">
      {/* HERO */}

      <div className="relative overflow-hidden rounded-2xl bg-slate-950 p-6 text-white shadow-sm md:p-8">
        <div className="relative z-10">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                <Users className="h-3.5 w-3.5" />
                Quản lý đội ngũ HLV
              </div>

              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
                Huấn luyện viên
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                Quản lý thông tin, chuyên môn, trạng thái và các lớp đang phụ
                trách.
              </p>
            </div>

            <div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10 md:flex">
              <UserRound className="h-10 w-10" />
            </div>
          </div>
        </div>

        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/5" />

        <div className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-white/5" />
      </div>

      {/* STATS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tổng HLV</p>

              <p className="mt-2 text-3xl font-bold text-slate-900">
                {stats.total}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Đội ngũ HLV trong CLB
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
              <p className="text-sm text-muted-foreground">Đang hoạt động</p>

              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {stats.active}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                Đang giảng dạy
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <UserRound className="h-5 w-5 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Tạm nghỉ</p>

              <p className="mt-2 text-3xl font-bold text-slate-600">
                {stats.inactive}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                HLV tạm thời nghỉ
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
              <UserRound className="h-5 w-5 text-slate-500" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Chuyên môn Kyorugi
              </p>

              <p className="mt-2 text-3xl font-bold text-amber-600">
                {stats.kyorugi}
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                HLV đối kháng
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <Award className="h-5 w-5 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* ACTION */}

      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold text-slate-900">
            Danh sách huấn luyện viên
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Hiển thị {filteredCoaches.length} / {coaches.length} HLV
          </p>
        </div>

        {canManage && (
          <Button onClick={handleOpenAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Thêm HLV
          </Button>
        )}
      </div>

      {/* FILTER */}

      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-semibold text-slate-900">Tìm kiếm & bộ lọc</h3>

          <p className="mt-1 text-xs text-muted-foreground">
            Tìm theo tên, số điện thoại hoặc lọc theo trạng thái.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên hoặc số điện thoại..."
              className="h-11 pl-9"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "all")}
          >
            <SelectTrigger className="h-11">
              <SelectValue placeholder="Lọc trạng thái" />
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

        {(search || statusFilter !== "all") && (
          <div className="mt-4 flex items-center justify-between border-t pt-4">
            <p className="text-sm text-muted-foreground">Đang áp dụng bộ lọc</p>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* TABLE */}

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-50">
                <TableHead className="w-[60px]">STT</TableHead>

                <TableHead className="min-w-[280px]">Huấn luyện viên</TableHead>

                <TableHead className="min-w-[150px]">Số điện thoại</TableHead>

                <TableHead className="min-w-[150px]">Chuyên môn</TableHead>

                <TableHead className="min-w-[150px]">Ngày tham gia</TableHead>

                <TableHead className="min-w-[150px]">Trạng thái</TableHead>

                <TableHead className="min-w-[150px] text-right">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredCoaches.length > 0 ? (
                filteredCoaches.map((coach, index) => (
                  <TableRow key={coach.id} className="hover:bg-slate-50/70">
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-3">
                        {coach.avatarUrl ? (
                          <img
                            src={coach.avatarUrl}
                            alt={coach.name}
                            className="h-10 w-10 shrink-0 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                            {getInitials(coach.name)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900">
                            {coach.name}
                          </p>

                          <p className="truncate text-xs text-muted-foreground">
                            {coach.gender || "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>{coach.phone || "-"}</TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getSpecializationClass(coach.specialization)}
                      >
                        {coach.specialization || "Chưa cập nhật"}
                      </Badge>
                    </TableCell>

                    <TableCell>{coach.joinDate || "-"}</TableCell>

                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getStatusClass(coach.status)}
                      >
                        {coach.status || "Chưa cập nhật"}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Xem chi tiết"
                          onClick={() => handleOpenView(coach)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {canManage && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              title="Chỉnh sửa"
                              onClick={() => handleOpenEdit(coach)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              title="Xóa"
                              onClick={() => handleDelete(coach)}
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
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>

                      <p className="mt-3 font-medium text-slate-700">
                        Không tìm thấy HLV
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
            <strong className="text-slate-900">{filteredCoaches.length}</strong>{" "}
            / {coaches.length} HLV
          </span>

          <span>
            Đang hoạt động:{" "}
            <strong className="text-emerald-600">{stats.active}</strong>
          </span>
        </div>
      </div>

      {/* ADD / EDIT */}

      <Dialog
        open={open}
        onOpenChange={(value) => {
          if (saving) return;

          setOpen(value);

          if (!value) {
            setEditingCoach(null);

            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCoach
                ? "Chỉnh sửa huấn luyện viên"
                : "Thêm huấn luyện viên"}
            </DialogTitle>

            <DialogDescription>
              {editingCoach
                ? "Cập nhật thông tin HLV."
                : "Nhập thông tin HLV mới vào hệ thống."}
            </DialogDescription>
          </DialogHeader>

          <CoachForm
            newCoach={newCoach}
            setNewCoach={setNewCoach}
            avatarFile={avatarFile}
            setAvatarFile={setAvatarFile}
            avatarPreview={avatarPreview}
            editingCoach={editingCoach}
          />

          <DialogFooter>
            <Button
              variant="outline"
              disabled={saving}
              onClick={() => {
                setOpen(false);
                setEditingCoach(null);
                resetForm();
              }}
            >
              Hủy
            </Button>

            <Button disabled={saving} onClick={handleSave} className="gap-2">
              {saving ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Đang lưu...
                </>
              ) : editingCoach ? (
                "Lưu thay đổi"
              ) : (
                "Thêm HLV"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VIEW */}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Thông tin huấn luyện viên</DialogTitle>

            <DialogDescription>
              Chi tiết thông tin và các lớp đang phụ trách.
            </DialogDescription>
          </DialogHeader>

          {selectedCoach && (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                {selectedCoach.avatarUrl ? (
                  <img
                    src={selectedCoach.avatarUrl}
                    alt={selectedCoach.name}
                    className="h-16 w-16 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                    {getInitials(selectedCoach.name)}
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900">
                    {selectedCoach.name}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedCoach.specialization || "Chưa cập nhật"}
                  </p>

                  <div className="mt-2">
                    <Badge
                      variant="outline"
                      className={getStatusClass(selectedCoach.status)}
                    >
                      {selectedCoach.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Số điện thoại</p>

                  <p className="mt-1 font-medium">
                    {selectedCoach.phone || "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Giới tính</p>

                  <p className="mt-1 font-medium">
                    {selectedCoach.gender || "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Ngày sinh</p>

                  <p className="mt-1 font-medium">
                    {selectedCoach.birthDate || "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Ngày tham gia</p>

                  <p className="mt-1 font-medium">
                    {selectedCoach.joinDate || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Ghi chú</p>

                <p className="mt-1 rounded-xl bg-slate-50 p-3 text-sm">
                  {selectedCoach.note || "Không có ghi chú"}
                </p>
              </div>

              <div className="border-t pt-5">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      Lớp đang phụ trách
                    </h3>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Danh sách lớp được phân công cho HLV.
                    </p>
                  </div>

                  <Badge variant="secondary">
                    {getCoachClasses(selectedCoach.name).length} lớp
                  </Badge>
                </div>

                {getCoachClasses(selectedCoach.name).length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center">
                    <Users className="mx-auto h-6 w-6 text-slate-400" />

                    <p className="mt-2 text-sm font-medium text-slate-700">
                      Chưa phụ trách lớp nào
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      HLV hiện chưa được phân công lớp.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getCoachClasses(selectedCoach.name).map((classItem) => (
                      <div
                        key={classItem.id}
                        className="rounded-xl border bg-slate-50 p-4"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">
                              {classItem.name}
                            </p>

                            <p className="mt-1 text-xs text-muted-foreground">
                              {classItem.schedule} · {classItem.time}
                            </p>
                          </div>

                          <Badge
                            variant={
                              classItem.status === "Đang hoạt động"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {classItem.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
