import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import type { Task, TaskStatus } from "@/types/api";

const STATUS_META: Record<
  TaskStatus,
  {
    label: string;
    color: string;
    bg: string;
    icon: keyof typeof Ionicons.glyphMap;
  }
> = {
  task: {
    label: "Task",
    color: "#94a3b8",
    bg: "#1e293b",
    icon: "ellipse-outline",
  },
  pending: {
    label: "Pending",
    color: "#f59e0b",
    bg: "#451a03",
    icon: "time-outline",
  },
  later: {
    label: "Later",
    color: "#a78bfa",
    bg: "#2e1065",
    icon: "calendar-outline",
  },
  completed: {
    label: "Completed",
    color: "#22c55e",
    bg: "#052e16",
    icon: "checkmark-circle-outline",
  },
  archive: {
    label: "Archive",
    color: "#64748b",
    bg: "#0f172a",
    icon: "archive-outline",
  },
};

interface Props {
  task: Task;
  onCycleStatus: (task: Task) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onCycleStatus, onDelete, onEdit }: Props) {
  const meta = STATUS_META[task.status];

  return (
    <View className="bg-surface-card rounded-2xl p-4 mb-3 border border-surface-border">
      {/* Header row */}
      <View className="flex-row items-start justify-between gap-2">
        <Text
          className="text-white text-base font-semibold flex-1 leading-snug"
          numberOfLines={2}
        >
          {task.title}
        </Text>

        <View className="flex-row gap-1">
          <Pressable
            onPress={() => onEdit(task)}
            className="p-2 rounded-xl active:bg-surface-border"
          >
            <Ionicons name="pencil-outline" size={16} color="#94a3b8" />
          </Pressable>
          <Pressable
            onPress={() => onDelete(task.id)}
            className="p-2 rounded-xl active:bg-surface-border"
          >
            <Ionicons name="trash-outline" size={16} color="#f87171" />
          </Pressable>
        </View>
      </View>

      {/* Description */}
      {task.description ? (
        <Text
          className="text-surface-muted text-sm mt-1 leading-relaxed"
          numberOfLines={2}
        >
          {task.description}
        </Text>
      ) : null}

      {/* Footer */}
      <View className="flex-row items-center justify-between mt-3">
        <Pressable
          onPress={() => onCycleStatus(task)}
          style={{ backgroundColor: meta.bg }}
          className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border border-surface-border active:opacity-80"
        >
          <Ionicons name={meta.icon} size={13} color={meta.color} />
          <Text style={{ color: meta.color }} className="text-xs font-medium">
            {meta?.label}
          </Text>
        </Pressable>

        <Text className="text-surface-muted text-xs">
          {new Date(task.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );
}