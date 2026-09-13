"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Cell } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { useStudents } from "@/context/student-context";

const BELTS = [
  {
    name: "Trắng",
    color: "#F8FAFC",
  },
  { name: "Trắng 1 vạch", color: "#E2E8F0" },
  { name: "Trắng 2 vạch", color: "#CBD5E1" },
  {
    name: "Vàng",
    color: "#FACC15",
  },
  {
    name: "Xanh lá",
    color: "#22C55E",
  },
  {
    name: "Xanh dương",
    color: "#3B82F6",
  },
  {
    name: "Đỏ cấp 4",
    color: "#EF4444",
  },
  {
    name: "Đỏ cấp 3",
    color: "#DC2626",
  },
  {
    name: "Đỏ cấp 2",
    color: "#B91C1C",
  },
  {
    name: "Đỏ cấp 1",
    color: "#991B1B",
  },
  {
    name: "Đen",
    color: "#18181B",
  },
];

const chartConfig = {
  students: {
    label: "Học viên",
  },
} satisfies ChartConfig;

export default function BeltChart() {
  const { students } = useStudents();

  const data = BELTS.map((belt) => ({
    belt: belt.name,
    students: students.filter((student) => student.belt.trim() === belt.name)
      .length,
    color: belt.color,
  }));

  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle>Phân bố cấp đai</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[360px] w-full min-w-0"
        >
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 10,
              left: 0,
              bottom: 45,
            }}
          >
            <CartesianGrid vertical={false} />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={35}
            />

            <XAxis
              dataKey="belt"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={70}
            />

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Bar dataKey="students" name="Học viên" radius={[6, 6, 0, 0]}>
              {data.map((entry) => (
                <Cell key={entry.belt} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
