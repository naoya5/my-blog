# X Post Embed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a remark plugin that transforms bare X (Twitter) post URLs in Markdown into static, theme-matched embed cards at build time using the Twitter oEmbed API.

**Architecture:** A custom remark plugin (`src/plugins/remark-x-embed.ts`) detects standalone X URLs in paragraph nodes, fetches metadata from `publish.twitter.com/oembed`, caches responses in `.cache/remark-x-embed/`, and emits static HTML cards. The plugin is registered in `astro.config.mjs` and styled via `src/styles/global.css`.

**Tech Stack:** Astro 5, TypeScript, remark/unified, `unist-util-visit`, `node:crypto`, `node:fs/promises`, global `fetch` (Node 22).

## Global Constraints

- `pnpm@9.15.5` / Node 22. Install dependencies with `--frozen-lockfile`.
- TypeScript strict (`astro/tsconfigs/strict`).
- No new inline `<script>` tags; no CSP `script-src` changes.
- URLs must end with trailing slash (`trailingSlash: 'always'`), but this feature only reads external X URLs.
- Conventional Commits: `feat/fix/refactor/docs/test/chore/perf/ci`.
- Existing CSS variables (`--surface`, `--line`, `--text-main`, `--text-muted`, `--accent`) must be used for styling.
- The project has no test runner; verification is done via `pnpm astro check` and `pnpm build`.

---

## File Structure

| File | Responsibility |
|------|----------------|
| `src/plugins/remark-x-embed.ts` | New remark plugin: URL detection, oEmbed fetch/cache, HTML card generation. |
| `astro.config.mjs` | Register `remarkXEmbed` in `markdown.remarkPlugins`. |
| `src/styles/global.css` | Theme-matched CSS for `.x-embed-card` and variants. |
| `package.json` | Add `unist-util-visit` and `@types/mdast` dependencies. |
| `src/content/blog/x-embed-test.md` (temporary) | Test fixture with a real X URL; removed after verification. |

---

### Task 1: Add Dependencies

**Files:**
- Modify: `package.json`

**Interfaces:**
- Consumes: none.
- Produces: `unist-util-visit` and `@types/mdast` available for the plugin.

- [ ] **Step 1: Install dependencies**

Run:

```bash
pnpm add -D unist-util-visit @types/mdast
```

Expected: `package.json` devDependencies updated and `pnpm-lock.yaml` changed.

- [ ] **Step 2: Verify lockfile is valid**

Run:

```bash
pnpm install --frozen-lockfile
```

Expected: command succeeds with no lockfile mismatch errors.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add unist-util-visit and @types/mdast for X embed plugin

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

### Task 2: Implement the Remark Plugin

**Files:**
- Create: `src/plugins/remark-x-embed.ts`

**Interfaces:**
- Consumes: `unist-util-visit`, `mdast` types, Node built-ins.
- Produces: `remarkXEmbed` default export function used by `astro.config.mjs`.

- [ ] **Step 1: Create the plugin file**

Create `src/plugins/remark-x-embed.ts` with the following content:

```typescript
import type { Link, Paragraph } from 'mdast';
import type { Node, Parent } from 'unist';
import { visit } from 'unist-util-visit';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

interface OEmbedResponse {
  url: string;
  author_name: string;
  author_url: string;
  html: string;
}

interface XEmbedData {
  url: string;
  authorName: string;
  authorHandle: string;
  authorUrl: string;
  text: string;
  dateText: string;
}

const X_URL_REGEX = /^https?:\/\/(?:x\.com|twitter\.com)\/([^/]+)\/status\/(\d+)/;

function isStandaloneXUrl(node: Paragraph): string | null {
  if (node.children.length !== 1) return null;
  const child = node.children[0];
  if (child.type !== 'link') return null;
  if (child.children.length !== 1 || child.children[0].type !== 'text') return null;
  return X_URL_REGEX.test(child.url) ? child.url : null;
}

function getCachePath(url: string): string {
  const hash = createHash('sha256').update(url).digest('hex').slice(0, 16);
  return `.cache/remark-x-embed/${hash}.json`;
}

async function loadFromCache(url: string): Promise<OEmbedResponse | null> {
  const path = getCachePath(url);
  if (!existsSync(path)) return null;
  try {
    const raw = await readFile(path, 'utf-8');
    return JSON.parse(raw) as OEmbedResponse;
  } catch {
    return null;
  }
}

async function saveToCache(url: string, data: OEmbedResponse): Promise<void> {
  const path = getCachePath(url);
  await mkdir('.cache/remark-x-embed', { recursive: true });
  await writeFile(path, JSON.stringify(data));
}

async function fetchOEmbed(url: string): Promise<OEmbedResponse | null> {
  const cached = await loadFromCache(url);
  if (cached) return cached;

  const apiUrl = `https://publish.twitter.com/oembed?url=${encodeURIComponent(url)}&omit_script=true`;
  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const data = (await response.json()) as OEmbedResponse;
    await saveToCache(url, data);
    return data;
  } catch {
    return null;
  }
}

