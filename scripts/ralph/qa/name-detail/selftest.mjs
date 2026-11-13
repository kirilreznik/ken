// node scripts/ralph/qa/name-detail/selftest.mjs [webkit|chromium]
// US-001 self-test: a 160 px touch drag right on the card keeps it (REST), "ביטול" restores it.
import { openMobile, drag, tap, shot } from "./mobile.mjs";
import { signIn, votes } from "../names-pwa/rest.mjs";

const engine = process.argv[2] ?? "webkit";
const token = await signIn(1);
const before = await votes(token);
const { browser, page } = await openMobile({ browser: engine, user: 1 });
try {
  await page.goto("/names", { waitUntil: "networkidle" });
  const card = page.locator("article[tabindex='0']").first();
  await card.waitFor({ timeout: 15000 });
  const name = (await card.getAttribute("aria-label"))?.split(",")[0];
  await shot(page, `us001-${engine}-before`);
  await drag(page, card, { dx: 160, steps: 14, ms: 280 });
  await page.waitForTimeout(2500);
  const after = await votes(token);
  const added = after.filter((v) => !before.some((b) => b.name === v.name && b.space_id === v.space_id && b.updated_at === v.updated_at));
  const next = (await page.locator("article[tabindex='0']").first().getAttribute("aria-label"))?.split(",")[0];
  await shot(page, `us001-${engine}-after-drag`);
  console.log(`${engine}: card "${name}" -> next "${next}"; votes ${before.length} -> ${after.length}; new/changed: ${JSON.stringify(added.map((v) => ({ name: v.name, vote: v.vote ?? v.kind ?? v.decision })))}`);
  await tap(page, page.getByRole("button", { name: "ביטול ההחלטה האחרונה" }));
  await page.waitForTimeout(2500);
  const undone = await votes(token);
  const back = (await page.locator("article[tabindex='0']").first().getAttribute("aria-label"))?.split(",")[0];
  await shot(page, `us001-${engine}-after-undo`);
  console.log(`${engine}: after undo card "${back}"; votes ${undone.length}; "${name}" row: ${JSON.stringify(undone.filter((v) => v.name === name).map((v) => v.vote ?? v.kind ?? v.decision))}`);
} finally {
  await browser.close();
}
