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

test("Header search trigger uses focus event + sessionStorage handoff", () => {
  const source = fs.readFileSync(
    new URL("../../src/components/layout/Header.astro", import.meta.url),
    "utf8",
  );
  assert.match(source, /data-search-trigger="blog-search-focus"/);
  assert.match(source, /const SEARCH_FOCUS_FLAG = 'blog-search-focus-requested'/);
  assert.match(source, /sessionStorage\.setItem\(SEARCH_FOCUS_FLAG, '1'\)/);
  assert.match(source, /window\.dispatchEvent\(new CustomEvent\('blog-search:focus-requested'\)\)/);
  assert.match(source, /window\.location\.pathname === '\/blog\/'/);
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
