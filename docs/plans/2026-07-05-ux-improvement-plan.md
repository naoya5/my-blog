# UX Improvement Implementation Plan

> **For Claude:** このプランはタスク単位で委任可能。各タスクは独立して実装・検証・コミットできる。P0 → P1 → P2 の順で着手すること。UI リデザイン（[2026-07-05-ui-redesign-directions.md](2026-07-05-ui-redesign-directions.md)）とは独立しており、どのデザイン案を選んでも無駄にならない共通レイヤーの改善である。

**Goal:** モバイル導線の欠陥を解消し、記事の読書体験（目次・コード・回遊）を技術ブログの標準水準まで引き上げる。

**Architecture:** 変更はすべて既存の層構造（pages → layouts → components）の内側で完結する。新規ページは追加しない。インライン `<script>` を追加する場合は CSP allowlist（`calc-hash.mjs` → `public/_headers`）の更新が必須（詳細は docs/api-pattern.md）。Astro の通常の `<script>` はバンドルされ外部ファイルになるためハッシュ不要、`is:inline` のみ対象。

**Tech Stack:** Astro 5, Tailwind 3, Pagefind, Shiki, Node.js test runner (`node --test`), Cloudflare Pages

## Current State（2026-07-05 調査済み）

- `src/components/layout/Header.astro`: ナビが `hidden md:block`、検索ボタンが `hidden lg:flex`。**md 未満では Blog / Archive リンクに到達不可（ハンバーガー未実装）**。
- カラーが二重管理: `src/styles/global.css` の CSS 変数はブラウン系（`--accent: 135 90 58`）、`tailwind.config.cjs` の `brand` パレットは青系（sky）。`nav-link` 等が brand（青）を参照し、ダーク用に slate 系ハードコードが多数併存。
- `src/pages/index.astro`: Latest Posts がタイトル + 日付のみ（description / タグ / 読了時間なし）。
- `src/components/blog/TableOfContents.astro`: 本文上部の静的ボックス。追従・現在地ハイライトなし。
- コードコピーボタンなし（Shiki は transformerNotationDiff / Highlight 導入済み、`wrap: true`）。
- 記事末尾は関連記事（最大2件）のみで前後記事ナビなし。見出しアンカーリンクなし。
- 一覧レイアウトが3種混在: トップ=罫線リスト / `blog/index.astro`=BlogCard / `blog/tag/[tag].astro`=独自グリッド。
- シェアボタン・コメント・読了プログレスバーなし。
- 未使用ファイル: `src/layouts/Layout.astro`、`src/components/Welcome.astro`。Footer/Header に `github.com/your-username` のダミー URL 残存。

## 共通の検証手順（全タスク）

1. `pnpm astro check` が通る。
2. `pnpm build` が通る（CSP ハッシュ変更があれば `public/_headers` 更新済みであること）。
3. `pnpm preview` に対して agent-browser で viewport 390×844（モバイル）と 1440×900（デスクトップ）のスクリーンショットを撮り、両テーマ（light/dark）で崩れがないことを目視確認。
4. コミットは Conventional Commits（例: `feat(ui): add mobile navigation drawer`）。

---

## P0 — 欠陥修正（最優先・合計 約1日）

### Task 1: モバイルナビゲーションの実装

**Files:**
- Modify: `src/components/layout/Header.astro`
- Modify: `src/styles/global.css`（メニュー用スタイル）

**Steps:**
1. md 未満で表示するハンバーガーボタンを `header-pill` 内に追加（`md:hidden`、44×44px 以上のタップ領域、`aria-expanded` / `aria-controls` 付き）。
2. 開閉するメニューパネルを実装（Blog / Archive / About / 検索 / テーマ切替を含む）。`<dialog>` または `details` ベースでも可。既存の SearchModal のスクリプトパターン（バンドルされる `<script>`）に合わせる。
3. View Transitions（ClientRouter）でページ遷移後もイベントが生きるよう、`astro:page-load` で初期化する（SearchModal の実装を参照）。
4. 開いた状態で `Escape` で閉じる・背景スクロールロック（既存 `.search-modal-open` ユーティリティ参照）。

**Verify:** 390px 幅で Blog / Archive へ2タップ以内で遷移できる。デスクトップでは従来表示のまま。

