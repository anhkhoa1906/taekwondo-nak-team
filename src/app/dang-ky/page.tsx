"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Shield, Swords, Trophy, UserPlus } from "lucide-react";

import { useAuth } from "@/context/auth-context";

export default function DangKyPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email.trim() || !password || !confirmPassword) {
      setError("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    if (password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setLoading(true);

      const result = await signUp(email.trim(), password);

      if (result.error) {
        setError(result.error);
        return;
      }

      setSuccess(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.",
      );

      setTimeout(() => {
        router.push("/dang-nhap");
      }, 2000);
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-slate-950">
      {/* =========================================
          BACKGROUND
      ========================================= */}

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-40 h-[650px] w-[650px] rotate-12 bg-red-600/20 blur-3xl" />

        <div className="absolute -bottom-48 -left-40 h-[600px] w-[600px] -rotate-12 bg-blue-600/10 blur-3xl" />

        <div className="absolute right-[-180px] top-[18%] h-32 w-[700px] rotate-[-28deg] bg-red-600/10" />

        <div className="absolute bottom-[15%] left-[-250px] h-24 w-[650px] rotate-[-28deg] bg-white/[0.03]" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "45px 45px",
          }}
        />
      </div>

      {/* =========================================
          MAIN CARD
      ========================================= */}

      <div className="relative z-10 flex min-h-screen w-full items-center justify-center px-5 py-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-2xl lg:grid-cols-2">
          {/* =====================================
              LEFT - MARTIAL ARTS
          ===================================== */}

          <div className="relative hidden min-h-[700px] overflow-hidden bg-slate-950 lg:flex">
            {/* Red diagonal */}

            <div className="absolute -right-28 -top-24 h-[520px] w-[520px] rotate-[22deg] bg-red-600" />

            <div className="absolute -right-52 -top-10 h-[500px] w-[300px] rotate-[22deg] bg-red-700/40" />

            <div className="absolute inset-0 bg-gradient-to-br from-slate-950/90 via-slate-950/50 to-transparent" />

            <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-12">
              {/* Brand */}

              <div className="flex items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white text-slate-950 shadow-xl">
                  <div className="absolute inset-1 rounded-full border border-slate-300" />

                  <Swords className="relative h-7 w-7" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-red-500">
                    Martial Arts
                  </p>

                  <h1 className="text-xl font-black tracking-wide text-white">
                    NAK TEAM
                  </h1>
                </div>
              </div>

              {/* Main */}

              <div className="max-w-md">
                <div className="mb-5 flex items-center gap-3">
                  <div className="h-1 w-12 bg-red-600" />

                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-red-400">
                    Start Your Journey
                  </span>
                </div>

                <h2 className="text-5xl font-black uppercase leading-[0.95] tracking-tight text-white xl:text-6xl">
                  Rèn luyện
                  <br />
                  <span className="text-red-500">Ý chí</span>
                  <br />
                  Vươn tầm
                </h2>

                <p className="mt-7 max-w-sm text-sm leading-7 text-slate-300">
                  Tạo tài khoản để bắt đầu sử dụng hệ thống quản lý Taekwondo
                  NAK Team.
                </p>
              </div>

              {/* Features */}

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-red-500">
                    <Trophy className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">Quản lý CLB</p>

                    <p className="text-xs text-slate-400">
                      Học viên · Lớp học · Điểm danh
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-red-500">
                    <Shield className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-white">
                      Phân quyền bảo mật
                    </p>

                    <p className="text-xs text-slate-400">
                      Admin · Coach · Staff
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================
              RIGHT - REGISTER
          ===================================== */}

          <div className="flex items-center bg-white p-7 sm:p-10 lg:p-12">
            <div className="w-full">
              {/* Mobile brand */}

              <div className="mb-8 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-950 text-white">
                  <Swords className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-600">
                    Martial Arts
                  </p>

                  <p className="font-black text-slate-950">
                    TAEKWONDO NAK TEAM
                  </p>
                </div>
              </div>

              {/* Heading */}

              <div className="mb-7">
                <div className="mb-3 flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-red-600" />

                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                    Create Account
                  </span>
                </div>

                <h2 className="text-3xl font-black tracking-tight text-slate-950">
                  Tạo tài khoản
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Tham gia hệ thống quản lý Taekwondo NAK Team.
                </p>
              </div>

              {/* Accent */}

              <div className="mb-7 flex items-center gap-2">
                <div className="h-1 w-16 rounded-full bg-red-600" />

                <div className="h-1 w-2 rounded-full bg-slate-200" />

                <div className="h-1 w-2 rounded-full bg-slate-200" />
              </div>

              {/* Form */}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    autoComplete="email"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Mật khẩu
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Ít nhất 6 ký tự"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Mật khẩu tối thiểu 6 ký tự.
                  </p>
                </div>

                {/* Confirm password */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Xác nhận mật khẩu
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                      disabled={loading}
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-4 focus:ring-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      disabled={loading}
                      aria-label={
                        showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                  >
                    <Shield className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>{error}</span>
                  </div>
                )}

                {/* Success */}

                {success && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
                  >
                    <Shield className="mt-0.5 h-4 w-4 shrink-0" />

                    <span>{success}</span>
                  </div>
                )}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading}
                  className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition hover:bg-red-700 hover:shadow-red-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Đang tạo tài khoản...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 transition-transform group-hover:scale-105" />
                      Tạo tài khoản
                    </>
                  )}
                </button>
              </form>

              {/* Login */}

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Đã có tài khoản?{" "}
                  <a
                    href="/dang-nhap"
                    className="font-bold text-red-600 transition hover:text-red-700 hover:underline"
                  >
                    Đăng nhập
                  </a>
                </p>
              </div>

              {/* Footer */}

              <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
                <Shield className="h-3.5 w-3.5" />

                <span>Taekwondo NAK Team · Martial Arts Management</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
