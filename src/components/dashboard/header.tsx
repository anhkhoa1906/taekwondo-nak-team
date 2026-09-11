import { Bell, Search, ChevronDown } from "lucide-react";

export default function Header() {
  return (
    <header className="flex h-20 items-center justify-between border-b bg-white px-8">
      {/* Search */}
      <div className="flex w-full max-w-xl items-center gap-3 rounded-xl border bg-slate-50 px-4 py-2.5">
        <Search className="h-5 w-5 text-slate-400" />

        <input
          type="text"
          placeholder="Tìm kiếm học viên, lớp học..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
        />

        <span className="rounded-md border bg-white px-2 py-1 text-xs text-slate-400">
          Ctrl K
        </span>
      </div>

      {/* Right */}
      <div className="ml-6 flex items-center gap-5">
        {/* Notification */}
        <button className="relative">
          <Bell className="h-5 w-5 text-slate-600" />

          <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        {/* Admin */}
        <button className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-lg">
            👤
          </div>

          <span className="text-sm font-semibold text-slate-800">Admin</span>

          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
      </div>
    </header>
  );
}
