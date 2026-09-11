"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const data = [
  { month: "T1", students: 82 },
  { month: "T2", students: 91 },
  { month: "T3", students: 96 },
  { month: "T4", students: 105 },
  { month: "T5", students: 112 },
  { month: "T6", students: 118 },
  { month: "T7", students: 128 },
];

const chartConfig = {
  students: {
    label: "Học viên",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export default function StudentChart() {
  return (
    <Card className="w-full min-w-0">
      <CardHeader>
        <CardTitle>Số lượng học viên</CardTitle>
      </CardHeader>

      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="h-[350px] w-full min-w-0"
        >
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />

            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />

            <Area
              dataKey="students"
              type="monotone"
              fill="var(--color-students)"
              fillOpacity={0.2}
              stroke="var(--color-students)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
