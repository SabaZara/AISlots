import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const audioRoot = path.join(projectRoot, "assets", "audio");

test("the deployed audio manifest only references shipped audio files", async () => {
  const manifestPath = path.join(audioRoot, "manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const files = Object.values(manifest).flat();

  assert.ok(files.length > 0, "manifest must contain at least one audio file");

  for (const file of files) {
    assert.equal(typeof file, "string", `invalid manifest entry: ${String(file)}`);
    assert.ok(!path.isAbsolute(file), `${file} must be relative to assets/audio`);

    const resolved = path.resolve(audioRoot, file);
    assert.ok(
      resolved.startsWith(`${audioRoot}${path.sep}`),
      `${file} escapes assets/audio and will not be safely deployable`
    );
    assert.ok((await stat(resolved)).isFile(), `${file} is missing from assets/audio`);
  }
});
