"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./globals.css";
import {CopilotKit} from "@copilotkit/react-core";
import {CopilotPopup} from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CopilotKit runtimeUrl="/api/copilotkit" agent="taskAgent">
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
        <CopilotPopup
          labels={{
            title: "PM Copilot",
            initial: "Hi! Ask me to create, update or delete a task.",
          }}
        />
        </CopilotKit>
      </body>
    </html>
  );
}
