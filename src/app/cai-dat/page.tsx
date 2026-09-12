"use client";

import { useState } from "react";
import { Save, Settings } from "lucide-react";
import { useSettings } from "@/context/settings-context";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaved(false);
  };

  const handleSave = () => {
    updateSettings(form);
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Settings className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">Cài đặt</h1>
              <p className="text-sm text-slate-500">
                Quản lý thông tin và cấu hình CLB
              </p>
            </div>
          </div>
        </div>

        {/* Thông tin CLB */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Thông tin câu lạc bộ
            </h2>
            <p className="text-sm text-slate-500">
              Thông tin này sẽ được sử dụng trong hệ thống.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Tên CLB</label>

              <input
                value={form.clubName}
                onChange={(e) => handleChange("clubName", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Tên câu lạc bộ"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Slogan</label>

              <input
                value={form.slogan}
                onChange={(e) => handleChange("slogan", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Slogan"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Số điện thoại
              </label>

              <input
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Số điện thoại"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Email</label>

              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Email"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">Địa chỉ</label>

              <input
                value={form.address}
                onChange={(e) => handleChange("address", e.target.value)}
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-900"
                placeholder="Địa chỉ CLB"
              />
            </div>
          </div>
        </div>

        {/* Cấu hình lớp học */}
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-900">
              Cấu hình lớp học
            </h2>
            <p className="text-sm text-slate-500">
              Thiết lập thông tin mặc định khi tạo lớp.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">
                Học phí mặc định
              </label>

              <div className="relative">
                <input
                  type="number"
                  min={0}
                  value={form.defaultTuition}
                  onChange={(e) =>
                    handleChange("defaultTuition", Number(e.target.value))
                  }
                  className="w-full rounded-lg border px-3 py-2 pr-16 outline-none focus:border-slate-900"
                />

                <span className="absolute right-3 top-2.5 text-sm text-slate-500">
                  VNĐ
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Khung giờ tập mặc định
              </label>

              <input
                value={form.defaultTrainingTime}
                onChange={(e) =>
                  handleChange("defaultTrainingTime", e.target.value)
                }
                className="w-full rounded-lg border px-3 py-2 outline-none focus:border-slate-900"
                placeholder="18:00 - 19:30"
              />
            </div>
          </div>
        </div>

        {/* Nút lưu */}
        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-sm font-medium text-green-600">
              Đã lưu thay đổi
            </span>
          )}

          <button
            onClick={handleSave}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Save className="h-4 w-4" />
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
