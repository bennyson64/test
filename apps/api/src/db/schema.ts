import { boolean, pgTable, text, timestamp, uuid, pgEnum } from "drizzle-orm/pg-core"

export const statusEnum = pgEnum("status", ["task", "pending", "later", "completed", "archive"])

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  completed: boolean("completed").notNull().default(false),
  status: statusEnum("status").notNull().default("task"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})