"use client";

import { useMemo, useState } from "react";
import {
  Users,
  UserCheck,
  UserX,
  CreditCard,
  TrendingUp,
  CalendarCheck,
  Award,
  Wallet,
} from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useAttendance } from "@/context/attendance-context";
import { useTuition } from "@/context/tuition-context";
import { BELT_LEVELS } from "@/context/belt-context";
import { useClub } from "@/context/club-context";

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

export default function ThongKePage() {
  const { students } = useStudents();
  const { getAttendance } = useAttendance();
  const { getAllTuition } = useTuition();
  const { club } = useClub();
  const isStaff = club?.role === "staff";

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  const selectedMonth = selectedDate.slice(0, 7);

  // ==========================================
  // HỌC VIÊN
  // ==========================================

  const activeStudents = students.filter(
    (student) => student.status === "Đang tập",
  );

  const inactiveStudents = students.filter(
    (student) => student.status !== "Đang tập",
  );

  // ==========================================
  // THỐNG KÊ THEO LỚP
  // ==========================================

  const classData = useMemo(() => {
    const classMap: Record<string, number> = {};

    students.forEach((student) => {
      const className = student.className || "Chưa xếp lớp";

      classMap[className] = (classMap[className] || 0) + 1;
    });

    return Object.entries(classMap)
      .map(([name, total]) => ({
        name,
        total,
      }))
      .sort((a, b) => b.total - a.total);
  }, [students]);

  // ==========================================
  // THỐNG KÊ CẤP ĐAI
  // ==========================================

  const beltData = useMemo(() => {
    return BELT_LEVELS.map((belt) => ({
      name: belt.name,
      total: students.filter((student) => student.belt.trim() === belt.name)
        .length,
      color: belt.color,
    }));
  }, [students]);

  // ==========================================
  // ĐIỂM DANH
  // ==========================================

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
      total: present + absent + excused,
    };
  }, [classNames, selectedDate, getAttendance]);

  const attendanceData = [
    {
      name: "Có mặt",
      value: attendanceStats.present,
      color: "#22c55e",
    },
    {
      name: "Vắng",
      value: attendanceStats.absent,
      color: "#ef4444",
    },
    {
      name: "Có phép",
      value: attendanceStats.excused,
      color: "#f59e0b",
    },
  ];

  // ==========================================
  // HỌC PHÍ
  // ==========================================

  const tuitionRecords = getAllTuition(selectedMonth);

  const paidTuition = tuitionRecords.filter(
    (item) => item.status === "Đã đóng",
  );

  const unpaidTuition = tuitionRecords.filter(
    (item) => item.status !== "Đã đóng",
  );

  const totalRevenue = paidTuition.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  );

  const unpaidAmount = unpaidTuition.reduce(
    (total, item) => total + Number(item.amount || 0),
    0,
  );

  const tuitionData = [
    {
      name: "Đã đóng",
      value: paidTuition.length,
      color: "#22c55e",
    },
    {
      name: "Chưa đóng",
      value: unpaidTuition.length,
      color: "#ef4444",
    },
  ];

  // ==========================================
  // FORMAT
  // ==========================================

  function formatMoney(value: number) {
    return new Intl.NumberFormat("vi-VN").format(value);
  }

  const activeRate =
    students.length > 0
      ? Math.round((activeStudents.length / students.length) * 100)
      : 0;

  const tuitionRate =
    tuitionRecords.length > 0
      ? Math.round((paidTuition.length / tuitionRecords.length) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Thống kê
            </h1>
          </div>

          <p className="text-sm text-slate-500">
            Tổng quan tình hình hoạt động của CLB
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-white px-4 py-3 shadow-sm">
          <CalendarCheck className="h-4 w-4 text-slate-500" />

          <label className="text-sm font-medium text-slate-600">
            Ngày thống kê
          </label>

          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="h-9 w-40 border-0 bg-slate-50"
          />
        </div>
      </div>

      {/* ==========================================
          STAT CARDS
      ========================================== */}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Đã đóng"
          value={paidTuition.length}
          description={`${tuitionRate}% số đã lập học phí`}
          icon={CreditCard}
        />

        <StatCard
          title="Đang tập"
          value={activeStudents.length}
          description={`${activeRate}% tổng học viên`}
          icon={UserCheck}
        />

        <StatCard
          title="Đã nghỉ"
          value={inactiveStudents.length}
          description="Không còn tập"
          icon={UserX}
        />

        <StatCard
          title="Đã đóng"
          value={paidTuition.length}
          description={`${tuitionRate}% học viên`}
          icon={CreditCard}
        />

        {!isStaff && (
          <StatCard
            title="Doanh thu"
            value={`${formatMoney(totalRevenue)} đ`}
            description={`Tháng ${selectedMonth}`}
            icon={Wallet}
          />
        )}
      </div>

      {/* ==========================================
          CLASS + BELT
      ========================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* CLASS */}

        <ChartCard
          title="Học viên theo lớp"
          description="Phân bổ học viên hiện tại"
          icon={<Users className="h-5 w-5" />}
        >
          <div className="h-[350px]">
            {classData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={classData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: -10,
                    bottom: 10,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                  />

                  <YAxis
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip cursor={{ fill: "rgba(148,163,184,0.08)" }} />

                  <Bar
                    dataKey="total"
                    name="Học viên"
                    fill="#334155"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={65}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="Chưa có dữ liệu lớp học" />
            )}
          </div>
        </ChartCard>

        {/* BELT */}

        <ChartCard
          title="Học viên theo cấp đai"
          description="Phân bố theo 11 cấp đai"
          icon={<Award className="h-5 w-5" />}
        >
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={beltData}
                margin={{
                  top: 10,
                  right: 10,
                  left: -10,
                  bottom: 55,
                }}
              >
                <CartesianGrid vertical={false} strokeDasharray="3 3" />

                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                />

                <YAxis
                  allowDecimals={false}
                  tickLine={false}
                  axisLine={false}
                />

                <Tooltip
                  cursor={{ fill: "rgba(148,163,184,0.08)" }}
                  formatter={(value) => [value, "Học viên"]}
                />

                <Bar
                  dataKey="total"
                  name="Học viên"
                  radius={[7, 7, 0, 0]}
                  maxBarSize={42}
                >
                  {beltData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ==========================================
          ATTENDANCE + TUITION
      ========================================== */}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* ATTENDANCE */}

        <ChartCard
          title="Điểm danh"
          description={`Tình hình điểm danh ngày ${selectedDate}`}
          icon={<CalendarCheck className="h-5 w-5" />}
        >
          <div className="h-[310px]">
            {attendanceStats.total > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                    label
                  >
                    {attendanceData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="Chưa có dữ liệu điểm danh" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SummaryBox label="Có mặt" value={attendanceStats.present} />

            <SummaryBox label="Vắng" value={attendanceStats.absent} />

            <SummaryBox label="Có phép" value={attendanceStats.excused} />
          </div>
        </ChartCard>

        {/* TUITION */}

        <ChartCard
          title="Học phí"
          description={`Tình hình học phí tháng ${selectedMonth}`}
          icon={<CreditCard className="h-5 w-5" />}
        >
          <div className="h-[310px]">
            {tuitionRecords.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tuitionData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="48%"
                    outerRadius={95}
                    innerRadius={55}
                    paddingAngle={3}
                    label
                  >
                    {tuitionData.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend verticalAlign="bottom" height={30} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="Chưa có dữ liệu học phí" />
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SummaryBox label="Đã đóng" value={paidTuition.length} />

            <SummaryBox label="Chưa đóng" value={unpaidTuition.length} />

            {!isStaff && (
              <SummaryBox
                label="Còn thu"
                value={`${formatMoney(unpaidAmount)} đ`}
              />
            )}
          </div>
        </ChartCard>
      </div>

      {/* ==========================================
          QUICK SUMMARY
      ========================================== */}

      <div className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
            <TrendingUp className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">Tổng quan nhanh</h2>

            <p className="text-sm text-slate-500">
              Một số chỉ số quan trọng của CLB
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryLarge
            label="Tỷ lệ học viên đang tập"
            value={`${activeRate}%`}
          />

          <SummaryLarge label="Tỷ lệ đóng học phí" value={`${tuitionRate}%`} />

          <SummaryLarge
            label="Số lớp đang có học viên"
            value={
              classData.filter((item) => item.name !== "Chưa xếp lớp").length
            }
          />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTS
// ==========================================

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{description}</p>
    </div>
  );
}

function ChartCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>

        <div>
          <h2 className="font-semibold text-slate-900">{title}</h2>

          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 text-center">
      <p className="text-xs text-slate-500">{label}</p>

      <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
    </div>
  );
}

function SummaryLarge({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <p className="text-sm text-slate-500">{label}</p>

      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-slate-400">
      {text}
    </div>
  );
}
