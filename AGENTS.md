# Agentic Signal (my-blog)

> AIエージェントをテーマにした個人技術ブログ。Astro 5 + TypeScript の静的サイト(SSG)を Cloudflare Pages にデプロイ。

<!-- この入口ファイルは「地図」です。50-200行に保ち、詳細は docs/ に逃がすこと。 -->

## 主要コマンド
| 用途 | コマンド |
|------|---------|
| セットアップ | `pnpm install --frozen-lockfile` |
| 開発サーバー | `pnpm dev` |
| ビルド | `pnpm build` （`astro check` → `astro build` → `pagefind --site dist`） |
| 型検査のみ | `pnpm astro check` |
| プレビュー | `pnpm preview` |
| デプロイ | `pnpm deploy` （build + `wrangler pages deploy ./dist`） |
| Notion 同期 | `pnpm notion:sync` / `pnpm notion:sync:dry-run` |

<!-- テストランナーは未導入。型検査(`astro check`)がビルドの最初のゲートを兼ねる。 -->

## グローバル制約(全体に効くルール)
- **ドメインは単一の真実の源**: `astro.config.mjs` の `site` (`https://my-blog-atw.pages.dev`)。canonical / OG / sitemap / robots.txt / RSS / JSON-LD はすべてここから派生する。ドメイン変更時はここだけを直す。
- **記事 frontmatter は Zod スキーマ準拠**: `src/content/config.ts` の `blog` コレクション定義に従う。外部 `heroImage` は `https://` かつ許可ホスト(`images.unsplash.com`)のみ。
- **CSP は手動 allowlist**: インライン `<script>` を追加したら `calc-hash.mjs` で sha256 を算出し `public/_headers` の `script-src` に追記する(さもないと本番でブロックされる)。詳細は api-pattern.md。
- **URL は末尾スラッシュ必須**: `trailingSlash: 'always'`。内部リンクは末尾 `/` を付ける。
- **ランタイム固定**: `pnpm@9.15.5` / Node 22。インストールは `--frozen-lockfile`。
- **コミットは Conventional Commits**: `feat/fix/refactor/docs/test/chore/perf/ci`。
- **型・IF の説明はコード内に書く**: md に二重化しない(ドリフトの温床)。

## ドキュメント地図(必要なときに読む)
### エージェント向け中核(まず読む)
- [docs/architecture.md](docs/architecture.md) — 全体構成と層・`src/` 地図・OG/検索/CI パイプライン。新しいページやコンポーネントを追加する前に読む。
- [docs/api-pattern.md](docs/api-pattern.md) — frontmatter スキーマ・動的ルート・ユーティリティ命名・SEO/CSP の横断規約。記事スキーマやルートを変える前に読む。
- [docs/HARNESS-LOG.md](docs/HARNESS-LOG.md) — ドキュメント体系の変更ログ。出勤時に前回状態を確認する。

### 人間向け詳細ガイド(トピック別・必要時)
- [docs/00-PROJECT-OVERVIEW.md](docs/00-PROJECT-OVERVIEW.md) / [01-SETUP-GUIDE.md](docs/01-SETUP-GUIDE.md) — 概要とセットアップ。
- [docs/02-CONTENT-COLLECTIONS.md](docs/02-CONTENT-COLLECTIONS.md) / [03-COMPONENTS-LAYOUTS.md](docs/03-COMPONENTS-LAYOUTS.md) / [04-PAGES-IMPLEMENTATION.md](docs/04-PAGES-IMPLEMENTATION.md) — コンテンツ・UI・ページ実装の詳細。
- [docs/05-SEO-PERFORMANCE.md](docs/05-SEO-PERFORMANCE.md) / [08-MARKDOWN-PLUGINS.md](docs/08-MARKDOWN-PLUGINS.md) — SEO/パフォーマンスと Markdown プラグイン。
- [docs/10-BLOG-WRITING-WORKFLOW.md](docs/10-BLOG-WRITING-WORKFLOW.md) / [blog-operation-guide.md](docs/blog-operation-guide.md) — 執筆〜公開の運用フロー。
- [docs/06-TROUBLESHOOTING.md](docs/06-TROUBLESHOOTING.md) / [11-HOSTING-DECISION-GUIDE.md](docs/11-HOSTING-DECISION-GUIDE.md) / [07-RESOURCES.md](docs/07-RESOURCES.md) — トラブルシュート・ホスティング判断・参考資料。
- [docs/09-DEVELOPMENT-LOG.md](docs/09-DEVELOPMENT-LOG.md) ・ [docs/implementation/](docs/implementation/) ・ [docs/plans/](docs/plans/) — 開発・実装・計画ログ(履歴)。

## アーキテクチャ要約
Astro 5 の SSG。`src/content/blog/*.md`(Content Collections) → `src/pages/*`(ファイルベースルーティング) → `src/layouts/BaseLayout.astro` → `src/components/*` の一方向の層構造。共有ロジックは `src/utils/`(投稿の取得・ソート・関連記事)と `src/lib/og/`(OG 画像生成)に集約。SEO(BaseHead の OG/canonical/JSON-LD)、OG 画像(ビルド時 satori+resvg)、全文検索(Pagefind)が横断的に乗る。記事は Notion から 10 分毎に自動同期、または手動で Markdown を追加し、Cloudflare Pages へデプロイ。

## セッション・ルーティン
- **出勤(開始時)**: この AGENTS.md と関連 docs を読み、`docs/HARNESS-LOG.md` で前回の状態を確認する。
- **退勤(終了時)**: 変更した構造/コマンド/規約を docs に反映し、`docs/HARNESS-LOG.md` に追記する。

<!-- 管理: このファイルは harness-docs スキルで生成/更新。CLAUDE.md は本ファイルへの symlink。
     型定義やインターフェースの説明は md でなくコード内コメントに書くこと。 -->
