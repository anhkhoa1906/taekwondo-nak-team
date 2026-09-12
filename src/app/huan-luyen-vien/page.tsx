"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil, Plus, Search, Trash2, Users } from "lucide-react";

import { useCoaches, type Coach } from "@/context/coach-context";
import { useClasses } from "@/context/class-context";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
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

const statusOptions = ["Đang hoạt động", "Tạm nghỉ"];

const specializationOptions = ["Taekwondo", "Kyorugi", "Poomsae"];

const emptyCoach = {
  name: "",
  phone: "",
  birthDate: "",
  gender: "",
  specialization: "Taekwondo",
  joinDate: "",
  status: "Đang hoạt động",
  note: "",
};

export default function HuanLuyenVienPage() {
  const { coaches, addCoach, updateCoach, deleteCoach } = useCoaches();

  const { classes } = useClasses();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingCoach, setEditingCoach] = useState<Coach | null>(null);

  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);

  const [newCoach, setNewCoach] = useState(emptyCoach);

  const filteredCoaches = useMemo(() => {
    return coaches.filter((coach) => {
      const matchSearch =
        coach.name.toLowerCase().includes(search.toLowerCase()) ||
        coach.phone.includes(search);

      const matchStatus =
        statusFilter === "all" || coach.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [coaches, search, statusFilter]);

  function handleOpenAdd() {
    setEditingCoach(null);

    setNewCoach({
      ...emptyCoach,
    });

    setOpen(true);
  }

  function handleOpenEdit(coach: Coach) {
    setEditingCoach(coach);

    setNewCoach({
      name: coach.name,
      phone: coach.phone,
      birthDate: coach.birthDate,
      gender: coach.gender,
      specialization: coach.specialization,
      joinDate: coach.joinDate,
      status: coach.status,
      note: coach.note,
    });

    setOpen(true);
  }

  function handleOpenView(coach: Coach) {
    setSelectedCoach(coach);
    setViewOpen(true);
  }

  function handleSave() {
    if (!newCoach.name.trim()) {
      alert("Vui lòng nhập tên huấn luyện viên.");
      return;
    }

    if (!newCoach.phone.trim()) {
      alert("Vui lòng nhập số điện thoại.");
      return;
    }

    if (editingCoach) {
      updateCoach({
        ...editingCoach,
        ...newCoach,
      });

      alert("Đã cập nhật huấn luyện viên.");
    } else {
      addCoach({
        id: Date.now(),
        ...newCoach,
      });

      alert("Đã thêm huấn luyện viên.");
    }

    setOpen(false);
  }

  function handleDelete(coach: Coach) {
    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa HLV "${coach.name}" không?`,
    );

    if (!confirmDelete) return;

    deleteCoach(coach.id);

    alert("Đã xóa huấn luyện viên.");
  }

  function getCoachClasses(coachName: string) {
    return classes.filter((classItem) => classItem.coach === coachName);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Huấn luyện viên</h1>

          <p className="mt-1 text-sm text-slate-500">
            Quản lý thông tin huấn luyện viên của CLB
          </p>
        </div>

        <Button onClick={handleOpenAdd}>
          <Plus size={18} />
          <span className="ml-2">Thêm HLV</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Tổng HLV</p>

          <p className="mt-2 text-2xl font-bold">{coaches.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Đang hoạt động</p>

          <p className="mt-2 text-2xl font-bold">
            {
              coaches.filter((coach) => coach.status === "Đang hoạt động")
                .length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Tạm nghỉ</p>

          <p className="mt-2 text-2xl font-bold">
            {coaches.filter((coach) => coach.status === "Tạm nghỉ").length}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 rounded-xl border bg-white p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm tên hoặc số điện thoại..."
              className="pl-10"
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value ?? "all")}
          >
            <SelectTrigger className="w-full md:w-52">
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
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">STT</th>

                <th className="px-4 py-3 text-left">Huấn luyện viên</th>

                <th className="px-4 py-3 text-left">Số điện thoại</th>

                <th className="px-4 py-3 text-left">Chuyên môn</th>

                <th className="px-4 py-3 text-left">Ngày tham gia</th>

                <th className="px-4 py-3 text-left">Trạng thái</th>

                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredCoaches.map((coach, index) => (
                <tr key={coach.id} className="border-b last:border-0">
                  <td className="px-4 py-4">{index + 1}</td>

                  <td className="px-4 py-4">
                    <div className="font-medium">{coach.name}</div>

                    <div className="text-xs text-slate-500">
                      {coach.gender || "Chưa cập nhật"}
                    </div>
                  </td>

                  <td className="px-4 py-4">{coach.phone}</td>

                  <td className="px-4 py-4">
                    <Badge variant="outline">{coach.specialization}</Badge>
                  </td>

                  <td className="px-4 py-4">{coach.joinDate || "-"}</td>

                  <td className="px-4 py-4">
                    <Badge
                      variant={
                        coach.status === "Đang hoạt động"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {coach.status}
                    </Badge>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenView(coach)}
                      >
                        <Eye size={16} />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenEdit(coach)}
                      >
                        <Pencil size={16} />
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(coach)}
                      >
                        <Trash2 size={16} className="text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCoaches.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    Không tìm thấy huấn luyện viên.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCoach
                ? "Chỉnh sửa huấn luyện viên"
                : "Thêm huấn luyện viên"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Họ và tên
              </label>

              <Input
                value={newCoach.name}
                onChange={(e) =>
                  setNewCoach({
                    ...newCoach,
                    name: e.target.value,
                  })
                }
                placeholder="Nhập họ tên..."
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Số điện thoại
              </label>

              <Input
                value={newCoach.phone}
                onChange={(e) =>
                  setNewCoach({
                    ...newCoach,
                    phone: e.target.value,
                  })
                }
                placeholder="Nhập số điện thoại..."
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Ngày sinh
              </label>

              <Input
                type="text"
                value={newCoach.birthDate}
                onChange={(e) =>
                  setNewCoach({
                    ...newCoach,
                    birthDate: e.target.value,
                  })
                }
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Giới tính
              </label>

              <Select
                value={newCoach.gender}
                onValueChange={(value) =>
                  setNewCoach({
                    ...newCoach,
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

            {/* Specialization */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Chuyên môn
              </label>

              <Select
                value={newCoach.specialization}
                onValueChange={(value) =>
                  setNewCoach({
                    ...newCoach,
                    specialization: value ?? "",
                  })
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

            {/* Join Date */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Ngày tham gia
              </label>

              <Input
                type="text"
                value={newCoach.joinDate}
                onChange={(e) =>
                  setNewCoach({
                    ...newCoach,
                    joinDate: e.target.value,
                  })
                }
                placeholder="DD/MM/YYYY"
              />
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Trạng thái
              </label>

              <Select
                value={newCoach.status}
                onValueChange={(value) =>
                  setNewCoach({
                    ...newCoach,
                    status: value ?? "",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
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

            {/* Note */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Ghi chú</label>

              <Input
                value={newCoach.note}
                onChange={(e) =>
                  setNewCoach({
                    ...newCoach,
                    note: e.target.value,
                  })
                }
                placeholder="Ghi chú..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Hủy
            </Button>

            <Button onClick={handleSave}>
              {editingCoach ? "Lưu thay đổi" : "Thêm HLV"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Thông tin huấn luyện viên</DialogTitle>
          </DialogHeader>

          {selectedCoach && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 rounded-xl bg-slate-50 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-white">
                  <Users size={22} />
                </div>

                <div>
                  <p className="font-semibold">{selectedCoach.name}</p>

                  <p className="text-sm text-slate-500">
                    {selectedCoach.specialization}
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-xs text-slate-500">Số điện thoại</p>

                  <p className="font-medium">{selectedCoach.phone}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Giới tính</p>

                  <p className="font-medium">{selectedCoach.gender || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Ngày sinh</p>

                  <p className="font-medium">
                    {selectedCoach.birthDate || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Ngày tham gia</p>

                  <p className="font-medium">{selectedCoach.joinDate || "-"}</p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Trạng thái</p>

                  <Badge>{selectedCoach.status}</Badge>
                </div>
              </div>

              <div>
                <p className="text-xs text-slate-500">Ghi chú</p>

                <p className="mt-1 text-sm">
                  {selectedCoach.note || "Không có"}
                </p>
              </div>
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Lớp đang phụ trách</p>

                    <p className="text-xs text-slate-500">
                      {getCoachClasses(selectedCoach.name).length} lớp
                    </p>
                  </div>
                </div>

                {getCoachClasses(selectedCoach.name).length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-slate-500">
                    HLV chưa phụ trách lớp nào.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {getCoachClasses(selectedCoach.name).map((classItem) => (
                      <div
                        key={classItem.id}
                        className="rounded-lg border bg-slate-50 p-3"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{classItem.name}</p>

                            <p className="text-xs text-slate-500">
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
        </DialogContent>
      </Dialog>
    </div>
  );
}
