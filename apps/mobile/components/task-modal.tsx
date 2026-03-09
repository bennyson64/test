import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import type { CreateTaskPayload, Task, TaskStatus } from "@/types/api";

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: "task", label: "Task" },
  { value: "pending", label: "Pending" },
  { value: "later", label: "Later" },
  { value: "completed", label: "Completed" },
  { value: "archive", label: "Archive" },
];

interface Props {
  visible: boolean;
  task?: Task | null;
  onClose: () => void;
  onSave: (
    payload: CreateTaskPayload & { status: TaskStatus }
  ) => Promise<void>;
}

export function TaskModal({ visible, task, onClose, onSave }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("task");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? "");
      setStatus(task.status);
    } else {
      setTitle("");
      setDescription("");
      setStatus("task");
    }
  }, [task, visible]);

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <Pressable className="flex-1" onPress={onClose} />
        <View className="bg-surface-card rounded-t-3xl px-5 pt-4 pb-10 border-t border-surface-border">
          {/* Handle */}
          <View className="w-10 h-1 bg-surface-border rounded-full self-center mb-5" />

          <View className="flex-row items-center justify-between mb-5">
            <Text className="text-white text-xl font-bold">
              {task ? "Edit Task" : "New Task"}
            </Text>
            <Pressable onPress={onClose} className="p-2">
              <Ionicons name="close" size={22} color="#94a3b8" />
            </Pressable>
          </View>

          {/* Title */}
          <Text className="text-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">
            Title
          </Text>
          <TextInput
            className="bg-surface rounded-xl px-4 py-3 text-white text-base mb-4 border border-surface-border"
            placeholder="What needs to be done?"
            placeholderTextColor="#475569"
            value={title}
            onChangeText={setTitle}
          />

          {/* Description */}
          <Text className="text-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">
            Description
          </Text>
          <TextInput
            className="bg-surface rounded-xl px-4 py-3 text-white text-base mb-4 border border-surface-border"
            placeholder="Add more details..."
            placeholderTextColor="#475569"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            style={{ minHeight: 80, textAlignVertical: "top" }}
          />

          {/* Status — horizontal scroll for 5 options */}
          <Text className="text-surface-muted text-xs font-semibold uppercase tracking-widest mb-2">
            Status
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-6"
          >
            <View className="flex-row gap-2">
              {STATUSES.map((s) => (
                <Pressable
                  key={s.value}
                  onPress={() => setStatus(s.value)}
                  className={`px-4 py-2.5 rounded-xl border items-center ${
                    status === s.value
                      ? "bg-brand-500 border-brand-500"
                      : "bg-surface border-surface-border"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      status === s.value ? "text-white" : "text-surface-muted"
                    }`}
                  >
                    {s.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          {/* Save */}
          <Pressable
            onPress={handleSave}
            disabled={!title.trim() || saving}
            className={`rounded-2xl py-4 items-center ${
              title.trim() && !saving ? "bg-brand-500" : "bg-surface-border"
            }`}
          >
            <Text className="text-white font-bold text-base">
              {saving ? "Saving…" : task ? "Save Changes" : "Create Task"}
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}