import { Mastra } from "@mastra/core";
import { taskAgent } from "./agents/task-agent";
// import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";

export const mastra = new Mastra({
  agents: { taskAgent },
  storage: new LibSQLStore({
    id: "libsql-storage",
    url: "file:./agent.db",
  }),
});

export { taskAgent };