function parseOEmbed(data: OEmbedResponse): XEmbedData | null {
  const authorUrlMatch = data.author_url.match(/https?:\/\/(?:x\.com|twitter\.com)\/([^/]+)\/?$/);
  const handle = authorUrlMatch?.[1] ?? '';
  const textMatch = data.html.match(/<p[^>]*>(.*?)<\/p>/is);
  const text = textMatch?.[1] ?? '';
  const dateMatch = data.html.match(/<a[^>]*href="[^"]*"[^>]*>(.*?)<\/a>/is);
  const dateText = dateMatch?.[1] ?? '';

  if (!handle || !text) return null;

  return {
    url: data.url,
    authorName: data.author_name,
    authorHandle: handle,
    authorUrl: data.author_url,
    text,
    dateText,
  };
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderCard(data: XEmbedData): string {
  return [
    '<figure class="x-embed-card">',
    '  <figcaption class="x-embed-header">',
    `    <span class="x-embed-author">${escapeHtml(data.authorName)}</span>`,
    `    <span class="x-embed-handle">@${escapeHtml(data.authorHandle)}</span>`,
    '  </figcaption>',
    `  <blockquote class="x-embed-body" cite="${escapeHtml(data.url)}">`,
    `    <p>${data.text}</p>`,
    '  </blockquote>',
    '  <footer class="x-embed-footer">',
    `    <a href="${escapeHtml(data.url)}" target="_blank" rel="noopener noreferrer">`,
    `      <time>${escapeHtml(data.dateText)}</time> · Xで見る`,
    '    </a>',
    '  </footer>',
    '</figure>',
  ].join('\n');
}

function renderFallback(url: string): string {
  return [
    '<figure class="x-embed-card x-embed-card-fallback">',
    '  <blockquote class="x-embed-body">',
    `    <a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">Xの投稿を見る</a>`,
    '  </blockquote>',
    '</figure>',
  ].join('\n');
}

export default function remarkXEmbed() {
  return async (tree: Node) => {
    const targets: { parent: Parent; index: number; url: string }[] = [];

    visit(tree, 'paragraph', (node: Paragraph, index, parent) => {
      const url = isStandaloneXUrl(node);
      if (url && parent && typeof index === 'number') {
        targets.push({ parent, index, url });
      }
    });

    await Promise.all(
      targets.map(async ({ parent, index, url }) => {
        const oembed = await fetchOEmbed(url);
        const data = oembed ? parseOEmbed(oembed) : null;
        const html = data ? renderCard(data) : renderFallback(url);
        parent.children[index] = { type: 'html', value: html };
      }),
    );
  };
}
```

Note: `data.text` comes from the trusted X oEmbed HTML and is used as-is so entities like `&quot;` render correctly. Author and date fields are re-escaped.

- [ ] **Step 2: Type check the plugin**

Run:

```bash
pnpm astro check
```

Expected: passes with no errors related to `src/plugins/remark-x-embed.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/plugins/remark-x-embed.ts
git commit -m "feat(remark): add X post embed plugin

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

### Task 3: Register the Plugin in Astro Config

**Files:**
- Modify: `astro.config.mjs`

**Interfaces:**
- Consumes: `remarkXEmbed` from `src/plugins/remark-x-embed.ts`.
- Produces: plugin registered in `markdown.remarkPlugins`.

- [ ] **Step 1: Import and register the plugin**

Edit `astro.config.mjs`:

Add import near the top with other imports:

```javascript
import remarkXEmbed from './src/plugins/remark-x-embed.ts';
```

Add to `markdown.remarkPlugins` array:

```javascript
remarkPlugins: [
  [remarkLinkCard, { cache: true, shortenUrl: true, thumbnailPosition: 'right' }],
  remarkAlert,
  remarkXEmbed,
],
```

- [ ] **Step 2: Verify the config loads**

Run:

```bash
pnpm astro check
```

Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "chore(config): register X embed remark plugin

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

### Task 4: Add CSS Styles

**Files:**
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: existing CSS variables (`--surface`, `--line`, `--text-main`, `--text-muted`, `--accent`).
- Produces: `.x-embed-card` styles applied to generated HTML.

- [ ] **Step 1: Append component styles**

Inside `src/styles/global.css`, inside the existing `@layer components` block (after existing components), add:

```css
  .x-embed-card {
    @apply my-6 rounded-2xl border p-5;
    border-color: rgb(var(--line));
    background: rgba(var(--surface), 0.72);
  }

  .x-embed-header {
    @apply mb-3 flex flex-wrap items-baseline gap-2;
  }

  .x-embed-author {
    @apply font-semibold;
    color: rgb(var(--text-main));
  }

  .x-embed-handle {
    @apply text-sm;
    color: rgb(var(--text-muted));
  }

  .x-embed-body {
    @apply my-0 border-0 pl-0;
    color: rgb(var(--text-main));
  }

  .x-embed-body p {
    @apply my-0;
    line-height: 1.7;
  }

  .x-embed-footer {
    @apply mt-3 text-sm;
    color: rgb(var(--text-muted));
  }

  .x-embed-footer a {
    @apply no-underline transition-colors;
    color: rgb(var(--text-muted));
  }

  .x-embed-footer a:hover {
    color: rgb(var(--accent));
  }

  .x-embed-card-fallback {
    @apply p-4;
  }
```

- [ ] **Step 2: Verify CSS builds**

Run:

```bash
pnpm build
```

Expected: build succeeds with no CSS errors.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "style: add X embed card styles

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

### Task 5: Test with a Sample X URL

**Files:**
- Create: `src/content/blog/x-embed-test.md` (temporary)

**Interfaces:**
- Consumes: the configured plugin and styles.
- Produces: verified build output containing `x-embed-card` HTML.

- [ ] **Step 1: Create a temporary test post**

Create `src/content/blog/x-embed-test.md`:

```markdown
---
title: 'X Embed Test'
description: 'X post embed feature test fixture.'
pubDate: 2026-07-07
draft: true
tags: ['test']
---

This post contains a standalone X URL that should be converted to an embed card.

https://x.com/astrodotbuild/status/1234567890123456789

Some text after the embed.
```

Use a real, publicly accessible X post URL for a meaningful test. Update the URL above accordingly.

- [ ] **Step 2: Build the site**

Run:

```bash
pnpm build
```

Expected: build succeeds and the X URL triggers an oEmbed request (or cache hit). A cache file is created under `.cache/remark-x-embed/`.

- [ ] **Step 3: Inspect the generated HTML**

Check the built file, e.g.:

```bash
grep -o 'x-embed-card' dist/blog/x-embed-test/index.html | head
```

Expected: output contains `x-embed-card`.

- [ ] **Step 4: Remove the temporary test post**

```bash
rm src/content/blog/x-embed-test.md
rm -rf .cache/remark-x-embed
```

- [ ] **Step 5: Commit test result (not the fixture)**

If the test succeeded, commit only the plugin/config/style changes already committed. No new commit needed unless fixes were made.

---

### Task 6: Final Verification and Documentation

**Files:**
- Modify: `docs/HARNESS-LOG.md` (optional, per project routine)

**Interfaces:**
- Consumes: all prior tasks.
- Produces: final working build and updated documentation.

- [ ] **Step 1: Run final type check and build**

```bash
pnpm astro check && pnpm build
```

Expected: both commands succeed.

- [ ] **Step 2: Update docs/HARNESS-LOG.md**

Append a short entry describing the new X embed feature, the files added, and any notes for future maintainers. Keep it concise (project routine).

- [ ] **Step 3: Final commit if HARNESS-LOG.md was changed**

```bash
git add docs/HARNESS-LOG.md
git commit -m "docs: log X post embed feature

Co-authored-by: factory-droid[bot] <138933559+factory-droid[bot]@users.noreply.github.com>"
```

---

## Self-Review

**Spec coverage:**
- Automatic conversion of bare X URLs: Task 2 (`isStandaloneXUrl`) + Task 3.
- Build-time oEmbed fetch and cache: Task 2 (`fetchOEmbed`, `saveToCache`, `loadFromCache`).
- Static rich card with author/handle/text/date: Task 2 (`renderCard`).
- Fallback on failure: Task 2 (`renderFallback`).
- CSP-safe, no external scripts: ensured by static HTML generation (Tasks 2, 4).
- Theme-matched styling: Task 4.

**Placeholder scan:**
- No TBD/TODO/fill-in-details. All code and commands are concrete.
- The test URL in Task 5 is a placeholder for a real URL, but the step explicitly tells the implementer to use a real, publicly accessible X post URL.

**Type consistency:**
- `remarkXEmbed` is a default export in Task 2 and imported as default in Task 3.
- `X_URL_REGEX` and `OEmbedResponse`/`XEmbedData` interfaces are defined in Task 2 only.
- CSS class names in Task 4 match HTML generated in Task 2.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-07-x-post-embed.md`. Two execution options:

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach would you like?
