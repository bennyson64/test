import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api";
import type {
  CreateTaskPayload,
  Task,
  TaskStatus,
  UpdateTaskPayload,
} from "@/types/api";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await apiClient.GET("/");
    if (err || !data) {
      setError("Failed to load tasks");
    } else {
      setTasks(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (payload: CreateTaskPayload) => {
    const { data, error: err } = await apiClient.POST("/", { body: payload });
    if (err || !data) throw new Error("Failed to create task");
    setTasks((prev) => [data, ...prev]);
    return data;
  };

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    const { data, error: err } = await apiClient.PUT("/{id}", {
      params: { path: { id } },
      body: payload,
    });
    if (err || !data) throw new Error("Failed to update task");
    setTasks((prev) => prev.map((t) => (t.id === id ? data : t)));
    return data;
  };

  const deleteTask = async (id: string) => {
    const { error: err } = await apiClient.DELETE("/{id}", {
      params: { path: { id } },
    });
    if (err) throw new Error("Failed to delete task");
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Cycles through your real status values in a sensible order
  const cycleStatus = (task: Task) => {
    const order: TaskStatus[] = [
      "task",
      "pending",
      "later",
      "completed",
      "archive",
    ];
    const next = order[(order.indexOf(task.status) + 1) % order.length];
    return updateTask(task.id, {
      title: task.title,
      description: task.description,
      status: next,
    });
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    cycleStatus,
  };
}