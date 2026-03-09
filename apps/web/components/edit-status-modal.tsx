"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@repo/openapi";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Task = {
  id: string;
  title: string;
  description: string;
  status: string;
};

const STATUSES = ["task", "pending", "later", "completed", "archive"] as const;

export function EditStatusModal({
  task,
  open,
  onClose,
}: {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState(task?.status ?? "task");

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await apiClient.PUT("/{id}", {
        params: { path: { id: task!.id } },
        body: {
          title: task!.title,
          description: task!.description,
          status: selected as any,
        },
      });
      if (error) throw new Error("Failed to update");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Task status updated");
      onClose();
    },
  });

  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Move task to</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-2">
          {STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => setSelected(status)}
              className={`w-full text-left px-4 py-2 rounded-md border text-sm capitalize transition-colors ${
                selected === status
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted border-border"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          onClick={() => updateMutation.mutate()}
          disabled={updateMutation.isPending}
        >
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}