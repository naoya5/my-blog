# Notion Image Sync Implementation Plan

**Goal:** Notion 記事本文の画像ブロックを公開サイトで安定表示できるようにする。同期時に画像を取得してリポジトリ配下へ保存し、生成 Markdown では保存済みの公開パスを参照する。

**Architecture:** `scripts/notion-sync.mjs` の Notion block 変換に `image` ブロック対応を追加する。Notion の `external` / `file` 画像 URL を同期時にダウンロードし、`public/images/blog/<slug>/` に保存する。Markdown には `![caption](/images/blog/<slug>/<filename>)` を出力し、Cloudflare Pages の静的アセットとして記事と一緒に配信する。

**Tech Stack:** Node.js 22, Astro 5 Content Collections, GitHub Actions, Cloudflare Pages, Notion API

## Current State

- `HeroImage` プロパティは URL として frontmatter に入るが、本文画像とは別扱い。
- `blockToMarkdown()` は `paragraph / heading / list / quote / code / divider` のみ対応している。
- Notion の `image` ブロックは Markdown に変換されないため、本文に貼った画像は現在の公開記事には出ない。
- GitHub Actions は `src/content/blog` の差分だけを見てコミットしているため、画像保存先を増やす場合は workflow の差分検知と `git add` 対象も広げる必要がある。

## Target Behavior

- Notion 本文の画像ブロックが Markdown 画像として記事に表示される。
- 画像は Notion の一時 URL へ直接依存せず、サイト側の静的アセットとして配信される。
- 同期を再実行しても同じ画像は安定したファイル名に保存され、不要な差分を出しにくい。
- `pnpm build` と CI デプロイで画像込みの記事が再現できる。

## Storage Policy

- 保存先: `public/images/blog/<slug>/`
- Markdown 参照: `/images/blog/<slug>/<filename>`
- ファイル名: `<block-id>.<ext>` を基本にする。
- 拡張子は `Content-Type` または URL pathname から推定する。推定不能な場合は安全側で `.jpg` を使う。
- alt は Notion image caption を優先し、空なら記事タイトルまたは空文字にする。

## Implementation Tasks

### Task 1: Notion image block の Markdown 変換設計

**Files:**
- Modify: `scripts/notion-sync.mjs`
- Test: `tests/notion-sync/image-block.test.mjs` または既存テスト構成に合わせた新規テスト

**Steps:**
- `blockToMarkdown()` を async 化するか、画像処理だけを別関数へ切り出して `blocksToMarkdown()` から呼ぶ。
- `image.external.url` と `image.file.url` の両方を扱う。
- caption を Markdown alt として扱う。
- `![alt](/images/blog/<slug>/<filename>)` を出力する。

### Task 2: 画像ダウンロードと保存

**Files:**
- Modify: `scripts/notion-sync.mjs`
- Add/Modify: `tests/notion-sync/image-download.test.mjs`

**Steps:**
- `downloadImage(url, destination)` を追加する。
- `fetch()` で画像を取得し、HTTP エラー時は同期全体を失敗させる。
- 保存前に `public/images/blog/<slug>/` を作成する。
- 既存ファイルがある場合は内容ハッシュまたはサイズ比較で不要な上書きを避ける。
- URL のクエリ文字列はファイル名に含めない。

### Task 3: 同期 workflow の差分対象を拡張

**Files:**
- Modify: `.github/workflows/notion-sync.yml`

**Steps:**
- 差分検知対象に `public/images/blog` を追加する。
- `git add` 対象に `src/content/blog public/images/blog` を追加する。
- 画像だけ追加された場合でも commit されることを確認する。

### Task 4: 運用ドキュメント更新

**Files:**
- Modify: `docs/blog-operation-guide.md`
- Modify: `NOTION_AUTOMATION_GUIDE.md`
- Modify: `docs/api-pattern.md` if image contract changes
- Modify: `docs/HARNESS-LOG.md`

**Steps:**
- Notion 本文画像は同期時にローカル保存されることを明記する。
- `HeroImage` は引き続き許可ホスト制限付き URL として扱うことを明記する。
- 画像が増える場合の注意点として、リポジトリサイズと将来的な R2 / Cloudflare Images 移行余地を書く。

## Verification Checklist

- `pnpm notion:sync:dry-run` で image block を含む記事の処理が落ちない。
- テスト用 Notion 記事を同期すると、`src/content/blog/<slug>.md` に `![...](/images/blog/<slug>/...)` が出力される。
- `public/images/blog/<slug>/` に画像ファイルが保存される。
- `.github/workflows/notion-sync.yml` の検知対象により、Markdown と画像が同じ commit に入る。
- `pnpm build` が成功する。
- ローカル preview または Cloudflare Pages 上で本文画像が表示される。

## Risks / Notes

- Notion の `file.url` は期限付き URL の可能性があるため、同期時に必ず保存してから公開パスへ置き換える。
- 画像数が増えると Git リポジトリが重くなる。個人ブログの初期運用では問題になりにくいが、容量が増えたら Cloudflare R2 / Images への移行を検討する。
- 画像削除の同期は別問題。Notion 側で画像を消しても、既存の `public/images/blog/<slug>/` に残ったファイルを自動削除するかは初期実装では扱わない。
- SVG や GIF を許可する場合は CSP / 表示安全性 / 最適化方針を別途確認する。
