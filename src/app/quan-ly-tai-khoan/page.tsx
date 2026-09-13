"use client";

import { useEffect, useState } from "react";
import {
  Eye,
  Lock,
  Mail,
  Pencil,
  Plus,
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

  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AccountRole>("coach");
  const [saving, setSaving] = useState(false);

  // =========================
  // LOAD ACCOUNTS
  // =========================
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

  // =========================
  // OPEN ADD
  // =========================
  function handleOpenAdd() {
    setEditingAccount(null);
    setName("");
    setEmail("");
    setPassword("");
    setRole("coach");
    setOpen(true);
  }

  // =========================
  // OPEN EDIT
  // =========================
  function handleOpenEdit(account: Account) {
    setEditingAccount(account);
    setName(account.name);
    setEmail(account.email);
    setRole(account.role);
    setOpen(true);
  }

  // =========================
  // OPEN VIEW
  // =========================
  function handleOpenView(account: Account) {
    setSelectedAccount(account);
    setViewOpen(true);
  }

  // =========================
  // SAVE
  // =========================
  async function handleSave() {
    if (!name.trim()) {
      alert("Vui lòng nhập tên.");
      return;
    }

    if (!email.trim()) {
      alert("Vui lòng nhập email.");
      return;
    }

    // Hiện tại chỉ xử lý tạo tài khoản.
    if (!editingAccount && password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự.");
      return;
    }

    try {
      setSaving(true);

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
      } else {
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
        error instanceof Error ? error.message : "Không thể tạo tài khoản.",
      );
    } finally {
      setSaving(false);
    }
  }

  // =========================
  // DELETE
  // =========================
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

  // =========================
  // TOGGLE STATUS
  // =========================
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

  // =========================
  // CHECK ROLE
  // =========================
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

  // =========================
  // STATS
  // =========================
  const adminCount = accounts.filter(
    (account) => account.role === "admin",
  ).length;

  const coachCount = accounts.filter(
    (account) => account.role === "coach",
  ).length;

  const staffCount = accounts.filter(
    (account) => account.role === "staff",
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý tài khoản
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Quản lý tài khoản và quyền truy cập hệ thống
            </p>
          </div>

          <Button onClick={handleOpenAdd}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài khoản
          </Button>
        </div>

        {/* ERROR */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* STATS */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Tổng tài khoản</p>

            <div className="mt-2 flex items-center gap-2">
              <UserRound className="h-5 w-5" />

              <p className="text-2xl font-bold">{accounts.length}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Admin</p>

            <div className="mt-2 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />

              <p className="text-2xl font-bold">{adminCount}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Coach</p>

            <p className="mt-2 text-2xl font-bold">{coachCount}</p>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">Staff</p>

            <p className="mt-2 text-2xl font-bold">{staffCount}</p>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left">STT</th>

                  <th className="px-4 py-3 text-left">Tài khoản</th>

                  <th className="px-4 py-3 text-left">Email</th>

                  <th className="px-4 py-3 text-left">Vai trò</th>

                  <th className="px-4 py-3 text-left">Trạng thái</th>

                  <th className="px-4 py-3 text-right">Thao tác</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-slate-500"
                    >
                      Đang tải tài khoản...
                    </td>
                  </tr>
                ) : (
                  <>
                    {accounts.map((account, index) => (
                      <tr key={account.id} className="border-b last:border-0">
                        <td className="px-4 py-4">{index + 1}</td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                              <UserRound className="h-4 w-4" />
                            </div>

                            <span className="font-medium">{account.name}</span>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-slate-400" />

                            {account.email}
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant={roleVariants[account.role]}>
                            <ShieldCheck className="mr-1 h-3 w-3" />

                            {roleLabels[account.role]}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <Badge
                            variant={
                              account.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {account.status === "active"
                              ? "Đang hoạt động"
                              : "Tạm khóa"}
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenView(account)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenEdit(account)}
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
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {accounts.length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="py-10 text-center text-slate-500"
                        >
                          Chưa có tài khoản.
                        </td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ADD / EDIT */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Chỉnh sửa tài khoản" : "Thêm tài khoản"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Tên</label>

                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên..."
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>

                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              {!editingAccount && (
                <div>
                  <label className="mb-2 block text-sm font-medium">
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
                <label className="mb-2 block text-sm font-medium">
                  Vai trò
                </label>

                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as AccountRole)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="coach">Coach</option>

                  <option value="staff">Staff</option>

                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
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

        {/* VIEW */}
        <Dialog open={viewOpen} onOpenChange={setViewOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Thông tin tài khoản</DialogTitle>
            </DialogHeader>

            {selectedAccount && (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="font-semibold">{selectedAccount.name}</p>

                  <p className="mt-1 text-sm text-slate-500">
                    {selectedAccount.email}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Vai trò</p>

                  <Badge className="mt-1">
                    {roleLabels[selectedAccount.role]}
                  </Badge>
                </div>

                <div>
                  <p className="text-xs text-slate-500">Trạng thái</p>

                  <p className="mt-1 font-medium">
                    {selectedAccount.status === "active"
                      ? "Đang hoạt động"
                      : "Tạm khóa"}
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
