"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  { belt: "Trắng", students: 32 },
  { belt: "Vàng", students: 45 },
  { belt: "Xanh", students: 28 },
  { belt: "Đỏ", students: 15 },
  { belt: "Đen", students: 8 },
];

const chartConfig = {
  students: {
    label: "Học viên",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function BeltChart() {
  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle>Phân bố cấp đai</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[320px] w-full min-w-0"
        >
          <BarChart data={data}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="belt"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Bar dataKey="students" fill="var(--color-students)" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
