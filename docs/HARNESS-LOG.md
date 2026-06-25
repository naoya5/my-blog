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
