"use client";
import { Pie, PieChart, Cell } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const COLORS = [
  "#6366F1",
  "#F59E0B",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
];

const chartConfig = {
  task:      { label: "Task",      color: "#6366F1" },
  pending:   { label: "Pending",   color: "#F59E0B" },
  later:     { label: "Later",     color: "#10B981" },
  completed: { label: "Completed", color: "#EF4444" },
  archive:   { label: "Archive",   color: "#8B5CF6" },
};

export function TaskPieChart({
  data,
}: {
  data: { status: string; count: number }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Distribution</CardTitle>
        <CardDescription>By status</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center">
  <ChartContainer
    config={chartConfig}
    className="w-full max-w-md h-[380px] flex items-center justify-center"
  >
    <PieChart width={350} height={350}>
      <Pie
        data={data}
        dataKey="count"
        nameKey="status"
        cx="50%"
        cy="50%"
        outerRadius={120}
        label
      >
        {data.map((_, index) => (
          <Cell key={index} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>

      <ChartTooltip content={<ChartTooltipContent />} />
      <ChartLegend
        content={<ChartLegendContent />}
        verticalAlign="bottom"
        align="center"
      />
    </PieChart>
  </ChartContainer>
</CardContent>
    </Card>
  );
}