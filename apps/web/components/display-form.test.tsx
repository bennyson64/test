// /** biome-ignore-all lint/performance/useTopLevelRegex: explanation */
// /** biome-ignore-all lint/style/useTrimStartEnd: <explanation> */

// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { render, screen } from "@testing-library/react";
// import { expect, it, test, vi } from "vitest";
// import DisplayForm from "./display-form";
// import "@testing-library/jest-dom/vitest";

// vi.mock("@repo/openapi", () => ({
//   apiClient: {
//     GET: vi.fn(),
//   },
// }));

// vi.mock("@/components/task-action", () => ({
//   TaskActions: () => null,
// }));

// function renderWithClient(ui: React.ReactElement) {
//   const queryClient = new QueryClient();
//   return render(
//     <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
//   );
// }

// test("shows loading state initially", () => {
//   renderWithClient(<DisplayForm />);
//   expect(screen.getByText(/loading/i)).toBeInTheDocument();
// });

// it("shows empty state when no tasks exist", async () => {
//   const { apiClient } = await import("@repo/openapi");
//   (apiClient.GET as any).mockResolvedValue({ data: [], error: null });

//   renderWithClient(<DisplayForm />);

//   expect(await screen.findByText(/no task submitted yet/i)).toBeInTheDocument();
// });
