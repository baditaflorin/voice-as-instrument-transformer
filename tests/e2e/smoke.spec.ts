import { expect, test } from "@playwright/test";

test("loads the published app shell and runs the synthetic pitch path", async ({ page }) => {
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? "/");

  await expect(page.getByRole("heading", { name: "Voice-as-Instrument Transformer" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Star repo" })).toHaveAttribute(
    "href",
    "https://github.com/baditaflorin/voice-as-instrument-transformer",
  );
  await expect(
    page.getByRole("navigation", { name: "Project links" }).getByRole("link", { name: "PayPal" }),
  ).toHaveAttribute("href", "https://www.paypal.com/paypalme/florinbadita");
  await expect(page.getByText("Version")).toBeVisible();
  await expect(page.getByText("Commit", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Try demo" }).click();
  await expect(page.getByText(/Demo playing|Demo waiting|Starting demo oscillator/)).toBeVisible();
  await expect(page.getByTestId("pitch-note")).toBeVisible();

  await page.getByRole("button", { name: "Stop" }).click();
  await expect(page.getByText("Ready")).toBeVisible();
});
