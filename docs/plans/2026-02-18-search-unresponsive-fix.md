# Search Unresponsive Fix Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 検索UIで「タップしても反応しない」状態を解消し、常に検索が動作するか、最低でも失敗理由が画面上で分かる状態にする。  

**Architecture:** 原因は「デプロイ経路で Pagefind 生成が保証されていないこと」と「検索UI初期化失敗時に無言で return していること」の組み合わせ。`deploy` 導線を `build` に統一して Pagefind 生成を必須化し、`Search.astro` に初期化失敗時のフォールバック表示を追加する。加えて再発防止として CI/ローカルで実行可能な検証テストを追加する。  

**Tech Stack:** Astro 5, Pagefind 1.4, pnpm, Cloudflare Pages, Node.js test runner (`node --test`)

## Root Cause (Confirmed)

- `package.json:11` の `deploy` が `astro build && wrangler pages deploy ./dist` で、`pagefind --site dist` を実行しない。
- `src/components/blog/Search.astro:28` は `/pagefind/pagefind-ui.js` 前提で、`src/components/blog/Search.astro:32` で `window.PagefindUI` が無ければ無言で return する。
- 実測: `npm run astro -- build --outDir /tmp/my-blog-no-pagefind` 直後に `/tmp/my-blog-no-pagefind/pagefind` が `missing`（`astro build` 単体では検索資産が出ない）。

---

### Task 1: Deploy 導線の修正（Pagefind 生成を必須化）

**Files:**
- Modify: `package.json`
- Test: `tests/config/deploy-script.test.mjs`

**Step 1: Write the failing test**

```js
// tests/config/deploy-script.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("deploy script must include pagefind generation path", () => {
  const pkg = JSON.parse(fs.readFileSync(new URL("../../package.json", import.meta.url), "utf8"));
  const deploy = pkg.scripts?.deploy ?? "";
  assert.match(
    deploy,
    /pnpm build|pagefind --site dist/,
    "deploy must run pnpm build (or pagefind explicitly) before wrangler deploy",
  );
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/config/deploy-script.test.mjs`  
Expected: FAIL（現状の `deploy` に `pnpm build` / `pagefind` が無いため）

**Step 3: Write minimal implementation**

- `package.json` の `deploy` を次のどちらかに変更する（推奨は前者）。
  - 推奨: `"deploy": "pnpm build && wrangler pages deploy ./dist"`
  - 代替: `"deploy": "astro check && astro build && pagefind --site dist && wrangler pages deploy ./dist"`

**Step 4: Run test to verify it passes**

Run: `node --test tests/config/deploy-script.test.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add package.json tests/config/deploy-script.test.mjs
git commit -m "fix: ensure deploy path always generates pagefind assets"
```

---

### Task 2: Search 初期化失敗時のフォールバック表示

**Files:**
- Modify: `src/components/blog/Search.astro`
- Test: `tests/ui/search-fallback.test.mjs`

**Step 1: Write the failing test**

```js
// tests/ui/search-fallback.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("Search component has visible fallback when PagefindUI is unavailable", () => {
  const source = fs.readFileSync(new URL("../../src/components/blog/Search.astro", import.meta.url), "utf8");
  assert.match(source, /data-search-status/);
  assert.match(source, /検索を読み込めませんでした|Search is temporarily unavailable/);
});
```

**Step 2: Run test to verify it fails**

Run: `node --test tests/ui/search-fallback.test.mjs`  
Expected: FAIL（現状フォールバック文言/状態属性が未実装）

**Step 3: Write minimal implementation**

- `#search` 直下にフォールバック領域を追加し、初期状態は非表示。
- `window.PagefindUI` 不在時に:
  - フォールバック表示
  - `console.warn` で原因を出力
  - `data-search-status="error"` を付与
- 初期化成功時は `data-search-status="ready"` を設定しフォールバック非表示。

**Step 4: Run test to verify it passes**

Run: `node --test tests/ui/search-fallback.test.mjs`  
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/blog/Search.astro tests/ui/search-fallback.test.mjs
git commit -m "fix: add pagefind initialization fallback state to search ui"
```

---

### Task 3: 実ビルド検証と運用ドキュメント更新

**Files:**
- Modify: `README.md`
- Modify: `BLOG_PUBLISHING_WORKFLOW.md`

**Step 1: Write the failing verification check (manual)**

Run: `npm run astro -- build --outDir /tmp/my-blog-no-pagefind`  
Run: `test -d /tmp/my-blog-no-pagefind/pagefind && echo ok || echo missing`  
Expected: `missing`（基礎事実の再確認）

**Step 2: Run production-path verification**

Run: `pnpm build`  
Run: `test -f dist/pagefind/pagefind-ui.js && test -f dist/pagefind/pagefind-entry.json && echo ok`  
Expected: `ok`

**Step 3: Update docs**

- `README.md` の `pnpm deploy` 説明に「`deploy` は `pnpm build` を内包し、検索インデックス生成込み」であることを明記。
- `BLOG_PUBLISHING_WORKFLOW.md` に「検索が反応しないときの first check: `dist/pagefind/*`」を追記。

**Step 4: Run sanity checks**

Run: `pnpm build`  
Expected: 成功し、`dist/pagefind/` が存在

**Step 5: Commit**

```bash
git add README.md BLOG_PUBLISHING_WORKFLOW.md
git commit -m "docs: document pagefind asset checks for search reliability"
```

---

## Verification Checklist

- `node --test tests/config/deploy-script.test.mjs` が PASS
- `node --test tests/ui/search-fallback.test.mjs` が PASS
- `pnpm build` 後に `dist/pagefind/pagefind-ui.js` と `dist/pagefind/pagefind-entry.json` が存在
- 本番 URL で `/blog/` の検索欄が表示され、タップ後に候補または結果が返る

## Risks / Notes

- `deploy` を `pnpm build` 経由に変えると、`deploy` 実行時間は増える（想定どおり）。
- Node test は文字列検証中心のため、将来的には Playwright E2E（実クリック）を追加するとより堅牢。
