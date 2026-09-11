"use client";

import { useMemo, useState } from "react";
import { Award, Check, Eye, Search, ShieldCheck } from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useBelt } from "@/context/belt-context";

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

const beltOptions = ["Trắng", "Vàng", "Xanh", "Đỏ", "Đen"];

const beltOrder = ["Trắng", "Vàng", "Xanh", "Đỏ", "Đen"];

export default function CapDaiPage() {
  const { students, updateStudent } = useStudents();

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

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.phone.includes(search);

      const matchBelt = beltFilter === "all" || student.belt === beltFilter;

      return matchSearch && matchBelt;
    });
  }, [students, search, beltFilter]);

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

  function handlePromote() {
    if (!selectedStudent) return;

    if (!newBelt) {
      alert("Vui lòng chọn cấp đai mới.");
      return;
    }

    const currentIndex = beltOrder.indexOf(selectedStudent.belt);

    const newIndex = beltOrder.indexOf(newBelt);

    if (newIndex <= currentIndex) {
      alert("Cấp đai mới phải cao hơn cấp đai hiện tại.");
      return;
    }

    const record = {
      id: Date.now(),
      studentId: selectedStudent.id,
      studentName: selectedStudent.name,
      fromBelt: selectedStudent.belt,
      toBelt: newBelt,
      date: promotionDate,
      coach,
      note,
    };

    promoteStudent(record);

    updateStudent({
      ...selectedStudent,
      belt: newBelt,
    });

    setOpen(false);

    alert(`Đã thăng đai cho ${selectedStudent.name} lên đai ${newBelt}.`);
  }

  function handleOpenHistory(studentId: number) {
    setSelectedStudentId(studentId);
    setHistoryOpen(true);
  }

  const history = selectedStudent
    ? getStudentBeltHistory(selectedStudent.id)
    : [];

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Cấp đai</h1>

          <p className="mt-1 text-sm text-slate-500">
            Quản lý cấp đai và lịch sử thăng đai học viên
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Award size={22} />
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Tổng học viên</p>

          <p className="mt-2 text-2xl font-bold">{students.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Đai trắng</p>

          <p className="mt-2 text-2xl font-bold">
            {students.filter((student) => student.belt === "Trắng").length}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Đai màu</p>

          <p className="mt-2 text-2xl font-bold">
            {
              students.filter((student) =>
                ["Vàng", "Xanh", "Đỏ"].includes(student.belt),
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-slate-500">Đai đen</p>

          <p className="mt-2 text-2xl font-bold">
            {students.filter((student) => student.belt === "Đen").length}
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
              placeholder="Tìm học viên hoặc số điện thoại..."
              className="pl-10"
            />
          </div>

          <Select
            value={beltFilter}
            onValueChange={(value) => setBeltFilter(value ?? "all")}
          >
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Lọc cấp đai" />
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
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left">STT</th>

                <th className="px-4 py-3 text-left">Học viên</th>

                <th className="px-4 py-3 text-left">Lớp</th>

                <th className="px-4 py-3 text-left">Cấp đai hiện tại</th>

                <th className="px-4 py-3 text-left">Trạng thái</th>

                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => {
                const currentIndex = beltOrder.indexOf(student.belt);

                const isBlackBelt = student.belt === "Đen";

                return (
                  <tr key={student.id} className="border-b last:border-0">
                    <td className="px-4 py-4">{index + 1}</td>

                    <td className="px-4 py-4">
                      <div className="font-medium">{student.name}</div>

                      <div className="text-xs text-slate-500">
                        {student.phone}
                      </div>
                    </td>

                    <td className="px-4 py-4">{student.className}</td>

                    <td className="px-4 py-4">
                      <Badge variant="outline">Đai {student.belt}</Badge>
                    </td>

                    <td className="px-4 py-4">
                      {isBlackBelt ? (
                        <Badge>Hoàn thành</Badge>
                      ) : (
                        <Badge variant="secondary">Có thể thăng đai</Badge>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenHistory(student.id)}
                        >
                          <Eye size={16} />
                          <span className="ml-1">Lịch sử</span>
                        </Button>

                        {!isBlackBelt && (
                          <Button
                            size="sm"
                            onClick={() => handleOpenPromotion(student.id)}
                          >
                            <ShieldCheck size={16} />

                            <span className="ml-1">Thăng đai</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    Không tìm thấy học viên.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promotion Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thăng đai học viên</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="font-medium">{selectedStudent.name}</p>

                <p className="text-sm text-slate-500">
                  Đai hiện tại: <strong>{selectedStudent.belt}</strong>
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Cấp đai mới
                </label>

                <Select
                  value={newBelt}
                  onValueChange={(value) => setNewBelt(value ?? "")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn cấp đai" />
                  </SelectTrigger>

                  <SelectContent>
                    {beltOptions.map((belt) => (
                      <SelectItem key={belt} value={belt}>
                        Đai {belt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ngày thăng đai
                </label>

                <Input
                  type="date"
                  value={promotionDate}
                  onChange={(e) => setPromotionDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Huấn luyện viên xác nhận
                </label>

                <Input
                  value={coach}
                  onChange={(e) => setCoach(e.target.value)}
                  placeholder="Nhập tên HLV..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Ghi chú
                </label>

                <Input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm..."
                />
              </div>

              <Button className="w-full" onClick={handlePromote}>
                <Check size={17} />
                <span className="ml-2">Xác nhận thăng đai</span>
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Lịch sử cấp đai</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="font-semibold">{selectedStudent.name}</p>

                <p className="text-sm text-slate-500">
                  Cấp đai hiện tại: <strong>{selectedStudent.belt}</strong>
                </p>
              </div>

              {history.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-500">
                  Chưa có lịch sử thăng đai.
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((record) => (
                    <div key={record.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium">
                            Đai {record.fromBelt}
                          </span>

                          <span className="mx-2">→</span>

                          <span className="font-semibold">
                            Đai {record.toBelt}
                          </span>
                        </div>

                        <span className="text-sm text-slate-500">
                          {record.date}
                        </span>
                      </div>

                      {record.coach && (
                        <p className="mt-2 text-sm">
                          HLV xác nhận: {record.coach}
                        </p>
                      )}

                      {record.note && (
                        <p className="mt-1 text-sm text-slate-500">
                          Ghi chú: {record.note}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
