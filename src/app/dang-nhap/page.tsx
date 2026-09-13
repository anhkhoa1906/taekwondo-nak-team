"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn, Shield } from "lucide-react";

import { useAuth } from "@/context/auth-context";

export default function DangNhapPage() {
  const router = useRouter();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Vui lòng nhập đầy đủ email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);

      const result = await signIn(email.trim(), password);

      if (result.error) {
        setError("Email hoặc mật khẩu không chính xác.");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#07101f] px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-900/20 blur-3xl" />
        <div className="absolute -bottom-48 -right-40 h-[600px] w-[600px] rounded-full bg-[#c9a45c]/10 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-[26px] border border-white/10 bg-white shadow-2xl lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden min-h-[650px] overflow-hidden bg-[#07101f] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(37,99,235,0.13),transparent_38%),radial-gradient(circle_at_85%_85%,rgba(201,164,92,0.10),transparent_35%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-12">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-white/20">
                <img
                  src="/nak-team-logo.png"
                  alt="NAK TEAM"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <h1 className="text-xl font-black tracking-wide text-white">
                  NAK TEAM
                </h1>
                <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#c9a45c]">
                  TAEKWONDO SYSTEM
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <div className="mb-5 h-px w-14 bg-[#c9a45c]" />

              <h2 className="text-4xl font-black uppercase leading-[1.02] tracking-tight text-white xl:text-5xl">
                NAK TEAM
              </h2>

              <p className="mt-3 text-lg font-medium text-[#c9a45c]">
                TAEKWONDO SYSTEM
              </p>

              <p className="mt-6 max-w-sm text-sm leading-7 text-slate-400">
                Hệ thống quản lý CLB Taekwondo — quản lý học viên, lớp học, điểm
                danh, học phí và cấp đai.
              </p>
            </div>

            <div className="border-t border-white/[0.08] pt-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                DISCIPLINE BUILDS BETTER PEOPLE
              </p>
            </div>
          </div>
        </section>

        <section className="flex min-h-[650px] items-center bg-white p-7 sm:p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-1 ring-slate-200">
                <img
                  src="/nak-team-logo.png"
                  alt="NAK TEAM"
                  className="h-full w-full object-cover"
                />
              </div>

              <div>
                <p className="font-black tracking-wide text-slate-950">
                  NAK TEAM
                </p>
                <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#a78343]">
                  TAEKWONDO SYSTEM
                </p>
              </div>
            </div>

            <div className="mb-8">
              <div className="mb-3 flex items-center gap-2">
                <span className="h-1 w-10 rounded-full bg-[#c9a45c]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#a78343]">
                  MEMBER LOGIN
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-slate-950">
                Chào mừng trở lại
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Đăng nhập để quản lý hoạt động của CLB.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c9a45c] focus:bg-white focus:ring-4 focus:ring-[#c9a45c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

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
                    placeholder="Nhập mật khẩu"
                    autoComplete="current-password"
                    disabled={loading}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#c9a45c] focus:bg-white focus:ring-4 focus:ring-[#c9a45c]/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={loading}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    className="absolute right-0 top-0 flex h-12 w-12 items-center justify-center text-slate-400 transition hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
                >
                  <Shield className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#b58b45] px-4 text-sm font-bold text-white shadow-lg shadow-[#b58b45]/20 transition hover:bg-[#9f7839] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    Đăng nhập
                  </>
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                Chưa có tài khoản?{" "}
                <a
                  href="/dang-ky"
                  className="font-bold text-[#9f7839] transition hover:text-[#7f5f2c] hover:underline"
                >
                  Đăng ký
                </a>
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <Shield className="h-3.5 w-3.5" />
              <span>NAK TEAM · TAEKWONDO SYSTEM</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
