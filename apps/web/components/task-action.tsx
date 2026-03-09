"use client";
import { apiClient } from "@repo/openapi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useFrontendTool } from "@copilotkit/react-core/v2";

interface Task {
  description: string;
  id: string;
  title: string;
  status: "task" | "pending" | "later" | "completed" | "archive";
}
//psuh
export function TaskActions({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await apiClient.DELETE("/{id}", {
        params: { path: { id: task.id } },
      });
      if (error) {
        throw new Error("Request failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task deleted");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await apiClient.PUT("/{id}", {
        params: { path: { id: editedTask.id } },
        body: {
          title: editedTask.title,
          description: editedTask.description,
          status: editedTask.status,
        },
      });
      if (error) {
        throw new Error("Request failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setIsEditing(false);
      toast.success("Task updated");
    },
  });


  useFrontendTool({
  name: "updateTask",
  description: "Update a task's title, description or status",
  parameters: z.object({
    title: z.string().min(5).max(32).describe("Task title"),
    description: z.string().min(20).max(100).describe("Task description"),
    status: z.enum(["task", "pending", "later", "completed", "archive"]).describe("Task status"),
  }),
  handler: async ({ title, description, status }) => {
    setEditedTask({ ...editedTask, title, description, status });
    await updateMutation.mutateAsync();
    return "Task Updated successfully";
  },
});

  useFrontendTool({
  name: "Delete Task",
  description: "Delete a task",
  parameters: z.object({
    confirm: z.boolean().describe("Confirm deletion"),
  }),
  handler: async ({ confirm }) => {
    if(!confirm) { return "Deletion cancelled"; }
    await deleteMutation.mutateAsync();
    return "Task Updated successfully";
  },
});

  if (isEditing) {
    return (
      <div className="mt-2 space-y-2">
        <Input
          onChange={(e) =>
            setEditedTask({ ...editedTask, title: e.target.value })
          }
          placeholder="Task title"
          value={editedTask.title}
        />
        <textarea
          className="min-h-16 w-full resize-none rounded-md border p-2 text-sm"
          onChange={(e) =>
            setEditedTask({ ...editedTask, description: e.target.value })
          }
          placeholder="Task description"
          value={editedTask.description}
        />
        <div className="flex gap-2">
          <Button
            disabled={updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
            size="sm"
          >
            <Check className="mr-1 h-4 w-4" />
            Save
          </Button>
          <Button
            onClick={() => {
              setEditedTask(task); // reset to original values on cancel
              setIsEditing(false);
            }}
            size="sm"
            variant="outline"
          >
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 flex gap-2">
      <Button
        aria-label="edit task"
        onClick={() => setIsEditing(true)}
        size="sm"
        variant="outline"
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        aria-label="delete task"
        disabled={deleteMutation.isPending}
        onClick={() => deleteMutation.mutate()}
        size="sm"
        variant="destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
