"use client";

import {
  ArrowRight,
  CalendarCheck,
  CircleDollarSign,
  ClipboardCheck,
  GraduationCap,
  Layers3,
  UserCheck,
  UserX,
  Users,
  Wallet,
} from "lucide-react";

import Link from "next/link";

import Header from "@/components/dashboard/header";
import StatCard from "@/components/dashboard/stat-card";
import StudentChart from "@/components/dashboard/student-chart";
import BeltChart from "@/components/dashboard/belt-chart";

import { useStudents } from "@/context/student-context";
import { useTuition } from "@/context/tuition-context";
import { useAttendance } from "@/context/attendance-context";
import { useClasses } from "@/context/class-context";
import { useClub } from "@/context/club-context";

export default function Home() {
  const { students } = useStudents();
  const { classes } = useClasses();

  const { getAllTuition } = useTuition();

  const { getTodayAttendanceSummary } = useAttendance();

  const { club } = useClub();

  const isStaff = club?.role === "staff";

  // =====================================================
  // TÊN CLB HIỆN TẠI
  // =====================================================

  const clubName = club?.name ?? "Câu lạc bộ";

  // =====================================================
  // HỌC VIÊN
  // =====================================================

  const activeStudents = students.filter(
    (student) => student.status === "Đang tập",
  );

  const inactiveStudents = students.filter(
    (student) => student.status !== "Đang tập",
  );

  // =====================================================
  // THÁNG HIỆN TẠI
  // =====================================================

  const currentMonth = new Date().toISOString().slice(0, 7);

  const monthTuition = getAllTuition(currentMonth);

  // =====================================================
  // HỌC PHÍ
  // =====================================================

  const paidTuition = monthTuition
    .filter((item) => item.status === "Đã đóng")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  const unpaidTuition = monthTuition
    .filter((item) => item.status !== "Đã đóng")
    .reduce((total, item) => total + Number(item.amount || 0), 0);

  // =====================================================
  // ĐIỂM DANH
  // =====================================================

  const attendanceSummary = getTodayAttendanceSummary();

  // =====================================================
  // LỚP HỌC
  // =====================================================

  const activeClasses = classes.filter(
    (item) => item.status === "Đang hoạt động",
  );

  const assignedStudents = students.filter(
    (student) => student.className && student.className !== "Chưa xếp lớp",
  );

  const unassignedStudents = students.filter(
    (student) => !student.className || student.className === "Chưa xếp lớp",
  );

  // =====================================================
  // TỶ LỆ HỌC VIÊN ĐANG TẬP
  // =====================================================

  const activeRate =
    students.length > 0
      ? Math.round((activeStudents.length / students.length) * 100)
      : 0;

  // =====================================================
  // FORMAT TIỀN
  // =====================================================

  const formatMoney = (value: number) => {
    return value.toLocaleString("vi-VN");
  };

  // =====================================================
  // NGÀY HIỆN TẠI
  // =====================================================

  const todayText = new Intl.DateTimeFormat("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px] space-y-6">
            {/* =================================================
                WELCOME
            ================================================= */}

            <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-7 text-white shadow-sm sm:px-8 sm:py-8">
              <div className="relative z-10">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="max-w-2xl">
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300">
                      <GraduationCap className="h-3.5 w-3.5" />
                      Quản lý câu lạc bộ
                    </div>

                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                      Chào mừng đến với
                      <br className="hidden sm:block" />
                      <span className="text-slate-300"> {clubName}</span> 🥋
                    </h1>

                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                      Hệ thống quản lý học viên, lớp học, điểm danh và học phí
                      của câu lạc bộ.
                    </p>

                    <p className="mt-4 text-xs font-medium capitalize text-slate-400">
                      {todayText}
                    </p>
                  </div>

                  {/* QUICK SUMMARY */}

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:min-w-[390px]">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Users className="h-4 w-4" />

                        <span className="text-xs">Học viên</span>
                      </div>

                      <p className="mt-2 text-2xl font-bold">
                        {students.length}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Layers3 className="h-4 w-4" />

                        <span className="text-xs">Lớp hoạt động</span>
                      </div>

                      <p className="mt-2 text-2xl font-bold">
                        {activeClasses.length}
                      </p>
                    </div>

                    <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm sm:col-span-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <UserCheck className="h-4 w-4" />

                        <span className="text-xs">Đang tập</span>
                      </div>

                      <p className="mt-2 text-2xl font-bold">{activeRate}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* DECORATION */}

              <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full border border-white/5" />

              <div className="absolute -bottom-40 right-20 h-80 w-80 rounded-full border border-white/5" />

              <div className="absolute bottom-0 right-0 h-40 w-40 rounded-full bg-white/[0.02] blur-2xl" />
            </section>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Tổng quan
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Các chỉ số chính của câu lạc bộ
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Tổng học viên"
                  value={students.length.toString()}
                  description="Tổng số học viên trong CLB"
                  icon={Users}
                />

                <StatCard
                  title="Đang tập"
                  value={activeStudents.length.toString()}
                  description={`${activeRate}% học viên đang tập luyện`}
                  icon={UserCheck}
                />

                <StatCard
                  title="Đã nghỉ"
                  value={inactiveStudents.length.toString()}
                  description="Học viên không còn tập"
                  icon={UserX}
                />

                {!isStaff && (
                  <>
                    <StatCard
                      title="Doanh thu học phí"
                      value={`${formatMoney(paidTuition)}đ`}
                      description="Học phí đã thu trong tháng này"
                      icon={CircleDollarSign}
                    />

                    <StatCard
                      title="Học phí chưa thu"
                      value={`${formatMoney(unpaidTuition)}đ`}
                      description="Học phí chưa thu trong tháng này"
                      icon={Wallet}
                    />
                  </>
                )}

                <StatCard
                  title="Điểm danh hôm nay"
                  value={attendanceSummary.present.toString()}
                  description={`Có mặt / ${attendanceSummary.total} lượt điểm danh`}
                  icon={ClipboardCheck}
                />
              </div>
            </section>

            {/* =================================================
                TODAY OVERVIEW
            ================================================= */}

            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* LỚP */}

              <Link
                href="/lop-hoc"
                className="group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Layers3 className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Lớp đang hoạt động
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {activeClasses.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Tổng {classes.length} lớp
                </p>
              </Link>

              {/* XẾP LỚP */}

              <Link
                href="/hoc-vien"
                className="group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Users className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Đã xếp lớp
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {assignedStudents.length}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {unassignedStudents.length} học viên chưa xếp lớp
                </p>
              </Link>

              {/* ĐIỂM DANH */}

              <Link
                href="/diem-danh"
                className="group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                    <CalendarCheck className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Điểm danh hôm nay
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {attendanceSummary.present}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  Có mặt / {attendanceSummary.total} lượt
                </p>
              </Link>

              {/* HỌC PHÍ */}

              <Link
                href="/hoc-phi"
                className="group rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                    <Wallet className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                </div>

                <p className="mt-4 text-sm font-medium text-slate-500">
                  Học phí
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {isStaff
                    ? monthTuition.filter((item) => item.status === "Đã đóng")
                        .length
                    : `${formatMoney(paidTuition)}đ`}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {isStaff
                    ? "Học viên đã đóng tháng hiện tại"
                    : "Tháng hiện tại"}
                </p>
              </Link>
            </section>

            {/* =================================================
                CHARTS
            ================================================= */}

            <section>
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Phân tích
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Tổng quan dữ liệu học viên và cấp đai
                  </p>
                </div>
              </div>

              <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
                {/* STUDENT CHART */}

                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="border-b px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Học viên
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Thống kê học viên theo lớp
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <Users className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <StudentChart />
                  </div>
                </div>

                {/* BELT CHART */}

                <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
                  <div className="border-b px-5 py-4 sm:px-6">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">
                          Cấp đai
                        </h3>

                        <p className="mt-1 text-xs text-slate-500">
                          Phân bổ cấp đai hiện tại
                        </p>
                      </div>

                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <GraduationCap className="h-4 w-4" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5">
                    <BeltChart />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                QUICK ACTION
            ================================================= */}

            <section className="rounded-2xl border bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5">
                <h2 className="font-semibold text-slate-900">Thao tác nhanh</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Truy cập nhanh các chức năng thường dùng
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* HỌC VIÊN */}

                <Link
                  href="/hoc-vien"
                  className="group flex items-center justify-between rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Users className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Học viên
                      </p>

                      <p className="text-xs text-slate-500">Quản lý học viên</p>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                </Link>

                {/* LỚP HỌC */}

                <Link
                  href="/lop-hoc"
                  className="group flex items-center justify-between rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                      <Layers3 className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Lớp học
                      </p>

                      <p className="text-xs text-slate-500">Quản lý lớp tập</p>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                </Link>

                {/* ĐIỂM DANH */}

                <Link
                  href="/diem-danh"
                  className="group flex items-center justify-between rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ClipboardCheck className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Điểm danh
                      </p>

                      <p className="text-xs text-slate-500">
                        Điểm danh hôm nay
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                </Link>

                {/* HỌC PHÍ */}

                <Link
                  href="/hoc-phi"
                  className="group flex items-center justify-between rounded-xl border p-4 transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                      <Wallet className="h-5 w-5" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Học phí
                      </p>

                      <p className="text-xs text-slate-500">Theo dõi học phí</p>
                    </div>
                  </div>

                  <ArrowRight className="h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-600" />
                </Link>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
