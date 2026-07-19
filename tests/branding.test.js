import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("browser and link previews use the AISlots title, original icon, and World Forge artwork", async () => {
  const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
  const favicon = await readFile(path.join(projectRoot, "assets", "favicon.svg"), "utf8");
  const preview = await readFile(path.join(projectRoot, "assets", "aislots-world-forge-preview.png"));

  assert.match(html, /<title>AISlots · World Forge<\/title>/);
  assert.match(html, /<meta name="application-name" content="AISlots" \/>/);
  assert.match(html, /<meta property="og:image" content="https:\/\/aislots-gcga\.onrender\.com\/assets\/aislots-world-forge-preview\.png\?v=1" \/>/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image" \/>/);
  assert.match(html, /<link rel="icon" href="\/assets\/favicon\.svg\?v=3" type="image\/svg\+xml" sizes="any" \/>/);
  assert.match(favicon, /M32 8 38 26 56 32 38 38 32 56 26 38 8 32 26 26Z/);
  assert.ok(preview.byteLength > 50_000, "World Forge preview should be a production-quality image");
});
