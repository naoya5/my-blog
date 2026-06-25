# ブログ運用ガイド

## 全体構成

```
Notion (記事管理)
  ↓ 10分おきに自動同期 (GitHub Actions)
GitHub リポジトリ (main ブランチ)
  ↓ 同期後に自動トリガー (workflow_dispatch)
Cloudflare Pages (本番デプロイ)
```

## 記事の公開方法

### 1. Notionで記事を作成

データベースに新しいページを作成し、以下のプロパティを設定する。

| プロパティ | 型 | 説明 |
|---|---|---|
| Title | タイトル | 記事タイトル |
| Slug | テキスト | URLスラッグ（空欄ならタイトルから自動生成） |
| Description | テキスト | 記事の概要 |
| Tags | マルチセレクト | タグ |
| HeroImage | URL | アイキャッチ画像のURL（任意） |
| Status | セレクト | **`Scheduled`** に設定する |
| PublishAt | 日付 | 公開日時（この日時を過ぎると同期対象になる） |
| Draft | チェックボックス | チェックなし = 公開 / チェックあり = 下書き |

### 2. 自動公開の流れ

1. `PublishAt` の日時が来ると、次の10分間隔の同期で記事が検出される
2. GitHub Actions が `src/content/blog/{slug}.md` をコミット & プッシュ
3. 自動的に Cloudflare Pages へデプロイが走る
4. 数十秒後にブログに記事が反映される

### 3. 即時公開したい場合

GitHub Actions の「Sync Scheduled Posts from Notion」を手動実行する。

1. GitHub リポジトリ → Actions タブ
2. 「Sync Scheduled Posts from Notion」を選択
3. 「Run workflow」をクリック

## 記事の削除方法

現在の同期スクリプトは **新規追加のみ対応** しており、削除の同期はされない。

1. Notion 側で記事を削除 or Status を変更
2. GitHub 側で `src/content/blog/{slug}.md` を手動で削除してコミット & プッシュ

## 注意事項

### 同期の対象条件

以下の **すべて** を満たす記事のみ同期される。

- Status が `Scheduled`
- PublishAt が現在時刻以前
- Title と Slug（or タイトルからの自動生成）が存在する

### 既存記事の更新について

- 一度同期された記事の **内容変更やdraft値の変更は再同期されない**
- 既存記事を更新したい場合は、GitHub 側で直接編集する

### デプロイのトリガー

デプロイは以下のいずれかで実行される。

| トリガー | 条件 |
|---|---|
| Notion同期後 | コンテンツに変更があった場合、workflow_dispatch で自動起動 |
| mainへの手動push | `src/content/blog/**/*.md` に変更があった場合 |
| 手動実行 | Actions タブから「Deploy Blog Content to Cloudflare Pages」を実行 |

### 失敗時の通知

Notion同期が失敗した場合、Discord Webhook に通知が送られる（`DISCORD_WEBHOOK_URL` が設定されている場合）。

## 必要な GitHub Secrets

| Secret名 | 用途 |
|---|---|
| `NOTION_TOKEN` | Notion API トークン |
| `NOTION_DATABASE_ID` | Notion データベース ID |
| `NOTION_DATA_SOURCE_ID` | Notion データソース ID（任意） |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API トークン |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare アカウント ID |
| `DISCORD_WEBHOOK_URL` | Discord 通知用 Webhook URL（任意） |
