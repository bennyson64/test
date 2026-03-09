"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@repo/openapi";
import { TaskBarChart } from "@/components/ui/bar-chart";
import { TaskPieChart } from "@/components/ui/pie-chart";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const COLUMNS = ["task", "pending", "later", "completed", "archive"] as const;

export default function DashboardPage() {
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/");
      if (error) throw new Error("Failed to fetch");
      return data ?? [];
    },
  });

  // Count tasks per status for bar + pie
  const statusCounts = COLUMNS.map((col) => ({
    status: col,
    count: tasks.filter((t) => (t.status ?? "task") === col).length,
  }));

  // Count tasks created per day for bar chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });

  const tasksByDay = last7Days.map((day) => ({
    day,
    count: tasks.filter((t) => {
      const taskDate = new Date(t.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      return taskDate === day;
    }).length,
  }));

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button className="text-white">
          <Link href="/tasks" className="text-sm underline">
            Tasks
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <TaskBarChart data={tasksByDay} />
        <TaskPieChart data={statusCounts} />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-5 gap-4 mt-6">
        {statusCounts.map(({ status, count }) => (
          <div key={status} className="border rounded-md p-4 space-y-1">
            <p className="text-sm text-muted-foreground capitalize">{status}</p>
            <p className="text-2xl font-bold">{count}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
