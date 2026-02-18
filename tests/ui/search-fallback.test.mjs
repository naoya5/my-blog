import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Search component has visible fallback when PagefindUI is unavailable", () => {
  const source = fs.readFileSync(
    new URL("../../src/components/blog/Search.astro", import.meta.url),
    "utf8",
  );
  assert.match(source, /data-search-status/);
  assert.match(source, /検索を読み込めませんでした|Search is temporarily unavailable/);
});