### Task 2: カラートークンの一本化

**Files:**
- Modify: `tailwind.config.cjs`
- Modify: `src/styles/global.css`

**Steps:**
1. `tailwind.config.cjs` の `brand` パレットを CSS 変数参照（`rgb(var(--accent) / <alpha-value>)` 方式）に置き換えるか、`brand-*` の使用箇所（`nav-link`、selection 等）を `--accent` 系に統一する。方針: **色の真実の源は global.css の CSS 変数のみ**にする。
2. `global.css` 内のダーク用 slate / sky ハードコード（`.floating-nav-link`、`.floating-search`、Pagefind ダーク系など約20箇所）を `--surface` / `--line` / `--text-muted` / `--accent` 変数参照に置き換える。`html.dark` の重複セレクタは原則削除できるはず（変数が切り替わるため）。
3. 置き換え後、`grep -n 'slate\|sky-' src/styles/global.css tailwind.config.cjs` で残存を確認し、意図的なもの以外ゼロにする。

**Verify:** ライト/ダーク両テーマでヘッダー・検索モーダル・ナビのアクティブ色がアクセント（ブラウン/ライトブラウン）に統一されている。青が出ない。

### Task 3: トップページの情報量回復

**Files:**
- Modify: `src/pages/index.astro`
- Modify (必要なら): `src/components/blog/BlogCard.astro`

**Steps:**
1. Latest Posts の各行に description（1〜2行で `line-clamp`）、タグ（最大3つ）、読了時間を追加する。`BlogCard.astro` をそのまま再利用できるならそれが最善（Task 9 の前倒しになる）。
2. 読了時間は既存 `ReadingTime.astro` / `reading-time` ユーティリティを利用。

**Verify:** トップの最新記事から「何の記事か」がタイトルを読まずに判別できる。

---

## P1 — 読書体験（合計 2〜3日）

### Task 4: 追従目次 + スクロールスパイ

**Files:**
- Modify: `src/components/blog/TableOfContents.astro`
- Modify: `src/pages/blog/[slug].astro`（レイアウトを lg 以上で 2 カラム化）

**Steps:**
1. lg 以上: 記事本文の右に `position: sticky` のサイドレールとして目次を配置（本文 `max-w-3xl` は維持し、グリッドで右レールを追加）。lg 未満: 現状どおり本文上部、`<details>` で折りたたみ。
2. `IntersectionObserver` で現在表示中の h2/h3 に対応する目次項目をハイライト（`aria-current="true"` を付与しスタイルはそれに当てる）。
3. スクリプトはバンドルされる `<script>` で実装し、`astro:page-load` で再初期化。CSP ハッシュ不要なことを確認。

**Verify:** 長文記事（/blog/ai/）でスクロールに追従し、現在のセクションがハイライトされる。モバイルで折りたたみが機能する。

### Task 5: コードブロックのコピーボタン

**Files:**
- Modify: `src/pages/blog/[slug].astro`（または `BaseLayout.astro`）
- Modify (必要時): `public/_headers` + `calc-hash.mjs`

**Steps:**
1. `astro:page-load` で `.prose pre` を走査し、コピーボタン（右上、`aria-label="コードをコピー"`）を後付けする script を追加。クリックで `navigator.clipboard.writeText(pre.innerText)`、成功時 2 秒間「Copied ✓」表示。
2. ボタンのスタイルは global.css にトークン参照で追加（ホバーで出現、モバイルは常時表示）。
3. `is:inline` を使わない実装にし、CSP 更新が不要なことを確認する。使う場合は必ず `node calc-hash.mjs` → `public/_headers` 追記。

**Verify:** 本番ビルド（`pnpm build && pnpm preview`）でコピーが動作する（CSP でブロックされないこと。dev では CSP が効かないため必ず preview で確認）。

### Task 6: 前後記事ナビ + 見出しアンカーリンク

**Files:**
- Modify: `src/pages/blog/[slug].astro`
- Modify (アンカー): `astro.config.mjs`（rehype-autolink-headings 追加）または既存 rehype 設定

