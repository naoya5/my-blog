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
  assert.match(source, /data-astro-rerun/);
  assert.match(source, /astro:page-load/);
  assert.match(source, /blog-search-focus-requested/);
  assert.match(source, /blog-search:focus-requested/);
  assert.match(source, /consumeSearchFocusRequest/);
});

test("Header search trigger dispatches modal open event and keyboard shortcut", () => {
  const source = fs.readFileSync(
    new URL("../../src/components/layout/Header.astro", import.meta.url),
    "utf8",
  );
  assert.match(source, /data-search-trigger="site-search-open"/);
  assert.match(source, /const SEARCH_OPEN_EVENT = 'site-search:open'/);
  assert.match(source, /window\.dispatchEvent\(new CustomEvent\(SEARCH_OPEN_EVENT\)\)/);
  assert.match(source, /event\.metaKey \|\| event\.ctrlKey/);
  assert.match(source, /event\.key\.toLowerCase\(\) !== 'k'/);
});

test("Search modal listens open event and mounts Pagefind UI", () => {
  const source = fs.readFileSync(
    new URL("../../src/components/layout/SearchModal.astro", import.meta.url),
    "utf8",
  );
  assert.match(source, /const SEARCH_OPEN_EVENT = 'site-search:open'/);
  assert.match(source, /dialog\.showModal\(\)/);
  assert.match(source, /new window\.PagefindUI\(/);
  assert.match(source, /#site-search-host/);
  assert.match(source, /data-search-modal-close/);
});

test("Dark mode search UI styles include contrast-oriented selectors", () => {
  const searchSource = fs.readFileSync(
    new URL("../../src/components/blog/Search.astro", import.meta.url),
    "utf8",
  );
  const globalCss = fs.readFileSync(
    new URL("../../src/styles/global.css", import.meta.url),
    "utf8",
  );
  assert.match(searchSource, /html\.dark\s*\{[\s\S]*--pagefind-ui-background/);
  assert.match(searchSource, /--pagefind-ui-border:\s*rgb\(71 85 105 \/ 0\.75\)/);
  assert.match(globalCss, /\.pagefind-ui__search-input::placeholder/);
  assert.match(globalCss, /html\.dark\s+\.pagefind-ui__result/);
});
