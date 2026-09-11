import { Users, UserCheck, Clock, Trophy } from "lucide-react";

import Header from "@/components/dashboard/header";
import StatCard from "@/components/dashboard/stat-card";
import StudentChart from "@/components/dashboard/student-chart";
import BeltChart from "@/components/dashboard/belt-chart";

export default function Home() {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 p-8">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Chào mừng đến với Taekwondo NAK Team 🥋
            </h1>

            <p className="mt-2 text-slate-500">
              Hệ thống quản lý câu lạc bộ Taekwondo
            </p>
          </div>

          {/* Statistics */}
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Tổng học viên"
              value="128"
              description="↑ 12% so với tháng trước"
              icon={Users}
            />

            <StatCard
              title="Đang tập luyện"
              value="112"
              description="↑ 8% so với tháng trước"
              icon={UserCheck}
            />

            <StatCard
              title="Hết hạn học phí"
              value="16"
              description="↑ 2% so với tháng trước"
              icon={Clock}
            />

            <StatCard
              title="Huấn luyện viên"
              value="8"
              description="Không đổi so với tháng trước"
              icon={Trophy}
            />
          </div>

          {/* Charts */}
          <div className="mt-6 grid w-full grid-cols-1 gap-6 lg:grid-cols-2">
            <StudentChart />
            <BeltChart />
          </div>
        </main>
      </div>
    </div>
  );
}
