# HARNESS-LOG

harness-docs が行ったドキュメント体系の生成・更新・削除・分割の記録。
同日でも**追記**する(上書きしない)。書式は harness-docs の `references/changelog-convention.md` 準拠。

## 2026-06-25 — INIT
- created : AGENTS.md — 入口(地図)を生成。コマンド/グローバル制約/docs 地図/セッションルーティンを収録
- created : docs/architecture.md — 全体構成マップ(層・依存方向・主要コンポーネント・データフロー)
- created : docs/api-pattern.md — frontmatter スキーマ・動的ルート・SEO/CSP の横断規約
- created : docs/HARNESS-LOG.md — 本ログ
- linked  : 既存 docs/ 17 ファイルを AGENTS.md から「人間向け詳細ガイド」としてトピックリンク(中身は不変更)
- linked  : CLAUDE.md -> AGENTS.md (相対 symlink)
- note    : MODE=INIT。既存 docs は人間向け詳細ガイドとして温存し、中核 docs はエージェント向けの簡潔な地図/規約に徹した。探索は code-explorer 3観点(structure/api/build)並列で実施。

## 2026-06-25 — PLAN
- created : docs/plans/2026-06-25-notion-image-sync-plan.md — Notion本文画像を同期時に `public/images/blog/<slug>/` へ保存し、Markdownを公開パスへ書き換える実装計画を追加
- note    : 現状の `image` ブロック未対応、GitHub Actions の差分検知拡張、検証項目、将来的な R2 / Cloudflare Images 移行余地を整理。

## 2026-06-25 — IMPLEMENT
- changed : scripts/notion-sync.mjs — Notion本文の `image.external.url` / `image.file.url` を保存し、Markdown画像パスへ変換する処理を追加
- changed : .github/workflows/notion-sync.yml — `public/images/blog` を差分検知と自動コミット対象に追加
- changed : docs/blog-operation-guide.md / NOTION_AUTOMATION_GUIDE.md / docs/api-pattern.md — 本文画像の保存先・HeroImageとの差分・削除非同期・容量注意を追記
- created : tests/notion-sync/image-block.test.mjs / tests/notion-sync/image-download.test.mjs / tests/config/notion-sync-workflow.test.mjs — 画像ブロック変換、dry-run、HTTP失敗、generic binary応答、同一ファイル再同期、workflowの画像commit対象を検証

## 2026-07-05 — PLAN
- created : docs/plans/2026-07-05-ui-redesign-directions.md — 現行UI診断と、Agentic Signal のリッチ化に向けた4つのデザイン方向案を追加
- created : docs/plans/2026-07-05-ui-redesign-directions-preview.html — 4つのデザイン方向をブラウザで比較できる静的HTMLプレビューを追加
- created : docs/plans/2026-07-05-signal-desk-blog-sample.html — A案を軸にB案の検索/分類とC案の画像ヒーローを混ぜたブログ完成イメージの静的HTMLサンプルを追加
- note    : 実装前の選定資料として、推奨案(Signal Desk)、代替案、実装フェーズ、検証観点を整理。

## 2026-07-07

- X post embed 機能を追加
  - `src/plugins/remark-x-embed.ts`：Markdown 中の単独行 X URL をビルド時にリッチカードへ変換
  - `astro.config.mjs`：`remarkXEmbed` を `remarkPlugins` の先頭に登録（`remark-link-card-plus` より前に実行する必要あり）
  - `src/styles/global.css`：`.x-embed-card` スタイル追加
  - 依存：`unist-util-visit`, `@types/mdast`, `@types/unist`
  - 注意：`publish.twitter.com/oembed` API から取得。失敗時はフォールバック表示。

## 2026-07-05 — PLAN (UX)
- created : docs/plans/2026-07-05-ux-improvement-plan.md — UI案に依存しない UX 改善の実装プラン（P0: モバイルナビ/トークン一本化/トップ情報量、P1: 追従目次/コードコピー/前後ナビ/一覧統一、P2: シェア/giscus/プログレスバー/クリーンアップ）
- note    : ライブサイトのスクショ調査 + コード調査に基づく。各タスクは独立して委任・コミット可能。CSP（calc-hash.mjs → public/_headers）の注意点と検証手順（astro check / build / 390px 確認）をタスク共通で明記。UI 3案の提案書は Claude Artifact として別途共有済み。

## 2026-07-06 — PLAN (Calm UI)
- created : docs/plans/2026-07-06-calm-ui-refresh-plan.md — 「生成りの紙」方向のUIリフレッシュ実装計画（トークン差し替え・本文17px/行間1.9・warm系コードテーマ・動きと影の減量）。ヘッダーの挙動/アニメーションは現状維持がユーザー指定
- note    : UI提案（生成りの紙/セージとミルク/墨と余白の3案 + 共通原則）は Claude Artifact で共有し、ユーザーが案1+共通原則を選択。デザイン値はプラン内で確定済みのため実装者の再判断は不要。
