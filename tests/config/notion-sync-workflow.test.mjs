import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Notion sync workflow commits generated article images when present", () => {
  const source = fs.readFileSync(
    new URL("../../.github/workflows/notion-sync.yml", import.meta.url),
    "utf8",
  );

  assert.match(source, /git status --porcelain --untracked-files=normal -- src\/content\/blog public\/images\/blog/);
  assert.match(source, /if \[ -d public\/images\/blog \]; then\s+git add public\/images\/blog/s);
});
