import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { db } from "../../../../api/src/db/index";
import { tasks } from "../../../../api/src/db/schema";
import { eq } from "drizzle-orm";

export const createTaskTool = createTool({
  id: "createTask",
  description: "Creates a new task in the database",
  inputSchema: z.object({
    title: z.string().min(5).max(32).describe("Task title"),
    description: z.string().min(20).max(100).describe("Task description"),
    status: z
      .enum(["task", "pending", "later", "completed", "archive"])
      .default("task")
      .describe("Task status, defaults to task"),
  }),
  execute: async (inputData) => {
    console.log("[TOOL] createTask →", inputData);

    const [newTask] = await db
      .insert(tasks)
      .values({
        title: inputData.title,
        description: inputData.description,
        status: inputData.status ?? "task",
      })
      .returning();

    if (!newTask) { throw new Error("Failed to create task"); }

    console.log("[TOOL] createTask done →", newTask.id);

    return {
      success: true,
      task: {
        id: newTask.id,
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        completed: newTask.completed,
        createdAt: newTask.createdAt.toISOString(),
      },
    };
  },
});

export const updateTaskStatusTool = createTool({
  id: "updateTaskStatus",
  description: "Updates the status of an existing task by its ID",
  inputSchema: z.object({
    id: z.string().uuid().describe("The task ID to update"),
    status: z
      .enum(["task", "pending", "later", "completed", "archive"])
      .describe("The new status to set"),
  }),
  execute: async (inputData) => {
    console.log("[TOOL] updateTaskStatus →", inputData);

    const [updated] = await db
      .update(tasks)
      .set({ status: inputData.status })
      .where(eq(tasks.id, inputData.id))
      .returning();

    if (!updated) {
      console.log("[TOOL] updateTaskStatus → task not found");
      return { success: false, error: "Task not found" };
    }

    console.log("[TOOL] updateTaskStatus done →", updated.id, updated.status);

    return {
      success: true,
      id: updated.id,
      title: updated.title,
      status: updated.status,
    };
  },
});

export const deleteTaskTool = createTool({
  id: "deleteTask",
  description: "Deletes a task from the database by its ID",
  inputSchema: z.object({
    id: z.string().uuid().describe("The task ID to delete"),
  }),
  execute: async (inputData) => {
    console.log("[TOOL] deleteTask →", inputData.id);

    const [deleted] = await db
      .delete(tasks)
      .where(eq(tasks.id, inputData.id))
      .returning();

    if (!deleted) {
      console.log("[TOOL] deleteTask → task not found");
      return { success: false, error: "Task not found" };
    }

    console.log("[TOOL] deleteTask done →", inputData.id);

    return { success: true };
  },
});