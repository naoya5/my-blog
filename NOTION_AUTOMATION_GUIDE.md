# Notion 自動運用ガイド

このドキュメントは、現在の実装で「できること」と「設定方法」をまとめたものです。

## できるようになったこと

1. Notion 記事の自動取り込み
- `scripts/notion-sync.mjs` が Notion DB を読み取り、`src/content/blog/*.md` を生成します。
- 対象は `Status=Scheduled` かつ `PublishAt <= 現在時刻` のページです。

2. 定期同期と手動同期
- `.github/workflows/notion-sync.yml` で 10分ごとに自動同期します（`schedule`）。
- GitHub Actions から手動実行も可能です（`workflow_dispatch`）。

3. 変更があるときだけ自動コミット
- 同期後に `src/content/blog` 配下へ差分がある場合のみ、GitHub Actions が自動コミットします。

4. 既存デプロイへの自動接続
- 自動コミットが `main` に反映されると、既存の `deploy-content-to-cloudflare.yml` が動き、Cloudflare Pages に配信されます。

5. notion-sync 失敗時の Discord 通知
- `DISCORD_WEBHOOK_URL` が設定されている場合、`notion-sync` ジョブ失敗時に Discord へ通知します。
- 通知には Actions の実行URLが含まれます。

## 設定方法

## 1. GitHub Secrets を登録

`Settings > Secrets and variables > Actions` に以下を登録します。

- `NOTION_TOKEN`（必須）: Notion Integration Token
- `NOTION_DATABASE_ID`（必須）: Notion DB ID
- `DISCORD_WEBHOOK_URL`（任意）: 失敗通知用 Webhook URL

## 2. Notion 側の DB プロパティを作成

プロパティ名は以下に合わせてください。

- `Title` (title)
- `Slug` (rich_text)
- `Description` (rich_text)
- `Tags` (multi_select)
- `HeroImage` (url, 任意)
- `Status` (select: `Idea` / `Writing` / `Review` / `Scheduled` / `Published`)
- `Draft` (checkbox)
- `PublishAt` (date)

## 3. ローカル確認（任意）

```bash
NOTION_TOKEN=xxx NOTION_DATABASE_ID=xxx pnpm notion:sync:dry-run
NOTION_TOKEN=xxx NOTION_DATABASE_ID=xxx pnpm notion:sync
```

## 4. GitHub Actions を有効化

- `.github/workflows/notion-sync.yml` がデフォルトで有効です。
- 定期実行は 10分ごとです。
- 必要に応じて Actions 画面から手動実行できます。

## 運用フロー（実際の動き）

1. Notion で記事を作成し `Status=Scheduled` にする
2. `PublishAt` を設定する
3. スケジュール時刻になると自動同期される
4. 差分があれば自動コミット
5. 既存デプロイが動いて公開
6. 失敗時は Discord に通知

## 注意点

- `NOTION_TOKEN` / `NOTION_DATABASE_ID` 未設定だと同期は失敗します。
- `DISCORD_WEBHOOK_URL` は任意です。未設定なら通知はスキップされます。
- Cloudflare Pages の Git 連携と GitHub Actions デプロイを両方有効にすると二重デプロイになる可能性があります。
