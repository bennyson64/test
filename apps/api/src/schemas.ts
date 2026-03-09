import { z } from "zod";
export const StatusEnum = z.enum([
  "task",
  "pending",
  "later",
  "completed",
  "archive",
]);

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  completed: z.boolean(),
  status: StatusEnum,
  createdAt: z.string(),
});

export const CreateTaskSchema = z.object({
  title: z.string().min(5).max(32),
  description: z.string().min(20).max(100),
});

export const UpdateTaskSchema = z.object({
  title: z.string().min(5).max(32),
  description: z.string().min(20).max(100),
  status: StatusEnum,
})

export const ParamSchema = z.object({
  id: z.string().uuid(),
});
