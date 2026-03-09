import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { TaskCard } from "@/components/TaskCard";
import { TaskModal } from "@/components/TaskModal";
import { useTasks } from "@/lib/useTasks";
import type { CreateTaskPayload, Task, TaskStatus } from "@/types/api";

// Your real status values from the API
const FILTERS: { label: string; value: TaskStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Task", value: "task" },
  { label: "Pending", value: "pending" },
  { label: "Later", value: "later" },
  { label: "Completed", value: "completed" },
  { label: "Archive", value: "archive" },
];

export default function TasksScreen() {
  const {
    tasks,
    loading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
    cycleStatus,
  } = useTasks();

  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.status === filter);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleSave = async (
    payload: CreateTaskPayload & { status: TaskStatus }
  ) => {
    if (editing) {
      await updateTask(editing.id, payload);
    } else {
      await createTask(payload);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Task", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTask(id) },
    ]);
  };

  const completedCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <SafeAreaView className="flex-1 bg-surface">
      {/* Header */}
      <View className="px-5 pt-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-white text-2xl font-bold">Tasks</Text>
          <Text className="text-surface-muted text-sm mt-0.5">
            {tasks.length} total · {completedCount} completed
          </Text>
        </View>
        <Pressable
          onPress={() => {
            setEditing(null);
            setModalVisible(true);
          }}
          className="bg-brand-500 w-11 h-11 rounded-2xl items-center justify-center active:bg-brand-600"
        >
          <Ionicons name="add" size={24} color="white" />
        </Pressable>
      </View>

      {/* Filter chips — horizontal scroll since there are 6 options */}
      <FlatList
        horizontal
        data={FILTERS}
        keyExtractor={(f) => f.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingVertical: 12,
          gap: 8,
        }}
        renderItem={({ item: f }) => (
          <Pressable
            onPress={() => setFilter(f.value)}
            className={`px-3 py-1.5 rounded-full border ${
              filter === f.value
                ? "bg-brand-500 border-brand-500"
                : "bg-surface-card border-surface-border"
            }`}
          >
            <Text
              className={`text-xs font-medium ${
                filter === f.value ? "text-white" : "text-surface-muted"
              }`}
            >
              {f.label}
            </Text>
          </Pressable>
        )}
      />

      {/* Content */}
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0ea5e9" />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={48} color="#475569" />
          <Text className="text-surface-muted text-center mt-3 text-base">
            {error}
          </Text>
          <Pressable
            onPress={fetchTasks}
            className="mt-4 px-5 py-2.5 bg-brand-500 rounded-xl"
          >
            <Text className="text-white font-semibold">Retry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#0ea5e9"
            />
          }
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onCycleStatus={cycleStatus}
              onDelete={handleDelete}
              onEdit={(t) => {
                setEditing(t);
                setModalVisible(true);
              }}
            />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <Ionicons name="clipboard-outline" size={52} color="#334155" />
              <Text className="text-surface-muted text-base mt-3">
                No tasks here
              </Text>
              <Pressable
                onPress={() => {
                  setEditing(null);
                  setModalVisible(true);
                }}
                className="mt-4 px-5 py-2.5 bg-brand-500 rounded-xl"
              >
                <Text className="text-white font-semibold">Create one</Text>
              </Pressable>
            </View>
          }
        />
      )}

      <TaskModal
        visible={modalVisible}
        task={editing}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}