// import { describe, expect, test } from "vitest";
// import { z } from "zod";

// const formSchema = z.object({
//   title: z.string().min(5).max(32),
//   description: z.string().min(20).max(100),
// });

// describe("BugReportForm schema", () => {
//   test("rejects invalid data", () => {
//     const result = formSchema.safeParse({
//       title: "abc",
//       description: "Too short",
//     });

//     expect(result.success).toBe(false);
//   });

//   test("accepts valid data", () => {
//     const result = formSchema.safeParse({
//       title: "Valid Task Title",
//       description: "Description with more than 20 characters.",
//     });

//     expect(result.success).toBe(true);
//   });
// });
