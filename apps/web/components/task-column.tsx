/** biome-ignore-all lint/a11y/useButtonType: explanation */
"use client";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Pencil } from "lucide-react";
import { TaskActions } from "@/components/task-action";
import { Card, CardContent } from "@/components/ui/card";

interface Task {
  description: string;
  id: string;
  status: "task" | "pending" | "later" | "completed" | "archive";
  title: string;
  createdAt: string;
}

interface TaskColumnProps {
  onEdit: (task: Task) => void;
  tasks: Task[];
  title: string;
}
function DraggableTaskCard({
  task,
  onEdit,
}: {
  task: Task;
  onEdit: (task: Task) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <Card
      className="cursor-grab shadow-sm active:cursor-grabbing"
      ref={setNodeRef}
      style={style}
    >
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          {/* drag handle on title */}
          <p
            {...listeners}
            {...attributes}
            className="flex-1 font-medium text-sm"
          >
            {task.title}
          </p>
          <button
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
            onClick={() => onEdit(task)}
            title="Move to column"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-muted-foreground text-xs">{task.description}</p>
        <p className="text-xs text-muted-foreground/60">
          {new Date(task.createdAt).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <TaskActions task={task} />
      </CardContent>
    </Card>
  );
}

export function TaskColumn({ title, tasks, onEdit }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: title });

  return (
    <div className="flex flex-col gap-3 min-w-[220px] w-full">
      <div className="flex items-center gap-2 mb-1">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
          {title}
        </h2>
        <span className="text-xs bg-muted rounded-full px-2 py-0.5">
          {tasks.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 min-h-[100px] rounded-md p-1 transition-colors ${
          isOver ? "bg-muted/60 ring-2 ring-primary/30" : ""
        }`}
      >
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground border border-dashed rounded-md p-4 text-center">
            No tasks
          </p>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  );
}
