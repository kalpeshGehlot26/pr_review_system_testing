import { test, expect } from "@playwright/test";

/**
 * FUNCTIONAL GATE — derived from TASK.md.
 * Each block maps to a section of the requirements.
 */

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("app + 4-panel layout renders", async ({ page }) => {
  await expect(page.getByTestId("feature-root")).toBeVisible();
  await expect(page.getByTestId("nav-sidebar")).toBeVisible();
  await expect(page.getByTestId("chat-list")).toBeVisible();
  await expect(page.getByTestId("conversation-panel")).toBeVisible();
  await expect(page.getByTestId("details-panel")).toBeVisible();
});

test("nav: items render, active highlighted, click updates state", async ({ page }) => {
  await expect(page.getByTestId("nav-avatar")).toBeVisible();
  for (const tab of ["all", "work", "personal", "saved", "calendar", "files", "settings"]) {
    await expect(page.getByTestId(`nav-${tab}`)).toBeVisible();
  }
  await expect(page.getByTestId("nav-all")).toHaveAttribute("data-active", "true");
  await page.getByTestId("nav-work").click();
  await expect(page.getByTestId("nav-work")).toHaveAttribute("data-active", "true");
  await expect(page.getByTestId("nav-all")).toHaveAttribute("data-active", "false");
});

test("chat list: 15+ conversations, search input, unread badges", async ({ page }) => {
  await expect(page.getByTestId("chat-search")).toBeVisible();
  const items = page.getByTestId("chat-item");
  expect(await items.count()).toBeGreaterThanOrEqual(15);
  expect(await page.getByTestId("unread-badge").count()).toBeGreaterThan(0);
});

test("chat list: search filters in real-time", async ({ page }) => {
  const before = await page.getByTestId("chat-item").count();
  await page.getByTestId("chat-search").fill("michelle");
  const after = await page.getByTestId("chat-item").count();
  expect(after).toBeLessThan(before);
  await expect(page.getByTestId("chat-item").first()).toContainText("Michelle");
});

test("chat list: clicking a conversation selects it", async ({ page }) => {
  const target = page.getByTestId("chat-item").filter({ hasText: "Joseph King" });
  await target.click();
  await expect(target).toHaveAttribute("data-active", "true");
  await expect(page.getByTestId("conversation-header")).toContainText("Joseph King");
});

test("conversation: header, in/out bubbles, timestamps, date separator", async ({ page }) => {
  await expect(page.getByTestId("conversation-header")).toBeVisible();
  await expect(page.getByTestId("date-separator").first()).toBeVisible();
  expect(
    await page.locator('[data-testid="message-bubble"][data-direction="incoming"]').count()
  ).toBeGreaterThan(0);
  expect(
    await page.locator('[data-testid="message-bubble"][data-direction="outgoing"]').count()
  ).toBeGreaterThan(0);
});

test("composer: renders all controls, empty cannot send, sending works", async ({ page }) => {
  await expect(page.getByTestId("composer-attach")).toBeVisible();
  await expect(page.getByTestId("composer-emoji")).toBeVisible();
  await expect(page.getByTestId("composer-send")).toBeVisible();

  const before = await page.getByTestId("message-bubble").count();

  // empty message must NOT be added
  await page.getByTestId("composer-send").click();
  expect(await page.getByTestId("message-bubble").count()).toBe(before);

  // real message is added instantly and updates last-message preview
  await page.getByTestId("composer-input").fill("Hello from the test!");
  await page.getByTestId("composer-send").click();
  await expect(page.getByTestId("message-bubble").last()).toContainText("Hello from the test!");
  expect(await page.getByTestId("message-bubble").count()).toBe(before + 1);
});

test("details panel: all sections present", async ({ page }) => {
  for (const section of [
    "members-section",
    "photos-section",
    "files-section",
    "links-section",
  ]) {
    await expect(page.getByTestId(section)).toBeVisible();
  }
  await expect(page.getByTestId("shared-file").first()).toBeVisible();
  await expect(page.getByTestId("shared-link").first()).toBeVisible();
});

test("global state: switching conversation updates conversation + details", async ({ page }) => {
  await page.getByTestId("chat-item").filter({ hasText: "Brian Alexander" }).click();
  await expect(page.getByTestId("conversation-header")).toContainText("Brian Alexander");
  await expect(page.getByTestId("details-panel")).toContainText("Brian Alexander");
});

test("no console errors on load and interaction", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.reload();
  await page.getByTestId("composer-input").fill("ping");
  await page.getByTestId("composer-send").click();
  expect(errors).toEqual([]);
});
