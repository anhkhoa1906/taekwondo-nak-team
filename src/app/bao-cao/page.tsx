"use client";

import { useMemo, useState } from "react";
import {
  FileText,
  Users,
  CreditCard,
  CalendarCheck,
  Award,
} from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useTuition } from "@/context/tuition-context";
import { useAttendance } from "@/context/attendance-context";
import { useClub } from "@/context/club-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reportTypes = ["Học viên", "Học phí", "Điểm danh", "Cấp đai"];

const beltOptions = ["Trắng", "Vàng", "Xanh", "Đỏ", "Đen"];

export default function BaoCaoPage() {
  const { students } = useStudents();
  const { getAllTuition } = useTuition();
  const { getAttendance } = useAttendance();
  const { club } = useClub();
  const isStaff = club?.role === "staff";

  const [reportType, setReportType] = useState("Học viên");

  const [search, setSearch] = useState("");

  const [selectedBelt, setSelectedBelt] = useState("all");

  const [fromDate, setFromDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const [toDate, setToDate] = useState(new Date().toISOString().split("T")[0]);

  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));

  // =========================
  // HỌC VIÊN
  // =========================

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchSearch =
        student.name.toLowerCase().includes(search.toLowerCase()) ||
        student.phone.includes(search);

      const matchBelt = selectedBelt === "all" || student.belt === selectedBelt;

      return matchSearch && matchBelt;
    });
  }, [students, search, selectedBelt]);

  // =========================
  // HỌC PHÍ
  // =========================

  const tuitionRecords = getAllTuition(month);

  const paidTuition = tuitionRecords.filter(
    (item) => item.status === "Đã đóng",
  );

  const unpaidTuition = tuitionRecords.filter(
    (item) => item.status !== "Đã đóng",
  );

  const revenue = paidTuition.reduce((total, item) => total + item.amount, 0);

  // =========================
  // ĐIỂM DANH
  // =========================

  const classNames = Array.from(
    new Set(students.map((student) => student.className).filter(Boolean)),
  );
  const attendanceRecords = useMemo(() => {
    const result: {
      studentId: number;
      studentName: string;
      className: string;
      date: string;
      status: string;
      note: string;
    }[] = [];

    if (fromDate > toDate) {
      return result;
    }

    const start = new Date(`${fromDate}T00:00:00`);
    const end = new Date(`${toDate}T00:00:00`);

    for (
      const current = new Date(start);
      current <= end;
      current.setDate(current.getDate() + 1)
    ) {
      const date = current.toISOString().split("T")[0];

      classNames.forEach((className) => {
        const records = getAttendance(date, className);

        students
          .filter((student) => student.className === className)
          .forEach((student) => {
            const record = records[student.id];

            if (record) {
              result.push({
                studentId: student.id,
                studentName: student.name,
                className,
                date,
                status: record.status,
                note: record.note,
              });
            }
          });
      });
    }

    return result;
  }, [classNames, fromDate, toDate, getAttendance, students]);

  // =========================
  // CẤP ĐAI
  // =========================

  const beltData = useMemo(() => {
    return beltOptions.map((belt) => ({
      belt,
      total: students.filter((student) => student.belt === belt).length,
    }));
  }, [students]);

  // =========================
  // FORMAT TIỀN
  // =========================

  function formatMoney(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value);
  }

  // =========================
  // XUẤT CSV
  // =========================

  function exportCSV() {
    let rows: string[][] = [];

    if (reportType === "Học viên") {
      rows = [
        [
          "STT",
          "Họ tên",
          "Số điện thoại",
          "Ngày sinh",
          "Giới tính",
          "Lớp",
          "Cấp đai",
          "Trạng thái",
        ],
        ...filteredStudents.map((student, index) => [
          String(index + 1),
          student.name,
          student.phone,
          student.birthDate,
          student.gender,
          student.className,
          student.belt,
          student.status,
        ]),
      ];
    }

    if (reportType === "Học phí") {
      rows = [
        [
          "STT",
          "Học viên",
          "Tháng",
          "Số tiền",
          "Hạn đóng",
          "Ngày đóng",
          "Trạng thái",
        ],
        ...tuitionRecords.map((record, index) => {
          const student = students.find((item) => item.id === record.studentId);

          return [
            String(index + 1),
            student?.name || "",
            record.month,
            String(record.amount),
            record.dueDate,
            record.paidDate,
            record.status,
          ];
        }),
      ];
    }

    if (reportType === "Điểm danh") {
      rows = [
        ["STT", "Ngày", "Học viên", "Lớp", "Trạng thái", "Ghi chú"],
        ...attendanceRecords.map((record, index) => [
          String(index + 1),
          record.date,
          record.studentName,
          record.className,
          record.status,
          record.note,
        ]),
      ];
    }

    if (reportType === "Cấp đai") {
      rows = [
        ["Cấp đai", "Số học viên"],
        ...beltData.map((item) => [`Đai ${item.belt}`, String(item.total)]),
      ];
    }

    if (rows.length === 0) {
      alert("Không có dữ liệu để xuất.");
      return;
    }

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob(["\ufeff" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = `bao-cao-${reportType}-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    link.click();

    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Báo cáo</h1>

          <p className="mt-1 text-sm text-slate-500">
            Tổng hợp và xuất dữ liệu hoạt động của CLB
          </p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
          <FileText size={22} />
        </div>
      </div>

      {/* REPORT TYPE */}

      <div className="mb-6 rounded-xl border bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Loại báo cáo
            </label>

            <Select
              value={reportType}
              onValueChange={(value) => setReportType(value ?? "Học viên")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button className="w-full md:w-auto" onClick={exportCSV}>
              Xuất CSV
            </Button>
          </div>
        </div>
      </div>

      {/* HỌC VIÊN */}

      {reportType === "Học viên" && (
        <>
          <div className="mb-4 rounded-xl border bg-white p-4">
            <div className="flex flex-col gap-3 md:flex-row">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm học viên..."
              />

              <Select
                value={selectedBelt}
                onValueChange={(value) => setSelectedBelt(value ?? "all")}
              >
                <SelectTrigger className="md:w-52">
                  <SelectValue />
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

          <ReportTable>
            <thead>
              <tr>
                <th>STT</th>
                <th>Ngày</th>
                <th>Học viên</th>
                <th>Lớp</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student, index) => (
                <tr key={student.id}>
                  <td>{index + 1}</td>

                  <td>
                    <div className="font-medium">{student.name}</div>

                    <div className="text-xs text-slate-500">
                      {student.phone}
                    </div>
                  </td>

                  <td>{student.className}</td>

                  <td>Đai {student.belt}</td>

                  <td>{student.status}</td>
                </tr>
              ))}
            </tbody>
          </ReportTable>
        </>
      )}

      {/* HỌC PHÍ */}

      {reportType === "Học phí" && (
        <>
          <div className="mb-4 rounded-xl border bg-white p-4">
            <label className="mb-2 block text-sm font-medium">
              Tháng báo cáo
            </label>

            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full md:w-56"
            />
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <SummaryCard
              icon={CreditCard}
              title="Tổng bản ghi"
              value={tuitionRecords.length}
            />

            <SummaryCard
              icon={Users}
              title="Đã đóng"
              value={paidTuition.length}
            />

            {!isStaff && (
              <SummaryCard
                icon={CreditCard}
                title="Doanh thu"
                value={`${formatMoney(revenue)} đ`}
              />
            )}
          </div>

          <ReportTable>
            <thead>
              <tr>
                <th>STT</th>
                <th>Học viên</th>
                <th>Số tiền</th>
                <th>Hạn đóng</th>
                <th>Ngày đóng</th>
                <th>Trạng thái</th>
              </tr>
            </thead>

            <tbody>
              {tuitionRecords.map((record, index) => {
                const student = students.find(
                  (item) => item.id === record.studentId,
                );

                return (
                  <tr key={record.studentId}>
                    <td>{index + 1}</td>

                    <td>{student?.name || "-"}</td>

                    <td>{formatMoney(record.amount)} đ</td>

                    <td>{record.dueDate}</td>

                    <td>{record.paidDate || "-"}</td>

                    <td>{record.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </ReportTable>
        </>
      )}

      {/* ĐIỂM DANH */}

      {reportType === "Điểm danh" && (
        <>
          <div className="mb-4 rounded-xl border bg-white p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Từ ngày
                </label>

                <Input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Đến ngày
                </label>

                <Input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            <SummaryCard
              icon={CalendarCheck}
              title="Có mặt"
              value={
                attendanceRecords.filter((item) => item.status === "Có mặt")
                  .length
              }
            />

            <SummaryCard
              icon={CalendarCheck}
              title="Vắng"
              value={
                attendanceRecords.filter((item) => item.status === "Vắng")
                  .length
              }
            />

            <SummaryCard
              icon={CalendarCheck}
              title="Có phép"
              value={
                attendanceRecords.filter((item) => item.status === "Có phép")
                  .length
              }
            />
          </div>

          <ReportTable>
            <thead>
              <tr>
                <th>STT</th>
                <th>Học viên</th>
                <th>Lớp</th>
                <th>Trạng thái</th>
                <th>Ghi chú</th>
              </tr>
            </thead>

            <tbody>
              {attendanceRecords.map((record, index) => (
                <tr key={`${record.date}-${record.studentId}-${index}`}>
                  <td>{index + 1}</td>

                  <td>{record.date}</td>

                  <td>{record.studentName}</td>

                  <td>{record.className}</td>

                  <td>{record.status}</td>

                  <td>{record.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </ReportTable>
        </>
      )}

      {/* CẤP ĐAI */}

      {reportType === "Cấp đai" && (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-5">
            {beltData.map((item) => (
              <div key={item.belt} className="rounded-xl border bg-white p-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">Đai {item.belt}</p>

                  <Award size={18} />
                </div>

                <p className="mt-3 text-2xl font-bold">{item.total}</p>

                <p className="text-xs text-slate-500">học viên</p>
              </div>
            ))}
          </div>

          <ReportTable>
            <thead>
              <tr>
                <th>Cấp đai</th>
                <th>Số học viên</th>
              </tr>
            </thead>

            <tbody>
              {beltData.map((item) => (
                <tr key={item.belt}>
                  <td>Đai {item.belt}</td>

                  <td>{item.total}</td>
                </tr>
              ))}
            </tbody>
          </ReportTable>
        </>
      )}
    </div>
  );
}

// =================================
// COMPONENT: REPORT TABLE
// =================================

function ReportTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}

// =================================
// COMPONENT: SUMMARY CARD
// =================================

function SummaryCard({
  icon: Icon,
  title,
  value,
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>

        <Icon size={20} />
      </div>

      <p className="mt-3 text-2xl font-bold">{value}</p>
    </div>
  );
}
