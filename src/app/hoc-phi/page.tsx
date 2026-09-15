"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CheckCircle2,
  Clock3,
  CreditCard,
  DollarSign,
  Plus,
  Search,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

import { useStudents } from "@/context/student-context";
import { useClasses } from "@/context/class-context";
import { useRole } from "@/hooks/use-role";
import { useTuition, type TuitionStatus } from "@/context/tuition-context";

const DEFAULT_TUITION = 300000;

type DisplayStatus = TuitionStatus | "Chưa lập";

type OverdueItem = {
  studentId: number;
  studentName: string;
  phone: string;
  className: string;
  month: string;
  amount: number;
  dueDate: string;
};

type OverdueStudent = {
  studentId: number;
  studentName: string;
  phone: string;
  className: string;
  items: OverdueItem[];
  total: number;
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
}

function formatDate(date: string) {
  if (!date) return "-";

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) return date;

  return `${day}/${month}/${year}`;
}

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

function getPreviousMonths(count = 24) {
  const result: string[] = [];
  const now = new Date();

  for (let index = 1; index <= count; index += 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);

    result.push(
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
    );
  }

  return result;
}

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getDueDate(month: string) {
  return `${month}-10`;
}

function getMonthLabel(month: string) {
  const [year, monthNumber] = month.split("-");

  if (!year || !monthNumber) return month;

  return `Tháng ${Number(monthNumber)}/${year}`;
}

function getStatusBadge(status: DisplayStatus) {
  if (status === "Đã đóng") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Đã đóng
      </span>
    );
  }

  if (status === "Quá hạn") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
        <XCircle className="h-3.5 w-3.5" />
        Quá hạn
      </span>
    );
  }

  if (status === "Chưa lập") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-500">
        <Plus className="h-3.5 w-3.5" />
        Chưa lập
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
      <Clock3 className="h-3.5 w-3.5" />
      Chưa đóng
    </span>
  );
}

function SummaryCard({
  title,
  value,
  description,
  icon,
  iconClassName,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  iconClassName: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClassName}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-400">{description}</p>
    </div>
  );
}

