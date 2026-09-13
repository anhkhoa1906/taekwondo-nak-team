"use client";

import { useEffect, useRef, useState } from "react";

import {
  Building2,
  Camera,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Mail,
  MapPin,
  Save,
  Settings,
  ShieldCheck,
  Upload,
  UserRound,
  Wallet,
  X,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";

import { useSettings } from "@/context/settings-context";
import { useAuth } from "@/context/auth-context";
import { useRole } from "@/hooks/use-role";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();

  const { isStaff, isAdmin, isCoach } = useRole();

  const { user, profile, updateProfile } = useAuth();

  // ===================================================
  // CLUB SETTINGS
  // ===================================================

  const [form, setForm] = useState(settings);

  const [saved, setSaved] = useState(false);

  // ===================================================
  // PROFILE
  // ===================================================

  const [profileName, setProfileName] = useState("");

  const [profileAvatar, setProfileAvatar] = useState("");

  const [profileSaved, setProfileSaved] = useState(false);

  const [profileError, setProfileError] = useState("");

  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const profileFileInputRef = useRef<HTMLInputElement | null>(null);

  // ===================================================
  // SYNC CLUB SETTINGS
  // ===================================================

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  // ===================================================
  // SYNC PROFILE
  // ===================================================

  useEffect(() => {
    setProfileName(profile?.display_name || user?.email?.split("@")[0] || "");

    setProfileAvatar(profile?.avatar_url || "");
  }, [profile?.display_name, profile?.avatar_url, user?.email]);

  // ===================================================
  // CLUB SETTINGS CHANGE
  // ===================================================

  const handleChange = (field: keyof typeof form, value: string | number) => {
    if (isStaff) return;

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setSaved(false);
  };

  // ===================================================
  // SAVE CLUB SETTINGS
  // ===================================================

  const handleSave = async () => {
    if (isStaff) return;

    await updateSettings(form);

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  // ===================================================
  // PROFILE AVATAR UPLOAD
  // ===================================================

  const handleProfileAvatarUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) return;

    setProfileError("");

    if (file.size > 2 * 1024 * 1024) {
      setProfileError("Ảnh không được vượt quá 2MB.");

      return;
    }

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setProfileError("Chỉ hỗ trợ JPG, PNG hoặc WEBP.");

      return;
    }

    if (!user?.id) {
      setProfileError("Không xác định được tài khoản.");

      return;
    }

    setUploadingAvatar(true);

    try {
      const supabase = createClient();

      const extension = file.name.split(".").pop() || "jpg";

      const filePath = `${user.id}/${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        console.error("Lỗi upload avatar profile:", uploadError);

        setProfileError("Không thể tải ảnh lên. Vui lòng thử lại.");

        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("profile-avatars")
        .getPublicUrl(filePath);

      setProfileAvatar(publicUrlData.publicUrl);
    } catch (error) {
      console.error(error);

      setProfileError("Có lỗi xảy ra khi tải ảnh.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // ===================================================
  // REMOVE PROFILE AVATAR
  // ===================================================

  const handleRemoveProfileAvatar = () => {
    setProfileAvatar("");
    setProfileSaved(false);
    setProfileError("");
  };

  // ===================================================
  // SAVE PROFILE
  // ===================================================

  const handleSaveProfile = async () => {
    setProfileError("");

    if (!profileName.trim()) {
      setProfileError("Họ và tên không được để trống.");

      return;
    }

    const result = await updateProfile(profileName.trim(), profileAvatar);

    if (result.error) {
      setProfileError(result.error);

      return;
    }

    setProfileSaved(true);

    setTimeout(() => {
      setProfileSaved(false);
    }, 3000);
  };

  // ===================================================
  // PROFILE INITIALS
  // ===================================================

  const profileInitials =
    profileName
      .trim()
      .split(/\s+/)
      .slice(-2)
      .map((item) => item.charAt(0))
      .join("")
      .toUpperCase() || "NA";

  // ===================================================
  // ROLE LABEL
  // ===================================================

  const roleLabel = isAdmin
    ? "Quản trị viên"
    : isCoach
      ? "Huấn luyện viên"
      : "Nhân viên";

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
                  Quản lý thông tin tài khoản và cấu hình CLB
                </p>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-full border bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm sm:self-auto">
            <ShieldCheck className="h-4 w-4 text-slate-500" />

            {roleLabel}
          </div>
        </div>

        {/* ==========================================
            PROFILE
        ========================================== */}

        <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          {/* HEADER */}

          <div className="border-b px-6 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                <UserRound className="h-5 w-5 text-slate-700" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">Hồ sơ cá nhân</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Quản lý tên hiển thị và ảnh đại diện của tài khoản.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {/* PROFILE TOP */}

            <div className="rounded-2xl border bg-slate-50 p-5">
              <div className="flex flex-col items-center gap-5 sm:flex-row">
                {/* AVATAR */}

                <div className="relative shrink-0">
                  {profileAvatar ? (
                    <img
                      src={profileAvatar}
                      alt={profileName || "Avatar"}
                      className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-white"
                    />
                  ) : (
                    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-950 text-2xl font-black text-white shadow-lg ring-4 ring-white">
                      {profileInitials}
                    </div>
                  )}

                  <div className="absolute bottom-1 right-1 flex h-9 w-9 items-center justify-center rounded-full border-4 border-slate-50 bg-slate-900 text-white shadow-md">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>

                {/* INFO */}

                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <p className="text-lg font-bold text-slate-900">
                    {profileName || "Tài khoản"}
                  </p>

                  <div className="mt-1 flex flex-col gap-1 text-sm text-slate-500 sm:flex-row sm:items-center sm:gap-2">
                    <span className="inline-flex items-center justify-center gap-1.5 sm:justify-start">
                      <Mail className="h-3.5 w-3.5" />
                      {user?.email || "Chưa cập nhật"}
                    </span>

                    <span className="hidden sm:inline">•</span>

                    <span className="font-medium text-red-500">
                      {roleLabel}
                    </span>
                  </div>

                  <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                    <button
                      type="button"
                      disabled={uploadingAvatar}
                      onClick={() => profileFileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl border bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Upload className="h-4 w-4 animate-pulse" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <ImagePlus className="h-4 w-4" />
                          {profileAvatar ? "Đổi ảnh" : "Thêm ảnh"}
                        </>
                      )}
                    </button>

                    {profileAvatar && (
                      <button
                        type="button"
                        disabled={uploadingAvatar}
                        onClick={handleRemoveProfileAvatar}
                        className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        Xóa ảnh
                      </button>
                    )}
                  </div>

                  <input
                    ref={profileFileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleProfileAvatarUpload}
                  />

                  <p className="mt-2 text-[11px] text-slate-400">
                    JPG, PNG hoặc WEBP · tối đa 2MB
                  </p>
                </div>
              </div>
            </div>

            {/* ERROR */}

            {profileError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {profileError}
              </div>
            )}

            {/* FIELDS */}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {/* NAME */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <UserRound className="h-4 w-4 text-slate-400" />
                  Họ và tên
                </label>

                <input
                  value={profileName}
                  onChange={(e) => {
                    setProfileName(e.target.value);

                    setProfileSaved(false);
                  }}
                  placeholder="Phạm Văn Vũ"
                  className="h-11 w-full rounded-xl border bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-slate-900 focus:ring-2 focus:ring-slate-900/5"
                />
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400" />
                  Email
                </label>

                <input
                  value={user?.email || ""}
                  disabled
                  className="h-11 w-full cursor-not-allowed rounded-xl border bg-slate-100 px-3 text-sm text-slate-400 outline-none"
                />

                <p className="mt-1.5 text-[11px] text-slate-400">
                  Email đăng nhập không thể thay đổi tại đây.
                </p>
              </div>
            </div>

            {/* SAVE PROFILE */}

            <div className="mt-6 flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-end">
              {profileSaved && (
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                  Đã lưu hồ sơ
                </div>
              )}

              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={handleSaveProfile}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Lưu hồ sơ
              </button>
            </div>
          </div>
        </section>

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

              <FormField label="Slogan" icon={<Settings className="h-4 w-4" />}>
                <input
                  disabled={isStaff}
                  value={form.slogan}
                  onChange={(e) => handleChange("slogan", e.target.value)}
                  className={inputClass(isStaff)}
                  placeholder="Slogan của CLB"
                />
              </FormField>

              <FormField label="Số điện thoại" icon={<PhoneIcon />}>
                <input
                  type="tel"
                  disabled={isStaff}
                  value={form.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className={inputClass(isStaff)}
                  placeholder="Số điện thoại"
                />
              </FormField>

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
            SAVE CLUB SETTINGS
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

// =====================================================
// COMPONENTS
// =====================================================

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

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
