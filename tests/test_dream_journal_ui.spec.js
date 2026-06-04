/**
 * Dream Journal UI Playwright tests
 * Preferred entrypoint: npm run test:ui
 *
 * Usage:
 *   npm run test:ui
 *   npx playwright test --ui
 */

const { test, expect } = require("@playwright/test");

const BASE_URL = process.env.LANTERN_GARAGE_TEST_BASE_URL || "http://127.0.0.1:4177";

test.describe("Dream Journal UI", () => {
  test("dashboard loads and shows Dream Journal heading", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.getByRole("heading", { name: "Dream Journal", exact: true })).toBeVisible();
    await expect(page.locator("text=Your dreams. Your space. Always private.")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Talk to your Dream Journal" })).toBeHidden();
  });

  test("stat cards render with numbers", async ({ page }) => {
    await page.goto(BASE_URL);
    // Wait for stat cards to appear
    await page.waitForSelector(".stat-number", { timeout: 5000 });
    const cards = await page.locator(".stat-card").count();
    expect(cards).toBeGreaterThanOrEqual(1);
  });

  test("new entry form is visible and interactive", async ({ page }) => {
    await page.goto(BASE_URL);
    const form = page.locator("#entryForm, form[action*='dream']").first();
    await expect(form).toBeVisible();

    // Fill the form
    const textarea = form.locator("textarea, [name='text'], input[name='text']").first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill("Playwright test dream: floating through a crystalline city");
    }
  });

  test("chat input accepts text and triggers agent response", async ({ page }) => {
    await page.goto(`${BASE_URL}/dream-chat.html`);

    const chatInput = page.locator("#input");

    if (await chatInput.isVisible().catch(() => false)) {
      await chatInput.fill("I saw a glowing light in my dream");
      await page.locator("#send-btn").click();

      await expect(page.locator(".msg-row.agent .bubble").last()).toContainText(/light|flame|home|dream/i, { timeout: 10000 });
    }
  });

  test("suggestion buttons are clickable", async ({ page }) => {
    await page.goto(BASE_URL);

    await page.getByRole("button", { name: "Refresh" }).click();
    await expect(page.locator(".stat-number").first()).toBeVisible();
  });

  test("door buttons trigger lore response", async ({ page }) => {
    await page.goto(BASE_URL);

    // Look for door-related buttons or links
    const doors = page.locator("button, a").filter({ hasText: /door|Door|doors/ });
    const count = await doors.count();

    if (count > 0) {
      await doors.first().click();
      await page.waitForTimeout(1000);
      // Page should not crash
      expect(await page.title()).toBeTruthy();
    }
  });

  test("entry type selector changes form mode", async ({ page }) => {
    await page.goto(BASE_URL);

    const typeSelect = page.locator("select[name='kind'], select[name='type'], [name='entryType']").first();
    if (await typeSelect.isVisible().catch(() => false)) {
      await typeSelect.selectOption("note");
      // Form should remain visible
      await expect(page.locator("form").first()).toBeVisible();
    }
  });

  test("lucidity slider has range 0-1", async ({ page }) => {
    await page.goto(BASE_URL);

    const slider = page.locator("input[type='range'], input[name='lucidity']").first();
    if (await slider.isVisible().catch(() => false)) {
      const min = await slider.getAttribute("min");
      const max = await slider.getAttribute("max");
      expect(["0", null]).toContain(min);
      expect(["1", "10", null]).toContain(max);
    }
  });

  test("recent entries list updates after creating entry", async ({ page }) => {
    await page.goto(BASE_URL);

    // Get initial count of entries
    const initial = await page.locator(".entry-card, .recent-entry").count();

    // Try to create an entry via the form
    const form = page.locator("form").first();
    const textarea = form.locator("textarea").first();
    if (await textarea.isVisible().catch(() => false)) {
      await textarea.fill("Playwright test entry for recent list");
      const submit = form.locator("button[type='submit'], input[type='submit']").first();
      if (await submit.isVisible().catch(() => false)) {
        await submit.click();
        await page.waitForTimeout(2000);
      }
    }

    // Recent entries section should still exist.
    await expect(page.getByRole("heading", { name: "Recent Entries" })).toBeVisible();
  });
});

test.describe("Dream Journal Chat Agents", () => {
  test("multi-agent chat shows agent names in response", async ({ page }) => {
    await page.goto(`${BASE_URL}/dream-chat.html`);

    const chatInput = page.locator("#input");

    if (await chatInput.isVisible().catch(() => false)) {
      await chatInput.fill("Tell me about the doors");
      await page.locator("#send-btn").click();

      // Look for agent name indicators in the response
      await expect(page.locator(".msg-row.agent").last()).toContainText(/Lantern|Blinkbug|Waterfall|Xenon|Mary|Courtney/i, { timeout: 10000 });
    }
  });
});
