"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  ShieldCheck,
  Wallet,
} from "lucide-react";

import { useSettings } from "@/context/settings-context";
import { useRole } from "@/hooks/use-role";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { isStaff, isAdmin, isCoach } = useRole();

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  /**
   * Đồng bộ form khi settings được tải từ Supabase.
   */
  useEffect(() => {
    setForm(settings);
  }, [settings]);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    if (isStaff) return;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = async () => {
    if (isStaff) return;

    await updateSettings(form);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Settings className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Cài đặt
                </h1>

                <p className="text-sm text-slate-500">
                  Quản lý thông tin và cấu hình CLB
                </p>
              </div>
            </div>
          </div>

          {/* ROLE */}

          <div className="inline-flex items-center gap-2 self-start rounded-full border bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-slate-500" />

            {isAdmin
              ? "Quản trị viên"
              : isCoach
                ? "Huấn luyện viên"
                : "Nhân viên"}
          </div>
        </div>

        {/* ==========================================
            STAFF NOTICE
        ========================================== */}

        {isStaff && (
          <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

            <div>
              <p className="font-semibold text-blue-900">Chế độ chỉ xem</p>

              <p className="mt-1 text-sm text-blue-700">
                Tài khoản Staff chỉ có quyền xem thông tin cài đặt của CLB. Bạn
                không thể thay đổi hoặc lưu cấu hình.
              </p>
            </div>
          </div>
        )}

        {/* ==========================================
            THÔNG TIN CLB
        ========================================== */}

        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Building2 className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Thông tin câu lạc bộ
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Thông tin cơ bản được sử dụng trong hệ thống.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* TÊN CLB */}

              <FormField
                label="Tên CLB"
                icon={<Building2 className="h-4 w-4" />}
              >
                <input
                  disabled={isStaff}
                  value={form.clubName}
                  onChange={(e) => handleChange("clubName", e.target.value)}
                  className={inputClass(isStaff)}
                  placeholder="Tên câu lạc bộ"
                />
              </FormField>

              {/* SLOGAN */}

              <FormField label="Slogan" icon={<Settings className="h-4 w-4" />}>
                <input
                  disabled={isStaff}
                  value={form.slogan}
                  onChange={(e) => handleChange("slogan", e.target.value)}
                  className={inputClass(isStaff)}
                  placeholder="Slogan của CLB"
                />
              </FormField>

              {/* PHONE */}

              <FormField
                label="Số điện thoại"
                icon={<Phone className="h-4 w-4" />}
              >
                <input
                  type="tel"
                  disabled={isStaff}
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={inputClass(isStaff)}
                  placeholder="Số điện thoại"
                />
              </FormField>

              {/* EMAIL */}

              <FormField label="Email" icon={<Mail className="h-4 w-4" />}>
                <input
                  type="email"
                  disabled={isStaff}
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className={inputClass(isStaff)}
                  placeholder="Email CLB"
                />
              </FormField>

              {/* ADDRESS */}

              <div className="md:col-span-2">
                <FormField
                  label="Địa chỉ"
                  icon={<MapPin className="h-4 w-4" />}
                >
                  <input
                    disabled={isStaff}
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    className={inputClass(isStaff)}
                    placeholder="Địa chỉ CLB"
                  />
                </FormField>
              </div>
            </div>
          </div>
        </section>

        {/* ==========================================
            CẤU HÌNH LỚP HỌC
        ========================================== */}

        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <Wallet className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Cấu hình lớp học
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Thiết lập các thông tin mặc định khi quản lý lớp.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-5 md:grid-cols-2">
              {/* HỌC PHÍ */}

              <FormField
                label="Học phí mặc định"
                icon={<Wallet className="h-4 w-4" />}
              >
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    disabled={isStaff}
                    value={form.defaultTuition}
                    onChange={(e) =>
                      handleChange("defaultTuition", Number(e.target.value))
                    }
                    className={`${inputClass(isStaff)} pr-16`}
                  />

                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    VNĐ
                  </span>
                </div>
              </FormField>

              {/* GIỜ TẬP */}

              <FormField
                label="Khung giờ tập mặc định"
                icon={<Clock3 className="h-4 w-4" />}
              >
                <input
                  disabled={isStaff}
                  value={form.defaultTrainingTime}
                  onChange={(e) =>
                    handleChange("defaultTrainingTime", e.target.value)
                  }
                  className={inputClass(isStaff)}
                  placeholder="18:00 - 19:30"
                />
              </FormField>
            </div>
          </div>
        </section>

        {/* ==========================================
            PREVIEW
        ========================================== */}

        <section className="rounded-2xl border bg-white shadow-sm">
          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <CheckCircle2 className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Thông tin hiện tại
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Xem nhanh cấu hình đang được áp dụng.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <InfoBox label="Tên CLB" value={form.clubName || "-"} />

            <InfoBox label="Số điện thoại" value={form.phone || "-"} />

            <InfoBox
              label="Học phí mặc định"
              value={formatMoney(form.defaultTuition)}
            />

            <InfoBox
              label="Khung giờ"
              value={form.defaultTrainingTime || "-"}
            />
          </div>
        </section>

        {/* ==========================================
            SAVE
        ========================================== */}

        {!isStaff && (
          <div className="flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-end">
            {saved && (
              <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Đã lưu thay đổi
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98]"
            >
              <Save className="h-4 w-4" />
              Lưu cài đặt
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTS
// ==========================================

function FormField({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
        <span className="text-slate-400">{icon}</span>
        {label}
      </label>

      {children}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-slate-50 p-4">
      <p className="text-xs font-medium text-slate-400">{label}</p>

      <p className="mt-2 truncate text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

function inputClass(disabled: boolean) {
  return `h-10 w-full rounded-xl border px-3 text-sm text-slate-800 outline-none transition ${
    disabled
      ? "cursor-not-allowed bg-slate-100 text-slate-400"
      : "bg-white focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
  }`;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value) + " đ";
}