export default function HocPhiPage() {
  const { students } = useStudents();
  const { classes } = useClasses();
  const { isStaff } = useRole();
  const { getTuition, saveTuition } = useTuition();

  const currentMonth = getCurrentMonth();

  const previousMonths = useMemo(() => getPreviousMonths(24), []);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [expandedOverdueStudents, setExpandedOverdueStudents] = useState<
    number[]
  >([]);

  const isFutureMonth = selectedMonth > currentMonth;
  const isPastMonth = selectedMonth < currentMonth;
  const isCurrentMonth = selectedMonth === currentMonth;

  const tuitionStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return students
      .filter((student) => student.className !== "Chưa xếp lớp")
      .filter((student) => {
        if (classFilter === "all") return true;

        return student.className === classFilter;
      })
      .filter((student) => {
        if (!keyword) return true;

        return (
          student.name.toLowerCase().includes(keyword) ||
          student.phone.toLowerCase().includes(keyword)
        );
      });
  }, [students, classFilter, search]);

  /**
   * HỌC VIÊN TRỄ HẠN THÁNG CŨ
   *
   * Staff vẫn được xem danh sách này.
   * Tuy nhiên UI bên dưới sẽ ẩn tiền và thao tác thanh toán.
   */
  const overdueItems = useMemo<OverdueItem[]>(() => {
    const items: OverdueItem[] = [];

    students
      .filter((student) => student.className !== "Chưa xếp lớp")
      .forEach((student) => {
        previousMonths.forEach((month) => {
          const record = getTuition(student.id, month);

          if (!record || record.status === "Đã đóng") {
            return;
          }

          items.push({
            studentId: student.id,
            studentName: student.name,
            phone: student.phone,
            className: student.className,
            month,
            amount: Number(record.amount || DEFAULT_TUITION),
            dueDate: record.dueDate || getDueDate(month),
          });
        });
      });

    return items.sort((a, b) => {
      if (a.month !== b.month) {
        return b.month.localeCompare(a.month);
      }

      return a.studentName.localeCompare(b.studentName, "vi");
    });
  }, [students, previousMonths, getTuition]);

  const overdueStudentCount = useMemo(
    () => new Set(overdueItems.map((item) => item.studentId)).size,
    [overdueItems],
  );

  const overdueTotal = useMemo(
    () => overdueItems.reduce((sum, item) => sum + item.amount, 0),
    [overdueItems],
  );

  const overdueStudents = useMemo<OverdueStudent[]>(() => {
    const map = new Map<number, OverdueStudent>();

    overdueItems.forEach((item) => {
      const existing = map.get(item.studentId);

      if (existing) {
        existing.items.push(item);
        existing.total += item.amount;
        return;
      }

      map.set(item.studentId, {
        studentId: item.studentId,
        studentName: item.studentName,
        phone: item.phone,
        className: item.className,
        items: [item],
        total: item.amount,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.studentName.localeCompare(b.studentName, "vi"),
    );
  }, [overdueItems]);

  const toggleOverdueStudent = (studentId: number) => {
    setExpandedOverdueStudents((current) =>
      current.includes(studentId)
        ? current.filter((id) => id !== studentId)
        : [...current, studentId],
    );
  };

  function getDisplayStatus(studentId: number): DisplayStatus {
    const record = getTuition(studentId, selectedMonth);

    if (record) {
      return record.status;
    }

    if (isPastMonth) {
      return "Quá hạn";
    }

    return "Chưa lập";
  }

  function getDisplayAmount(studentId: number) {
    const record = getTuition(studentId, selectedMonth);

    if (record) {
      return Number(record.amount || 0);
    }

    if (!isFutureMonth) {
      return DEFAULT_TUITION;
    }

    return 0;
  }

  async function handleCreateTuition(studentId: number) {
    if (isStaff) return;

    const existing = getTuition(studentId, selectedMonth);

    if (existing) return;

    await saveTuition({
      studentId,
      month: selectedMonth,
      amount: DEFAULT_TUITION,
      dueDate: getDueDate(selectedMonth),
      paidDate: "",
      status: "Chưa đóng",
      note: "",
    });
  }

  async function handleMarkAsPaid(studentId: number) {
    if (isStaff) return;

    const current = getTuition(studentId, selectedMonth);

    const amount = Number(current?.amount || DEFAULT_TUITION);

    await saveTuition({
      studentId,
      month: selectedMonth,
      amount,
      dueDate: current?.dueDate || getDueDate(selectedMonth),
      paidDate: getToday(),
      status: "Đã đóng",
      note: current?.note || "",
    });
  }

  async function handleMarkAsUnpaid(studentId: number) {
    if (isStaff) return;

    const current = getTuition(studentId, selectedMonth);

    if (!current) return;

    await saveTuition({
      studentId,
      month: selectedMonth,
      amount: Number(current.amount || DEFAULT_TUITION),
      dueDate: current.dueDate || getDueDate(selectedMonth),
      paidDate: "",
      status: isPastMonth ? "Quá hạn" : "Chưa đóng",
      note: current.note || "",
    });
  }

  async function handlePayOverdue(item: OverdueItem) {
    if (isStaff) return;

    const current = getTuition(item.studentId, item.month);

    if (!current || current.status === "Đã đóng") return;

    await saveTuition({
      studentId: item.studentId,
      month: item.month,
      amount: Number(current.amount || item.amount || DEFAULT_TUITION),
      dueDate: current.dueDate || item.dueDate,
      paidDate: getToday(),
      status: "Đã đóng",
      note: current.note || "",
    });
  }

  const stats = useMemo(() => {
    let totalAmount = 0;
    let paidAmount = 0;
    let unpaidAmount = 0;
    let overdueAmount = 0;

    let paidCount = 0;
    let unpaidCount = 0;
    let overdueCount = 0;
    let notCreatedCount = 0;

    students
      .filter((student) => student.className !== "Chưa xếp lớp")
      .forEach((student) => {
        const record = getTuition(student.id, selectedMonth);

        if (!record && !isPastMonth) {
          notCreatedCount += 1;
          return;
        }

        const amount = Number(record?.amount || DEFAULT_TUITION);

        totalAmount += amount;

        const status: TuitionStatus = record?.status || "Quá hạn";

        if (status === "Đã đóng") {
          paidAmount += amount;
          paidCount += 1;
        } else if (status === "Quá hạn") {
          overdueAmount += amount;
          overdueCount += 1;
        } else {
          unpaidAmount += amount;
          unpaidCount += 1;
        }
      });

    return {
      totalAmount,
      paidAmount,
      unpaidAmount,
      overdueAmount,
      paidCount,
      unpaidCount,
      overdueCount,
      notCreatedCount,
    };
  }, [students, selectedMonth, isPastMonth, getTuition]);

  const filteredStudents = useMemo(() => {
    return tuitionStudents.filter((student) => {
      if (statusFilter === "all") return true;

      return getDisplayStatus(student.id) === statusFilter;
    });
  }, [
    tuitionStudents,
    statusFilter,
    selectedMonth,
    currentMonth,
    isFutureMonth,
    isPastMonth,
    getTuition,
  ]);

  return (
    <div className="min-h-full bg-slate-50/40 p-6">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <CreditCard className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                Học phí
              </h1>

              <p className="text-sm text-slate-500">
                Quản lý học phí học viên theo từng tháng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 shadow-sm">
          <CalendarDays className="h-5 w-5 text-slate-500" />

          <span className="text-sm font-medium text-slate-500">Kỳ học phí</span>

          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => {
              setSelectedMonth(event.target.value);
              setStatusFilter("all");
            }}
            className="rounded-lg border-0 bg-transparent text-sm font-semibold text-slate-800 outline-none"
          />
        </div>
      </div>

      {/* ==========================================
          THÔNG BÁO THÁNG TƯƠNG LAI
      ========================================== */}

      {isFutureMonth && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="font-semibold text-blue-900">
              Chưa tới kỳ thu học phí
            </p>

            <p className="mt-1 text-sm text-blue-700">
              {getMonthLabel(selectedMonth)} chưa tới kỳ thu. Các học viên chưa
              lập học phí sẽ hiển thị <strong>Chưa lập</strong>. Nếu học viên
              muốn <strong>đóng trước</strong>, Khoa vẫn có thể lập và xác nhận
              đã đóng.
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          THÔNG BÁO THÁNG HIỆN TẠI
      ========================================== */}

      {isCurrentMonth && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
          <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

          <div>
            <p className="font-semibold text-blue-900">Kỳ học phí hiện tại</p>

            <p className="mt-1 text-sm text-blue-700">
              Học viên chưa được lập học phí sẽ hiển thị{" "}
              <strong>Chưa lập</strong>. Hãy lập học phí trước khi xác nhận
              thanh toán.
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          THÔNG BÁO THÁNG CŨ
      ========================================== */}

      {isPastMonth && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

          <div>
            <p className="font-semibold text-amber-900">
              Đang xem kỳ học phí đã qua
            </p>

            <p className="mt-1 text-sm text-amber-700">
              Học viên chưa có bản ghi học phí sẽ được xem là{" "}
              <strong>Quá hạn</strong>. Học viên vẫn có thể đóng trễ và hệ thống
              sẽ lưu ngày thanh toán thực tế.
            </p>
          </div>
        </div>
      )}

      {/* ==========================================
          SUMMARY
      ========================================== */}

      <div
        className={`mb-6 grid gap-4 sm:grid-cols-2 ${
          isStaff ? "xl:grid-cols-4" : "xl:grid-cols-5"
        }`}
      >
        <SummaryCard
          title="Học viên"
          value={String(tuitionStudents.length)}
          description="Học viên thuộc các lớp"
          icon={<Users className="h-5 w-5 text-slate-700" />}
          iconClassName="bg-slate-100"
        />

        {!isStaff && (
          <SummaryCard
            title="Phải thu"
            value={isFutureMonth ? "0 đ" : formatMoney(stats.totalAmount)}
            description={
              isFutureMonth
                ? `${stats.notCreatedCount} chưa lập`
                : isCurrentMonth
                  ? `${stats.notCreatedCount} chưa lập`
                  : "Tổng học phí của kỳ"
            }
            icon={<DollarSign className="h-5 w-5 text-slate-700" />}
            iconClassName="bg-slate-100"
          />
        )}

        <SummaryCard
          title="Đã đóng"
          value={String(stats.paidCount)}
          description={`${stats.paidCount} học viên đã đóng`}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
          iconClassName="bg-green-50"
        />

        <SummaryCard
          title="Chưa đóng"
          value={String(stats.unpaidCount)}
          description={`${stats.unpaidCount} học viên chưa đóng`}
          icon={<Wallet className="h-5 w-5 text-amber-600" />}
          iconClassName="bg-amber-50"
        />

        <SummaryCard
          title="Quá hạn"
          value={String(stats.overdueCount)}
          description={`${stats.overdueCount} học viên`}
          icon={<XCircle className="h-5 w-5 text-red-600" />}
          iconClassName="bg-red-50"
        />
      </div>

      {/* ==========================================
          TRỄ HẠN THÁNG CŨ
      ========================================== */}

      <section className="mb-6 overflow-hidden rounded-2xl border border-red-100 bg-white shadow-sm">
        <div className="border-b border-red-100 bg-gradient-to-r from-red-50 via-white to-white px-5 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
                <Clock3 className="h-5 w-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-slate-900">
                    Học viên trễ hạn tháng cũ
                  </h2>

                  <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                    {overdueStudentCount} học viên
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  Các khoản học phí của những tháng trước chưa được thanh toán.
                </p>
              </div>
            </div>

            {/* STAFF KHÔNG XEM TIỀN */}
            {isStaff ? (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3">
                <Users className="h-4 w-4 text-red-500" />

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Cần nhắc học phí
                  </p>

                  <p className="text-base font-bold text-red-600">
                    {overdueItems.length} khoản
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-white px-4 py-3">
                <Wallet className="h-4 w-4 text-red-500" />

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Tổng còn nợ
                  </p>

                  <p className="text-base font-bold text-red-600">
                    {formatMoney(overdueTotal)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {overdueStudents.length === 0 ? (
          <div className="flex min-h-[150px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>

            <p className="font-medium text-slate-700">
              Không có học viên trễ hạn
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Tất cả học phí của các tháng cũ đã được thanh toán.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {overdueStudents.map((student) => {
              const isExpanded = expandedOverdueStudents.includes(
                student.studentId,
              );

              return (
                <div key={student.studentId} className="group">
                  <div
                    className={`flex flex-col gap-4 px-5 py-4 transition sm:flex-row sm:items-center ${
                      isExpanded ? "bg-slate-50/80" : "hover:bg-slate-50/70"
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {student.studentName.trim().charAt(0).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-slate-800">
                            {student.studentName}
                          </p>

                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                            {student.items.length} tháng
                          </span>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span>{student.phone}</span>

                          <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

                          <span>{student.className}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:max-w-[390px]">
                      {student.items.slice(0, 3).map((item) => (
                        <span
                          key={`${item.studentId}-${item.month}`}
                          className="rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700"
                        >
                          {getMonthLabel(item.month)}
                        </span>
                      ))}

                      {student.items.length > 3 && (
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-500">
                          +{student.items.length - 3}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:min-w-[220px] sm:justify-end">
                      {/* STAFF KHÔNG XEM TỔNG NỢ */}
                      <div className="text-left sm:text-right">
                        {isStaff ? (
                          <>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Cần xử lý
                            </p>

                            <p className="font-bold text-red-600">
                              {student.items.length} tháng
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                              Tổng nợ
                            </p>

                            <p className="font-bold text-red-600">
                              {formatMoney(student.total)}
                            </p>
                          </>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleOverdueStudent(student.studentId)}
                        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
                      >
                        {isExpanded ? "Thu gọn" : "Chi tiết"}

                        <ChevronDown
                          className={`h-3.5 w-3.5 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 px-5 py-3">
                      {isStaff && (
                        <div className="mb-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
                          Staff chỉ xem thông tin để nhắc học phí. Số tiền và
                          thao tác thanh toán được ẩn.
                        </div>
                      )}

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[500px] text-sm">
                          <thead>
                            <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                              <th className="px-3 py-2">Tháng nợ</th>

                              {/* ADMIN / COACH */}
                              {!isStaff && (
                                <th className="px-3 py-2">Số tiền</th>
                              )}

                              <th className="px-3 py-2">Hạn đóng</th>

                              {/* ADMIN / COACH */}
                              {!isStaff && (
                                <th className="px-3 py-2 text-right">Xử lý</th>
                              )}
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-slate-200/70">
                            {student.items.map((item) => (
                              <tr
                                key={`${item.studentId}-${item.month}`}
                                className="transition hover:bg-white"
                              >
                                <td className="px-3 py-3 font-medium text-slate-700">
                                  {getMonthLabel(item.month)}
                                </td>

                                {/* ADMIN / COACH */}
                                {!isStaff && (
                                  <td className="px-3 py-3 font-semibold text-slate-800">
                                    {formatMoney(item.amount)}
                                  </td>
                                )}

                                <td className="px-3 py-3 text-slate-500">
                                  {formatDate(item.dueDate)}
                                </td>

                                {/* ADMIN / COACH */}
                                {!isStaff && (
                                  <td className="px-3 py-3">
                                    <div className="flex justify-end">
                                      <button
                                        type="button"
                                        onClick={() => handlePayOverdue(item)}
                                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-slate-700"
                                      >
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Đã đóng
                                      </button>
                                    </div>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ==========================================
          FILTER
      ========================================== */}

      <div className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-900">Bộ lọc</h2>

          <p className="mt-1 text-sm text-slate-400">
            Tìm kiếm và lọc danh sách học phí
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Tìm học viên
            </label>

            <div className="flex h-10 items-center gap-2 rounded-xl border bg-white px-3 focus-within:border-slate-400">
              <Search className="h-4 w-4 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tên hoặc số điện thoại..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Lớp học
            </label>

            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value)}
              className="h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="all">Tất cả lớp</option>

              {classes.map((classItem) => (
                <option key={classItem.id} value={classItem.name}>
                  {classItem.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              Trạng thái
            </label>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đã đóng">Đã đóng</option>
              <option value="Chưa lập">Chưa lập</option>
              <option value="Chưa đóng">Chưa đóng</option>
              <option value="Quá hạn">Quá hạn</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==========================================
          TABLE
      ========================================== */}

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Danh sách học phí</h2>

            <p className="mt-1 text-sm text-slate-400">
              {filteredStudents.length} học viên
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <CreditCard className="h-4 w-4" />

            {getMonthLabel(selectedMonth)}
          </div>
        </div>

        {filteredStudents.length === 0 ? (
          <div className="flex min-h-[240px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Users className="h-5 w-5 text-slate-400" />
            </div>

            <p className="font-medium text-slate-700">
              Không tìm thấy học viên
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">STT</th>
                  <th className="px-4 py-3">Học viên</th>
                  <th className="px-4 py-3">Lớp</th>
                  <th className="px-4 py-3">Học phí</th>
                  <th className="px-4 py-3">Hạn đóng</th>
                  <th className="px-4 py-3">Ngày đóng</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredStudents.map((student, index) => {
                  const record = getTuition(student.id, selectedMonth);

                  const status = getDisplayStatus(student.id);
                  const amount = getDisplayAmount(student.id);

                  const dueDate =
                    record?.dueDate ||
                    (!isFutureMonth ? getDueDate(selectedMonth) : "");

                  const paidDate = record?.paidDate || "";

                  const isPaid = status === "Đã đóng";
                  const isNotCreated = status === "Chưa lập";

                  return (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-4 text-slate-400">{index + 1}</td>

                      <td className="px-4 py-4">
                        <div className="font-medium text-slate-800">
                          {student.name}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {student.phone}
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                          {student.className}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        {isStaff ? (
                          <span className="text-slate-400">Ẩn</span>
                        ) : (
                          formatMoney(amount)
                        )}
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {formatDate(dueDate)}
                      </td>

                      <td className="px-4 py-4 text-slate-500">
                        {formatDate(paidDate)}
                      </td>

                      <td className="px-4 py-4">{getStatusBadge(status)}</td>

                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          {isStaff ? (
                            <span className="rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-400">
                              Chỉ xem
                            </span>
                          ) : isNotCreated ? (
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleCreateTuition(student.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                              >
                                <Plus className="h-3.5 w-3.5" />
                                Lập học phí
                              </button>

                              <button
                                type="button"
                                onClick={() => handleMarkAsPaid(student.id)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Đóng luôn
                              </button>
                            </div>
                          ) : isPaid ? (
                            <button
                              type="button"
                              onClick={() => handleMarkAsUnpaid(student.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                            >
                              <Clock3 className="h-3.5 w-3.5" />
                              Hủy đóng
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkAsPaid(student.id)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Đã đóng
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
