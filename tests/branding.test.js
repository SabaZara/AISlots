import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("browser tab branding uses the AISlots title and versioned icon", async () => {
  const html = await readFile(path.join(projectRoot, "index.html"), "utf8");
  const favicon = await readFile(path.join(projectRoot, "assets", "favicon.svg"), "utf8");

  assert.match(html, /<title>AISlots · World Forge<\/title>/);
  assert.match(html, /<meta name="application-name" content="AISlots" \/>/);
  assert.match(html, /<link rel="icon" href="\/assets\/favicon\.svg\?v=2" type="image\/svg\+xml" sizes="any" \/>/);
  assert.match(favicon, /<title id="title">AISlots<\/title>/);
});
