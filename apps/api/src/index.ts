import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();

import { eq } from "drizzle-orm";
import {
  describeRoute,
  openAPIRouteHandler,
  resolver,
  validator,
} from "hono-openapi";
import z from "zod";
import { db } from "./db/index.js";
import { tasks } from "./db/schema.js";
import {
  CreateTaskSchema,
  ParamSchema,
  TaskSchema,
  UpdateTaskSchema,
} from "./schemas.js";
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNodeHttpEndpoint } from "@copilotkit/runtime";
// import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import {taskAgent} from "@Frommastra/agents/task-agent"
import OpenAI from "openai";


app.use("*", cors());

app.get(
  "/",
  describeRoute({
    responses: {
      200: {
        description: "Successful response",
        content: {
          "application/json": {
            schema: resolver(z.array(TaskSchema)),
          },
        },
      },
    },
  }),
  async (c) => {
    const allTasks = await db.select().from(tasks);
    return c.json(allTasks);
  }
);

app.post(
  "/",
  describeRoute({
    description: "Create a new task",
    responses: {
      201: {
        description: "Task created",
        content: {
          "application/json": { schema: resolver(TaskSchema) },
        },
      },
    },
  }),
  validator("json", CreateTaskSchema),
  async (c) => {
    const body = c.req.valid("json");
    const [newTask] = await db.insert(tasks).values(body).returning();
    return c.json({ success: true, task: newTask }, 201);
  }
);

app.put(
  "/:id",
  describeRoute({
    description: "Update a task",
    responses: {
      200: {
        description: "Task updated",
        content: { "application/json": { schema: resolver(TaskSchema) } },
      },
    },
  }),
  validator("param", ParamSchema),
  validator("json", UpdateTaskSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    const body = c.req.valid("json");
    const [updated] = await db
      .update(tasks)
      .set({
        title: body.title,
        description: body.description,
        status: body.status,
      })
      .where(eq(tasks.id, id))
      .returning();
    return c.json({ success: true, task: updated }, 200);
  }
);

app.delete(
  "/:id",
  describeRoute({
    description: "Delete a task",
    responses: {
      200: {
        description: "Task deleted",
        content: {
          "application/json": {
            schema: resolver(z.object({ success: z.boolean() })),
          },
        },
      },
    },
  }),
  validator("param", ParamSchema),
  async (c) => {
    const { id } = c.req.valid("param");
    await db.delete(tasks).where(eq(tasks.id, id));
    return c.json({ success: true }, 200);
  }
);

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Task Management API",
        version: "1.0.0",
        description: "Task Management System API",
      },
      servers: [{ url: "http://localhost:3001", description: "Local Server" }],
    },
  })
);

// const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY! });
// const serviceAdapter = openrouter.chat('stepfun/step-3.5-flash:free');
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

const serviceAdapter = new OpenAIAdapter({ openai });

app.post("/api/copilotkit", async (c) => {
  console.log("[CopilotKit] request received");

  const runtime = new CopilotRuntime({
    actions: [
      {
        name: "pm_agent",
        description:
          "Handles task operations: create a task, update a task status, or delete a task. Use this for any task-related user request.",
        parameters: [
          {
            name: "prompt",
            type: "string",
            description: "The full natural language request from the user",
            required: true,
          },
        ],
        handler: async ({ prompt }: { prompt: string }) => {
          console.log("[CopilotKit] pm_agent prompt →", prompt);

          // Agent reads the prompt, picks the right tool (create/update/delete),
          // calls it, and the tool hits Drizzle DB directly
          const result = await taskAgent.generate([
            { role: "user", content: prompt },
          ]);

          console.log("[CopilotKit] pm_agent response →", result.text);
          return result.text;
        },
      },
    ],
  });

  const handler = copilotRuntimeNodeHttpEndpoint({
    endpoint: "/api/copilotkit",
    runtime,
    serviceAdapter,
  });

  return handler(c.req.raw, {
    waitUntil: () => {},
  } as never);
});



serve({
  fetch: app.fetch,
  port: 3001,
});

console.log("Backend running on http://localhost:3001");

export default app;