**Steps:**
1. `getStaticPaths` で全記事のソート済みリスト（既存 `src/utils/` のソートユーティリティを使用）から prev/next を props で渡し、記事末尾（関連記事の上）に「← 前の記事 / 次の記事 →」を表示。内部リンクは末尾スラッシュ必須。
2. `rehype-slug` + `rehype-autolink-headings` で h2/h3 にアンカーリンクを付与（ホバーで `#` 表示）。既に heading id が生成されている場合（TOC が動いているので slug は生成済みのはず）は autolink のみ追加。

**Verify:** 記事末尾から前後の記事へ遷移できる。見出しホバーで # リンクが現れ、コピーした URL で該当位置へ飛べる。

### Task 7: 一覧レイアウトの統一

**Files:**
- Modify: `src/pages/blog/tag/[tag].astro`
- Modify: `src/pages/index.astro`（Task 3 で未対応の場合）
- Modify: `src/components/blog/BlogCard.astro`

**Steps:**
1. `BlogCard.astro` に variant prop（`default` / `compact` 等）を追加し、トップ / アーカイブ / タグ別 / ページネーション一覧の4画面すべてで同一コンポーネントを使う。
2. タグページ独自のグリッドカード実装を削除。

**Verify:** 4画面で記事カードの見た目・情報量が一貫している。`grep -rn 'article' src/pages/blog/tag/` に独自カード実装が残っていない。

---

## P2 — 回遊とエンゲージメント（記事10本超えたら着手で十分）

### Task 8: シェアボタン（X / はてなブックマーク / URLコピー）

**Files:**
- Create: `src/components/blog/ShareLinks.astro`
- Modify: `src/pages/blog/[slug].astro`

**Steps:** 記事末尾に静的リンクで設置（X intent URL、はてブ追加 URL、URL コピーのみ小さな script）。`Astro.url` から canonical URL を生成（末尾スラッシュ）。

### Task 9: giscus コメント

**Files:**
- Create: `src/components/blog/Comments.astro`
- Modify: `src/pages/blog/[slug].astro`、`public/_headers`

**Steps:** GitHub Discussions を有効化 → giscus 設定 → `frame-src https://giscus.app` と script-src の追記が必要（CSP は手動 allowlist なので忘れると本番で無言で消える）。テーマ切替（ThemeToggle）と連動して giscus テーマも切り替えること。**リポジトリ設定が必要なため、着手前にユーザー確認必須。**

### Task 10: 読了プログレスバー + Back to top

**Files:**
- Modify: `src/pages/blog/[slug].astro`、`src/styles/global.css`

**Steps:** 記事ページ上端に細いプログレスバー（`scroll` イベントか `animation-timeline: scroll()` + JS フォールバック）。`prefers-reduced-motion` を尊重。Back to top はフッター手前に静的リンクで十分。

### Task 11: クリーンアップ

**Files:**
- Delete: `src/layouts/Layout.astro`、`src/components/Welcome.astro`
- Modify: `src/components/layout/Footer.astro`、`src/components/layout/Header.astro`

**Steps:** 未使用ファイル削除（`grep -rn 'Layout.astro\|Welcome' src/` で参照ゼロを確認してから）。`github.com/your-username` のダミー URL を実アカウント（naoya5）に修正するか、リンク自体を削除。

---

## Acceptance Criteria（プラン全体）

- [ ] 390px 幅で全ページのナビゲーションが機能する（P0-1）
- [ ] `slate-` / `sky-` / `brand`（青）のハードコードが global.css / tailwind.config.cjs から排除され、色の真実の源が CSS 変数に一本化されている（P0-2）
- [ ] 記事ページ: 追従目次・コードコピー・前後ナビが本番ビルド（CSP 有効）で動作する（P1）
- [ ] 記事カードコンポーネントが1つに統一されている（P1-7）
- [ ] すべてのタスクで `pnpm astro check` / `pnpm build` が通り、ライト/ダーク両テーマで確認済み

## 備考

- UI リデザイン（デザイントークンの刷新）を先に実施する場合、Task 2 はそのフェーズに吸収してよい。ただし Task 1（モバイルナビ）はどの順でも最優先。
- Task 9（giscus）のみ外部サービス連携・リポジトリ設定変更を伴うため、実装前にユーザーの明示的な承認を取ること。
