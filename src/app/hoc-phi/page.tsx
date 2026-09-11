"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  CreditCard,
  Search,
  UserRound,
  XCircle,
} from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useTuition, type TuitionStatus } from "@/context/tuition-context";

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

const statusOptions: TuitionStatus[] = ["Đã đóng", "Chưa đóng", "Quá hạn"];

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

export default function HocPhiPage() {
  const { students } = useStudents();

  const { getTuition, saveTuition } = useTuition();

  const [selectedMonth, setSelectedMonth] = useState("2026-09");

  const [statusFilter, setStatusFilter] = useState("all");

  const [search, setSearch] = useState("");

  const [amount] = useState(300000);

  const tuitionStudents = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return students
      .filter((student) => {
        const matchSearch =
          student.name.toLowerCase().includes(keyword) ||
          student.phone.toLowerCase().includes(keyword);

        const record = getTuition(student.id, selectedMonth);

        const status = record?.status || "Chưa đóng";

        const matchStatus = statusFilter === "all" || status === statusFilter;

        return matchSearch && matchStatus;
      })
      .filter((student) => student.className !== "Chưa xếp lớp");
  }, [students, search, selectedMonth, statusFilter, getTuition]);

  const stats = useMemo(() => {
    let paid = 0;
    let unpaid = 0;
    let overdue = 0;

    students.forEach((student) => {
      const record = getTuition(student.id, selectedMonth);

      const status = record?.status || "Chưa đóng";

      if (status === "Đã đóng") {
        paid++;
      }

      if (status === "Chưa đóng") {
        unpaid++;
      }

      if (status === "Quá hạn") {
        overdue++;
      }
    });

    return {
      total: students.length,
      paid,
      unpaid,
      overdue,
    };
  }, [students, selectedMonth, getTuition]);

  function handleMarkAsPaid(studentId: number) {
    const student = students.find((item) => item.id === studentId);

    if (!student) return;

    const current = getTuition(studentId, selectedMonth);

    saveTuition({
      studentId,
      month: selectedMonth,
      amount: current?.amount || amount,
      dueDate: current?.dueDate || `${selectedMonth}-10`,
      paidDate: new Date().toISOString().split("T")[0],
      status: "Đã đóng",
      note: current?.note || "",
    });
  }

  function handleMarkAsUnpaid(studentId: number) {
    const student = students.find((item) => item.id === studentId);

    if (!student) return;

    const current = getTuition(studentId, selectedMonth);

    saveTuition({
      studentId,
      month: selectedMonth,
      amount: current?.amount || amount,
      dueDate: current?.dueDate || `${selectedMonth}-10`,
      paidDate: "",
      status: "Chưa đóng",
      note: current?.note || "",
    });
  }

  function getStatus(studentId: number) {
    return getTuition(studentId, selectedMonth)?.status || "Chưa đóng";
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Học phí</h1>

        <p className="text-muted-foreground">
          Quản lý học phí học viên theo từng tháng
        </p>
      </div>

      {/* FILTER */}

      <div className="rounded-xl border bg-card p-5">
        <div className="grid gap-4 md:grid-cols-3">
          {/* THÁNG */}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Tháng học phí</label>

            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>

          {/* TRẠNG THÁI */}

          <div className="grid gap-2">
            <label className="text-sm font-medium">Trạng thái</label>

            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value ?? "all")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>

                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      {/* STATISTICS */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Tổng học viên</p>

          <div className="mt-2 flex items-center gap-2">
            <UserRound className="h-5 w-5" />

            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Đã đóng</p>

          <div className="mt-2 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />

            <p className="text-2xl font-bold">{stats.paid}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Chưa đóng</p>

          <div className="mt-2 flex items-center gap-2">
            <Clock3 className="h-5 w-5 text-yellow-600" />

            <p className="text-2xl font-bold">{stats.unpaid}</p>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">Quá hạn</p>

          <div className="mt-2 flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />

            <p className="text-2xl font-bold">{stats.overdue}</p>
          </div>
        </div>
      </div>

      {/* TABLE */}

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">STT</TableHead>

              <TableHead>Học viên</TableHead>

              <TableHead>Lớp</TableHead>

              <TableHead>Học phí</TableHead>

              <TableHead>Hạn đóng</TableHead>

              <TableHead>Trạng thái</TableHead>

              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {tuitionStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-24 text-center text-muted-foreground"
                >
                  Không có học viên.
                </TableCell>
              </TableRow>
            ) : (
              tuitionStudents.map((student, index) => {
                const record = getTuition(student.id, selectedMonth);

                const status = record?.status || "Chưa đóng";

                return (
                  <TableRow key={student.id}>
                    <TableCell>{index + 1}</TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium">{student.name}</p>

                        <p className="text-xs text-muted-foreground">
                          {student.phone}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell>{student.className}</TableCell>

                    <TableCell>
                      {formatMoney(record?.amount || amount)}
                    </TableCell>

                    <TableCell>
                      {record?.dueDate || `${selectedMonth}-10`}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={
                          status === "Đã đóng"
                            ? "default"
                            : status === "Quá hạn"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {status}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {status !== "Đã đóng" ? (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(student.id)}
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Đã đóng
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleMarkAsUnpaid(student.id)}
                          >
                            Hoàn tác
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
