"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  closestCenter,
} from "@dnd-kit/core";
import { apiClient } from "@repo/openapi";
import { TaskColumn } from "@/components/task-column";
import { EditStatusModal } from "@/components/edit-status-modal";
import { BugReportForm } from "@/components/task-form";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { z } from "zod";
import { useFrontendTool, } from "@copilotkit/react-core/v2";
import { useCopilotAction } from "@copilotkit/react-core";
import { TaskPieChart } from "@/components/ui/pie-chart";
interface Task {
  id: string;
  title: string;
  description: string;
  status: "task" | "pending" | "later" | "completed" | "archive";
  createdAt: string;
}

const COLUMNS = ["task", "pending", "later", "completed", "archive"] as const;

export default function TasksPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const queryClient = useQueryClient();

  const { data: tasks = [] } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const { data, error } = await apiClient.GET("/");
      if (error) {
        throw new Error("Failed to fetch");
      }
      return data ?? [];
    },
  });

  useCopilotAction({
    name: "showTaskChart",
    description: "Show a pie chart of tasks grouped by status",
    parameters: [
      {
        name: "task",
        type: "number",
        description: "Number of tasks in task status",
      },
      {
        name: "pending",
        type: "number",
        description: "Number of tasks in pending status",
      },
      {
        name: "later",
        type: "number",
        description: "Number of tasks in later status",
      },
      {
        name: "completed",
        type: "number",
        description: "Number of tasks in completed status",
      },
      {
        name: "archive",
        type: "number",
        description: "Number of tasks in archive status",
      },
    ],
    handler: async ({ task, pending, later, completed, archive }) => {
      return { task, pending, later, completed, archive };
    },
    render: ({ args, status }) => {
      if (status === "inProgress") return <div>Loading chart...</div>;

      const data = [
        { status: "task", count: args.task ?? 0 },
        { status: "pending", count: args.pending ?? 0 },
        { status: "later", count: args.later ?? 0 },
        { status: "completed", count: args.completed ?? 0 },
        { status: "archive", count: args.archive ?? 0 },
      ];

      return <TaskPieChart data={data} />;
    },
  });
  useFrontendTool({
    name: "listTasks",
    description:
      "Fetch and list all current tasks from the database with their IDs, titles, descriptions and statuses",
    parameters: z.object({}),
    handler: async () => {
      const { data, error } = await apiClient.GET("/");
      if (error) { return "Failed to fetch tasks"; }
      return JSON.stringify(data);
    },
  });
  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      title,
      description,
    }: {
      id: string;
      status: "task" | "pending" | "later" | "completed" | "archive";
      title: string;
      description: string;
      createdAt: string;
    }) => {
      const { error } = await apiClient.PUT("/{id}", {
        params: { path: { id } },
        body: { title, description, status },
      });
      if (error) { throw new Error("Failed to update status"); }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  useFrontendTool({
  name: "update Task Status",
  description: "Update a task's status by task ID",
  parameters: z.object({
    id: z.string().describe("The task ID to update"),
    status: z.enum(["task", "pending", "later", "completed", "archive"]).describe("New task status"),
  }),
  handler: async ({ id, status }) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) { return "Task not found"; }
    await updateStatusMutation.mutateAsync({
      id,
      status,
      title: task.title,
      description: task.description,
      createdAt: task.createdAt,
    });
    return `Task status updated to ${status} successfully`;
  },
});


  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) {
      return;
    }

    const draggedTask = tasks.find((t) => t.id === active.id);
    const newStatus = over.id as Task["status"];

    if (!draggedTask || draggedTask.status === newStatus) {
      return;
    }

    updateStatusMutation.mutate({
      id: draggedTask.id,
      status: newStatus,
      title: draggedTask.title,
      description: draggedTask.description,
      createdAt: draggedTask.createdAt,
    });
  }

  // In TasksPage — add createMutation
  const createMutation = useMutation({
    mutationFn: async ({
      title,
      description,
    }: {
      title: string;
      description: string;
    }) => {
      const { error } = await apiClient.POST("/", {
        body: { title, description },
      });
      if (error) { throw new Error("Failed to create task"); }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  useFrontendTool({
    name: "createTask",
    description: "Create a new task",
    parameters: z.object({
      title: z.string().min(5).max(32).describe("Task title, 5-32 characters"),
      description: z
        .string()
        .min(20)
        .max(100)
        .describe("Task description, 20-100 characters"),
    }),
    handler: async ({ title, description }: any) => {
      await createMutation.mutateAsync({ title, description });
      return `Task "${title}" created successfully!`;
    },
  });


  const deleteMutation = useMutation({
    mutationFn: async ({ id }: { id: string }) => {
      const { error } = await apiClient.DELETE("/{id}", {
        params: { path: { id } },
      });
      if (error) throw new Error("Request failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      status,
    }: {
      id: string;
      title: string;
      description: string;
      status: "task" | "pending" | "later" | "completed" | "archive";
    }) => {
      const { error } = await apiClient.PUT("/{id}", {
        params: { path: { id } },
        body: { title, description, status },
      });
      if (error) throw new Error("Request failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  useFrontendTool({
    name: "updateTask",
    description: "Update a task's title, description or status by task title",
    parameters: z.object({
      currentTitle: z
        .string()
        .describe("The current title of the task to update"),
      title: z
        .string()
        .min(5)
        .max(32)
        .describe(
          "New task title — if not changing, use the same current title"
        ),
      description: z
        .string()
        .min(20)
        .max(100)
        .describe(
          "New task description — if not changing, use the same current description"
        ),
      status: z
        .enum(["task", "pending", "later", "completed", "archive"])
        .describe(
          "New task status — if not changing, use the same current status"
        ),
    }),
    handler: async ({ currentTitle, title, description, status }: any) => {
      const { data, error } = await apiClient.GET("/");
      if (error) return "Failed to fetch tasks";

      const task = data?.find(
        (t) => t.title.toLowerCase() === currentTitle.toLowerCase()
      );
      if (!task) return `Task "${currentTitle}" not found`;

      // Use existing values as fallback if not provided
      const updatedTitle = title ?? task.title;
      const updatedDescription = description ?? task.description;
      const updatedStatus = status ?? task.status;

      await updateMutation.mutateAsync({
        id: task.id,
        title: updatedTitle,
        description: updatedDescription,
        status: updatedStatus,
      });

      return `Task "${currentTitle}" updated successfully`;
    },
  });

  useFrontendTool({
    name: "deleteTask",
    description: "Delete a task by ID",
    parameters: z.object({
      title: z.string().describe("The title of the task to delete"),
      confirm: z.boolean().describe("Confirm deletion"),
    }),
    handler: async ({ title, confirm }) => {
      if (!confirm) return "Deletion cancelled";

      const { data, error } = await apiClient.GET("/");
      if (error) return "Failed to fetch tasks";

      const task = data?.find(
        (t) => t.title.toLowerCase() === title.toLowerCase()
      );
      if (!task) return `Task "${title}" not found`;

      await deleteMutation.mutateAsync({ id: task.id });
      return `Task "${title}" deleted successfully`;
    },
  });

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        const task = tasks.find((t) => t.id === event.active.id);
        if (task) {
          setActiveTask(task as Task);
        }
      }}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen p-6">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <Button className="text-white">
              <Link href="/dashboard" className="text-sm underline">
                Dashboard
              </Link>
            </Button>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
            }}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>

        {/* Form modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="relative w-full max-w-md mx-4">
              <button
                onClick={() => setShowForm(false)}
                className="absolute -top-3 -right-3 bg-background rounded-full p-1 shadow z-10"
              >
                <X className="w-4 h-4" />
              </button>
              <BugReportForm onSuccess={() => setShowForm(false)} />
            </div>
          </div>
        )}
        <DragOverlay>
          {activeTask ? (
            <Card className="shadow-lg rotate-2 opacity-90">
              <CardContent className="p-3">
                <p className="font-medium text-sm">{activeTask.title}</p>
                <p className="text-xs text-muted-foreground">
                  {activeTask.description}
                </p>
                <p className="text-xs text-muted-foreground/60">
                  {new Date(activeTask.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </CardContent>
            </Card>
          ) : null}
        </DragOverlay>
        {/* Kanban columns */}
        <div className="grid grid-cols-5 gap-4">
          {COLUMNS.map((col) => (
            <TaskColumn
              key={col}
              title={col}
              tasks={
                tasks.filter((t) => (t.status ?? "task") === col) as Task[]
              }
              onEdit={(task) => setEditingTask(task)}
            />
          ))}
        </div>

        {/* Edit status modal */}
        <EditStatusModal
          task={editingTask}
          open={!!editingTask}
          onClose={() => setEditingTask(null)}
        />
      </div>
    </DndContext>
    
  );
}
