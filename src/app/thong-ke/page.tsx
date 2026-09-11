"use client";

import { useMemo, useState } from "react";
import { Users, UserCheck, UserX, CreditCard, Award } from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useAttendance } from "@/context/attendance-context";
import { useTuition } from "@/context/tuition-context";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { Input } from "@/components/ui/input";

const beltOptions = ["Trắng", "Vàng", "Xanh", "Đỏ", "Đen"];

export default function ThongKePage() {
  const { students } = useStudents();
  const { getAttendance } = useAttendance();
  const { getAllTuition } = useTuition();

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const selectedMonth = selectedDate.slice(0, 7);

  // =========================
  // HỌC VIÊN
  // =========================

  const activeStudents = students.filter(
    (student) => student.status === "Đang tập",
  );

  const inactiveStudents = students.filter(
    (student) => student.status !== "Đang tập",
  );

  // =========================
  // THỐNG KÊ THEO LỚP
  // =========================

  const classData = useMemo(() => {
    const classMap: Record<string, number> = {};

    students.forEach((student) => {
      const className = student.className || "Chưa xếp lớp";

      classMap[className] = (classMap[className] || 0) + 1;
    });

    return Object.entries(classMap).map(([name, total]) => ({
      name,
      total,
    }));
  }, [students]);

  // =========================
  // THỐNG KÊ CẤP ĐAI
  // =========================

  const beltData = useMemo(() => {
    return beltOptions.map((belt) => ({
      name: `Đai ${belt}`,
      total: students.filter((student) => student.belt === belt).length,
    }));
  }, [students]);

  // =========================
  // ĐIỂM DANH
  // =========================

  const classNames = useMemo(() => {
    return Array.from(
      new Set(students.map((student) => student.className).filter(Boolean)),
    );
  }, [students]);

  const attendanceStats = useMemo(() => {
    let present = 0;
    let absent = 0;
    let excused = 0;

    classNames.forEach((className) => {
      const records = getAttendance(selectedDate, className);

      Object.values(records).forEach((record) => {
        if (record.status === "Có mặt") {
          present++;
        }

        if (record.status === "Vắng") {
          absent++;
        }

        if (record.status === "Có phép") {
          excused++;
        }
      });
    });

    return {
      present,
      absent,
      excused,
    };
  }, [classNames, selectedDate, getAttendance]);

  const attendanceData = [
    {
      name: "Có mặt",
      value: attendanceStats.present,
    },
    {
      name: "Vắng",
      value: attendanceStats.absent,
    },
    {
      name: "Có phép",
      value: attendanceStats.excused,
    },
  ];

  // =========================
  // HỌC PHÍ
  // =========================

  const tuitionRecords = getAllTuition(selectedMonth);

  const paidTuition = tuitionRecords.filter(
    (item) => item.status === "Đã đóng",
  );

  const unpaidTuition = tuitionRecords.filter(
    (item) => item.status !== "Đã đóng",
  );

  const totalRevenue = paidTuition.reduce(
    (total, item) => total + item.amount,
    0,
  );

  const tuitionData = [
    {
      name: "Đã đóng",
      value: paidTuition.length,
    },
    {
      name: "Chưa đóng",
      value: unpaidTuition.length,
    },
  ];

  // =========================
  // FORMAT TIỀN
  // =========================

  function formatMoney(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value);
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* HEADER */}

      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Thống kê</h1>

          <p className="mt-1 text-sm text-slate-500">
            Tổng quan tình hình hoạt động của CLB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-medium">Ngày:</label>

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-44 bg-white"
          />
        </div>
      </div>

      {/* STAT CARDS */}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Tổng học viên</p>

            <Users size={20} className="text-slate-500" />
          </div>

          <p className="mt-3 text-2xl font-bold">{students.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Đang tập</p>

            <UserCheck size={20} className="text-slate-500" />
          </div>

          <p className="mt-3 text-2xl font-bold">{activeStudents.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Nghỉ / khác</p>

            <UserX size={20} className="text-slate-500" />
          </div>

          <p className="mt-3 text-2xl font-bold">{inactiveStudents.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Đã đóng tháng này</p>

            <CreditCard size={20} className="text-slate-500" />
          </div>

          <p className="mt-3 text-2xl font-bold">{paidTuition.length}</p>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">Doanh thu</p>

            <Award size={20} className="text-slate-500" />
          </div>

          <p className="mt-3 text-xl font-bold">
            {formatMoney(totalRevenue)} đ
          </p>
        </div>
      </div>

      {/* CHART ROW 1 */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* CLASS */}

        <div className="rounded-xl border bg-white p-5">
          <div className="mb-5">
            <h2 className="font-semibold">Học viên theo lớp</h2>

            <p className="text-sm text-slate-500">Phân bổ học viên hiện tại</p>
          </div>

          <div className="h-[320px] w-full">
            {classData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis dataKey="name" />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Bar dataKey="total" name="Học viên" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Chưa có dữ liệu lớp học
              </div>
            )}
          </div>
        </div>

        {/* BELT */}

        <div className="rounded-xl border bg-white p-5">
          <div className="mb-5">
            <h2 className="font-semibold">Học viên theo cấp đai</h2>

            <p className="text-sm text-slate-500">Phân bổ cấp đai hiện tại</p>
          </div>

          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={beltData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="name" />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar dataKey="total" name="Học viên" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CHART ROW 2 */}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* ATTENDANCE */}

        <div className="rounded-xl border bg-white p-5">
          <div className="mb-5">
            <h2 className="font-semibold">Điểm danh</h2>

            <p className="text-sm text-slate-500">Ngày {selectedDate}</p>
          </div>

          <div className="h-[320px] w-full">
            {attendanceStats.present +
              attendanceStats.absent +
              attendanceStats.excused >
            0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {attendanceData.map((item, index) => (
                      <Cell key={`cell-${index}`} />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Chưa có dữ liệu điểm danh
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Có mặt</p>

              <p className="mt-1 text-lg font-bold">
                {attendanceStats.present}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Vắng</p>

              <p className="mt-1 text-lg font-bold">{attendanceStats.absent}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Có phép</p>

              <p className="mt-1 text-lg font-bold">
                {attendanceStats.excused}
              </p>
            </div>
          </div>
        </div>

        {/* TUITION */}

        <div className="rounded-xl border bg-white p-5">
          <div className="mb-5">
            <h2 className="font-semibold">Học phí</h2>

            <p className="text-sm text-slate-500">Tháng {selectedMonth}</p>
          </div>

          <div className="h-[320px] w-full">
            {tuitionRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tuitionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {tuitionData.map((item, index) => (
                      <Cell key={`cell-${index}`} />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                Chưa có dữ liệu học phí
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Đã đóng</p>

              <p className="mt-1 text-lg font-bold">{paidTuition.length}</p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Chưa đóng</p>

              <p className="mt-1 text-lg font-bold">{unpaidTuition.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="mt-6 rounded-xl border bg-white p-5">
        <h2 className="mb-4 font-semibold">Tổng quan nhanh</h2>

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <p className="text-sm text-slate-500">Tỷ lệ học viên đang tập</p>

            <p className="mt-1 text-xl font-bold">
              {students.length > 0
                ? Math.round((activeStudents.length / students.length) * 100)
                : 0}
              %
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Tỷ lệ đóng học phí</p>

            <p className="mt-1 text-xl font-bold">
              {students.length > 0
                ? Math.round((paidTuition.length / students.length) * 100)
                : 0}
              %
            </p>
          </div>

          <div>
            <p className="text-sm text-slate-500">Số lớp đang có học viên</p>

            <p className="mt-1 text-xl font-bold">
              {classData.filter((item) => item.name !== "Chưa xếp lớp").length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
