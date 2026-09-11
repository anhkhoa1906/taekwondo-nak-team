import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

export default function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">{value}</p>
        </div>

        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100">
          <Icon className="h-6 w-6 text-slate-700" />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{description}</p>
    </div>
  );
}
