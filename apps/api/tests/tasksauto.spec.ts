import { test } from "@playwright/test";

test("test", async ({ page }) => {
  await page.goto("http://localhost:3000/");
  await page.getByRole("textbox", { name: "Task Title" }).click();
  await page
    .getByRole("textbox", { name: "Task Title" })
    .fill("This is a longer task");
  await page.getByRole("textbox", { name: "Task Description" }).click();
  await page
    .getByRole("textbox", { name: "Task Description" })
    .fill("This task has more than 20 char");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByRole("textbox", { name: "Task Title" }).click();
  await page.getByRole("textbox", { name: "Task Title" }).fill("reset ");
  await page.getByRole("textbox", { name: "Task Title" }).press("Tab");
  await page
    .getByRole("textbox", { name: "Task Description" })
    .fill("reset the typed text");
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("textbox", { name: "Task Title" }).click();
  await page.getByRole("textbox", { name: "Task Title" }).fill("one");
  await page.getByRole("textbox", { name: "Task Title" }).press("Tab");
  await page
    .getByRole("textbox", { name: "Task Description" })
    .fill("short char");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByRole("button", { name: "Reset" }).click();
  await page.getByRole("button", { name: "edit task" }).click();
  await page.getByText("This is a longer task").click();
  await page.getByRole("textbox", { name: "Task title", exact: true }).click();
  await page
    .getByRole("textbox", { name: "Task title", exact: true })
    .fill("This is a longer task (updated)");
  await page
    .getByRole("textbox", { name: "Task description", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Task description", exact: true })
    .press("End");
  await page
    .getByRole("textbox", { name: "Task description", exact: true })
    .fill("This task has more than 20 char (updated)");
  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "edit task" }).click();
  await page
    .getByRole("textbox", { name: "Task description", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Task description", exact: true })
    .press("End");
  await page
    .getByRole("textbox", { name: "Task description", exact: true })
    .fill("This task has more than 20 char (updated)cancel");
  await page.getByRole("button", { name: "Cancel" }).click();
  await page.getByRole("button", { name: "delete task" }).click();
});
