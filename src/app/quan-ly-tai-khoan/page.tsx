"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Eye,
  Lock,
  Mail,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserRound,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useRole } from "@/hooks/use-role";

type AccountRole = "admin" | "coach" | "staff";

type Account = {
  id: string;
  name: string;
  email: string;
  role: AccountRole;
  status: "active" | "inactive";
  created_at: string;
  updated_at: string;
};

const roleLabels: Record<AccountRole, string> = {
  admin: "Admin",
  coach: "Coach",
  staff: "Staff",
};

const roleVariants: Record<AccountRole, "default" | "secondary" | "outline"> = {
  admin: "default",
  coach: "secondary",
  staff: "outline",
};

export default function QuanLyTaiKhoanPage() {
  const { isAdmin, loading: roleLoading } = useRole();

  const [accounts, setAccounts] = useState<Account[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | AccountRole>("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("coach");
  const [saving, setSaving] = useState(false);

  // ==========================================
  // LOAD ACCOUNTS
  // ==========================================

  useEffect(() => {
    if (roleLoading) return;

    if (!isAdmin) {
      setLoading(false);
      return;
    }

    async function loadAccounts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/quan-ly-tai-khoan", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Không thể tải danh sách tài khoản.");
        }

        setAccounts(data.accounts ?? []);
      } catch (err) {
        console.error(err);

        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách tài khoản.",
        );
      } finally {
        setLoading(false);
      }
    }

    loadAccounts();
  }, [isAdmin, roleLoading]);

  // ==========================================
  // FILTER
  // ==========================================

  const filteredAccounts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return accounts.filter((account) => {
      const matchesSearch =
        !keyword ||
        account.name.toLowerCase().includes(keyword) ||
        account.email.toLowerCase().includes(keyword);

      const matchesRole = roleFilter === "all" || account.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" || account.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, search, roleFilter, statusFilter]);

  // ==========================================
  // OPEN ADD
  // ==========================================

  function handleOpenAdd() {
    setEditingAccount(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("coach");
    setOpen(true);
  }

  // ==========================================
  // OPEN EDIT
  // ==========================================

  function handleOpenEdit(account: Account) {
    setEditingAccount(account);
    setName(account.name);
    setEmail(account.email);
    setPassword("");
    setRole(account.role);
    setOpen(true);
  }

  // ==========================================
  // OPEN VIEW
  // ==========================================

  function handleOpenView(account: Account) {
    setSelectedAccount(account);
    setViewOpen(true);
  }

  // ==========================================
  // SAVE
  // ==========================================

  async function handleSave() {
    if (!name.trim()) {
      alert("Vui lòng nhập tên.");
      return;
    }

    if (!email.trim()) {
      alert("Vui lòng nhập email.");
      return;
    }

    if (!editingAccount && password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setSaving(true);

      // ========================================
      // CREATE
      // ========================================

      if (!editingAccount) {
        const response = await fetch("/api/quan-ly-tai-khoan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Không thể tạo tài khoản.");
        }

        setAccounts((prev) => [...prev, data.account]);

        alert("Đã tạo tài khoản thành công.");
      }

      // ========================================
      // UPDATE
      // ========================================
      else {
        const response = await fetch("/api/quan-ly-tai-khoan", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: editingAccount.id,
            name: name.trim(),
            email: email.trim(),
            role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error || "Không thể cập nhật tài khoản.");
        }

        setAccounts((prev) =>
          prev.map((account) =>
            account.id === editingAccount.id ? data.account : account,
          ),
        );

        alert("Đã cập nhật tài khoản thành công.");
      }

      setOpen(false);
      setName("");
      setEmail("");
      setPassword("");
      setRole("coach");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "Không thể xử lý tài khoản.",
      );
    } finally {
      setSaving(false);
    }
  }

  // ==========================================
  // DELETE
  // ==========================================

  async function handleDelete(account: Account) {
    if (account.role === "admin") {
      alert("Không thể xóa tài khoản Admin.");
      return;
    }

    const confirmDelete = window.confirm(
      `Bạn có chắc muốn xóa tài khoản "${account.email}" không?`,
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch("/api/quan-ly-tai-khoan", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: account.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Không thể xóa tài khoản.");
      }

      setAccounts((prev) => prev.filter((item) => item.id !== account.id));

      alert("Đã xóa tài khoản thành công.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error ? error.message : "Không thể xóa tài khoản.",
      );
    }
  }

  // ==========================================
  // TOGGLE STATUS
  // ==========================================

  async function handleToggleStatus(account: Account) {
    if (account.role === "admin") {
      alert("Không thể khóa tài khoản Admin.");
      return;
    }

    const isCurrentlyActive = account.status === "active";

    const confirmAction = window.confirm(
      isCurrentlyActive
        ? `Bạn có chắc muốn khóa tài khoản "${account.email}" không?`
        : `Bạn có muốn mở khóa tài khoản "${account.email}" không?`,
    );

    if (!confirmAction) return;

    try {
      const response = await fetch("/api/quan-ly-tai-khoan", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: account.id,
          action: isCurrentlyActive ? "ban" : "unban",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Không thể cập nhật trạng thái tài khoản.",
        );
      }

      setAccounts((prev) =>
        prev.map((item) => (item.id === account.id ? data.account : item)),
      );

      alert(isCurrentlyActive ? "Đã khóa tài khoản." : "Đã mở khóa tài khoản.");
    } catch (error) {
      console.error(error);

      alert(
        error instanceof Error
          ? error.message
          : "Không thể cập nhật trạng thái tài khoản.",
      );
    }
  }

  // ==========================================
  // ROLE CHECK
  // ==========================================

  if (roleLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-slate-300" />

          <h2 className="text-lg font-semibold text-slate-800">
            Không có quyền truy cập
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Chỉ Admin mới có thể quản lý tài khoản.
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATS
  // ==========================================

  const adminCount = accounts.filter(
    (account) => account.role === "admin",
  ).length;

  const coachCount = accounts.filter(
    (account) => account.role === "coach",
  ).length;

  const staffCount = accounts.filter(
    (account) => account.role === "staff",
  ).length;

  const activeCount = accounts.filter(
    (account) => account.status === "active",
  ).length;

  const inactiveCount = accounts.filter(
    (account) => account.status === "inactive",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8">
      <div className="space-y-6">
        {/* ========================================
            HEADER
        ======================================== */}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Quản lý tài khoản
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Quản lý tài khoản và quyền truy cập hệ thống
                </p>
              </div>
            </div>
          </div>

          <Button onClick={handleOpenAdd} className="self-start lg:self-auto">
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài khoản
          </Button>
        </div>

        {/* ========================================
            ERROR
        ======================================== */}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ========================================
            STATS
        ======================================== */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Tổng tài khoản"
            value={accounts.length}
            description={`${activeCount} đang hoạt động`}
            icon={<UserRound className="h-5 w-5" />}
          />

          <StatCard
            title="Admin"
            value={adminCount}
            description="Quản trị hệ thống"
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <StatCard
            title="Coach"
            value={coachCount}
            description="Huấn luyện viên"
            icon={<UserRound className="h-5 w-5" />}
          />

          <StatCard
            title="Staff"
            value={staffCount}
            description={`${inactiveCount} tài khoản đang khóa`}
            icon={<Lock className="h-5 w-5" />}
          />
        </div>

        {/* ========================================
            FILTER
        ======================================== */}

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="font-semibold text-slate-900">Bộ lọc</h2>

            <p className="mt-1 text-sm text-slate-400">
              Tìm kiếm và lọc tài khoản
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_220px_220px]">
            {/* SEARCH */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Tìm tài khoản
              </label>

              <div className="flex h-10 items-center gap-2 rounded-xl border bg-white px-3 focus-within:border-slate-400">
                <Search className="h-4 w-4 text-slate-400" />

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Tên hoặc email..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* ROLE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Vai trò
              </label>

              <select
                value={roleFilter}
                onChange={(e) =>
                  setRoleFilter(e.target.value as "all" | AccountRole)
                }
                className="h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="all">Tất cả vai trò</option>

                <option value="admin">Admin</option>

                <option value="coach">Coach</option>

                <option value="staff">Staff</option>
              </select>
            </div>

            {/* STATUS */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                Trạng thái
              </label>

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value as "all" | "active" | "inactive",
                  )
                }
                className="h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="all">Tất cả trạng thái</option>

                <option value="active">Đang hoạt động</option>

                <option value="inactive">Tạm khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================
            TABLE
        ======================================== */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="flex flex-col gap-2 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Danh sách tài khoản
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Hiển thị {filteredAccounts.length} / {accounts.length} tài khoản
              </p>
            </div>

            {(search || roleFilter !== "all" || statusFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setRoleFilter("all");
                  setStatusFilter("all");
                }}
                className="text-sm font-medium text-slate-500 hover:text-slate-900"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          {loading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <p className="text-sm text-slate-500">Đang tải tài khoản...</p>
            </div>
          ) : filteredAccounts.length === 0 ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <UserRound className="h-5 w-5 text-slate-400" />
              </div>

              <p className="font-medium text-slate-700">
                Không tìm thấy tài khoản
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Thử thay đổi từ khóa hoặc bộ lọc.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      STT
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Tài khoản
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Email
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Vai trò
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Trạng thái
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Thao tác
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filteredAccounts.map((account, index) => (
                    <tr
                      key={account.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4 text-slate-400">{index + 1}</td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <UserRound className="h-4 w-4 text-slate-600" />
                          </div>

                          <span className="font-medium text-slate-800">
                            {account.name}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="h-4 w-4 text-slate-400" />

                          {account.email}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <Badge variant={roleVariants[account.role]}>
                          {roleLabels[account.role]}
                        </Badge>
                      </td>

                      <td className="px-5 py-4">
                        {account.status === "active" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                            Đang hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                            Tạm khóa
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenView(account)}
                            title="Xem"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEdit(account)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(account)}
                            title={
                              account.status === "active"
                                ? "Khóa tài khoản"
                                : "Mở khóa tài khoản"
                            }
                          >
                            {account.status === "active" ? (
                              <Lock className="h-4 w-4 text-orange-500" />
                            ) : (
                              <Unlock className="h-4 w-4 text-green-600" />
                            )}
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(account)}
                            title="Xóa"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ========================================
            ADD / EDIT DIALOG
        ======================================== */}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Tên
                </label>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>

              {!editingAccount && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Mật khẩu
                  </label>

                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                  />
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Vai trò
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AccountRole)}
                  className="h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-900"
                >
                  <option value="coach">Coach</option>

                  <option value="staff">Staff</option>

                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 border-t pt-4">
                <Button
                  variant="outline"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Hủy
                </Button>

                <Button onClick={handleSave} disabled={saving}>
                  {saving
                    ? "Đang xử lý..."
                    : editingAccount
                      ? "Lưu thay đổi"
                      : "Thêm tài khoản"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* ========================================
            VIEW DIALOG
        ======================================== */}

        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Thông tin tài khoản</DialogTitle>
            </DialogHeader>

            {selectedAccount && (
              <div className="space-y-5">
                <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                    <UserRound className="h-5 w-5 text-slate-600" />
                  </div>

                  <div>
                    <p className="font-semibold text-slate-900">
                      {selectedAccount.name}
                    </p>

                    <div className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                      <Mail className="h-4 w-4" />

                      {selectedAccount.email}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Vai trò
                    </p>

                    <div className="mt-2">
                      <Badge variant={roleVariants[selectedAccount.role]}>
                        {roleLabels[selectedAccount.role]}
                      </Badge>
                    </div>
                  </div>

                  <div className="rounded-xl border p-4">
                    <p className="text-xs font-medium text-slate-400">
                      Trạng thái
                    </p>

                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {selectedAccount.status === "active"
                        ? "Đang hoạt động"
                        : "Tạm khóa"}
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs font-medium text-slate-400">Ngày tạo</p>

                  <p className="mt-1 text-sm text-slate-700">
                    {selectedAccount.created_at
                      ? new Date(selectedAccount.created_at).toLocaleString(
                          "vi-VN",
                        )
                      : "-"}
                  </p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
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

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{description}</p>
    </div>
  );
}
