# 10. ブログ執筆から反映までの運用フロー

このドキュメントは、`src/content/blog/` に記事を追加してサイトへ反映するまでの実務手順をまとめたものです。  
今回追加したサンプル記事（LangChain DeepAgent）を例として、同じ流れで次の記事も公開できます。

- サンプル記事: `src/content/blog/langchain-deepagent-practical-guide.md`
- 対象サイト: Astro + Content Collections 構成

## 1. 記事ファイルを作成する

### 1-1. ファイル名（= slug）を決める

`src/content/blog/` 配下に、URLとして使いたい slug 名で Markdown ファイルを作成します。

例:

```bash
touch src/content/blog/langchain-deepagent-practical-guide.md
```

この場合、記事URLは `/blog/langchain-deepagent-practical-guide/` になります。

### 1-2. frontmatter を記述する

`src/content/config.ts` のスキーマに合わせて frontmatter を書きます。

```md
---
title: "LangChain DeepAgent実践ガイド: 単発LLMから継続実行エージェントへ"
description: "LangChainのDeepAgentを題材に、アーキテクチャ、状態管理、ツール実行、評価設計、運用までを長文で整理した実践ノート。"
pubDate: "2026-02-16"
updatedDate: "2026-02-16"
heroImage: "https://images.unsplash.com/photo-..."
tags: ["langchain", "deepagent", "agent", "llm", "python"]
draft: false
---
```

必須項目:

- `title`
- `description`
- `pubDate`

よく使う運用項目:

- `updatedDate`: 更新日を記録
- `heroImage`: アイキャッチ画像（`./images/hero.jpg` または `https://...`）
- `tags`: タグ一覧・関連記事に利用
- `draft`: 下書き公開制御（`true` なら本番で除外）

外部URL画像を使う場合は、`astro.config.mjs` の `image.domains` に対象ドメインを追加してください。

## 2. 本文を書く

本文は通常の Markdown で記述できます。  
このブログでは以下を使えます。

- 見出し (`##`, `###`) による目次生成
- コードブロック（Shiki ハイライト）
- GitHub風アラート (`> [!TIP]` など)
- リンクカード（`remark-link-card-plus`）

長文記事での推奨構成:

1. 背景と課題
2. 設計の基本方針
3. 実装詳細
4. 評価・運用
5. まとめ

## 3. ローカルで表示確認する

開発サーバーを起動して、追加した記事ページを確認します。

```bash
pnpm dev
```

確認ポイント:

- `/blog` の一覧に記事が表示される
- `/blog/<slug>/` の詳細ページが表示される
- タグページ（`/blog/tag/<tag>/`）に反映される
- 目次・読了時間・関連記事が崩れていない
- OGP画像（`og:image` / `twitter:image`）が想定URLになっている

## 4. 本番相当のビルド検証を行う

公開前に本番ビルドを実行します。

```bash
pnpm build
```

このコマンドで以下をまとめて実施します。

- 型チェック (`astro check`)
- 静的ビルド (`astro build`)
- 検索インデックス生成 (`pagefind --site dist`)

エラーが出た場合は frontmatter 型や Markdown 記法、リンク切れを優先して確認します。

## 5. 反映（デプロイ）する

Cloudflare Pages へ反映します。

```bash
pnpm deploy
```

運用の基本は次の順序です。

1. `pnpm build` で事前検証
2. 問題なければ `pnpm deploy` で本番反映

## 6. Git運用（推奨）

記事追加時は、記事ファイルとドキュメント更新を同時コミットすると履歴が追いやすくなります。

```bash
git add src/content/blog/langchain-deepagent-practical-guide.md docs/10-BLOG-WRITING-WORKFLOW.md README.md
git commit -m "Add DeepAgent long-form sample post and publishing workflow doc"
```

## 7. 公開チェックリスト

- [ ] `draft: false` になっている
- [ ] `title` と `description` がSEO的に明確
- [ ] `heroImage` の表示とURL有効性を確認（設定した場合）
- [ ] 画像の利用ライセンス/出典を確認
- [ ] タグが適切（増やしすぎない）
- [ ] `pnpm build` が成功
- [ ] `/blog` と記事詳細ページを最終確認

---

以上で、記事作成からサイト反映までの一連フローは完了です。  
次回以降は `src/content/blog/` に同じ形式で Markdown を追加するだけで、同じ運用を再利用できます。
