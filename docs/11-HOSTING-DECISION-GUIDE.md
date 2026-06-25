# Hosting Decision Guide (Cost + GitHub運用)

最終更新: 2026-02-16

このガイドは、次の2点を同時に満たすための意思決定資料です。

- 記事画像をローカル/外部URLの両方で運用する
- デプロイ先を「運用コスト最小 + GitHub管理しやすさ」で選ぶ

---

## 1. 結論（このリポジトリの推奨）

### 推奨1位: Cloudflare Pages

- 理由:
  - 静的配信のリクエスト/帯域が無料で扱いやすい（Pages Free）
  - GitHub連携でpush時デプロイとプレビューが可能
  - 既存構成（`wrangler pages deploy ./dist`）と整合
- 使いどころ:
  - 静的ブログを低コストで長期運用したい
  - 将来 Functions/SSR を使う可能性がある

### 推奨2位: GitHub Pages

- 理由:
  - 完全にGitHub中心で運用できる
  - 無料で始めやすい
- 注意:
  - 推奨ソフト制限（100GB/月、1GB上限など）がある
  - プレビュー環境はCloudflare/Vercel/Netlifyほど標準化されていない

### 3位: Vercel Hobby

- 理由:
  - GitHub連携とプレビューが非常に強い
  - 小規模なら無料枠で十分
- 注意:
  - Hobby は無料枠に収まる前提の運用。超過時は上位プラン検討が必要

### 4位: Netlify Free

- 理由:
  - GitHub連携とDeploy Previewが使いやすい
- 注意:
  - クレジット制のため、配信量 + 本番デプロイ頻度で無料枠を超えやすい
  - 超過運用は最小でも有料アドオン（500 credits / $55）が必要

---

## 2. 記事画像の運用ルール

### Frontmatterで使える形式

- ローカル画像:
  - `heroImage: "./images/hero.jpg"`
- 外部URL画像:
  - `heroImage: "https://images.unsplash.com/photo-..."`

### 安全運用ルール

- 外部URLは `https://` のみ許可
- 画像ホストは `astro.config.mjs` の `image.domains` で許可リスト管理
- 著作権・利用規約を確認してから公開

### 実装上の注意

- 外部URL画像は `image.domains` に未登録だと最適化/表示に失敗する
- 画像URLは `og:image` / `twitter:image` / JSON-LD に反映されるため、公開前に実URLを確認する

---

## 3. デプロイ先比較（コスト + GitHub管理）

| サービス | GitHub連携 | 無料枠の要点 | 無料枠超過時 | このブログとの相性 |
| --- | --- | --- | --- | --- |
| Cloudflare Pages | GitHub連携あり、コミットごとにPreview可能 | Freeで月500ビルド、静的アセット配信は無料 | 静的配信は無料のまま。Functionsを使うとWorkers枠で管理 | 最良（現構成と一致） |
| GitHub Pages | GitHubネイティブ | 公開サイト無料（公開リポジトリ）、推奨ソフト制限あり | 制限超過は非推奨。設計見直しが必要 | 良（シンプル運用向き） |
| Vercel Hobby | Git連携と自動Previewが強い | Hobby $0、Fast Data Transfer 100GB、Build Execution 100時間 | Hobbyは無料枠前提、超過時は有料プラン検討 | 良（将来SSR/APIにも相性） |
| Netlify Free | GitHub App連携、Deploy Preview | 300 credits/月（帯域 10 credits/GB、本番デプロイ 15 credits/回） | 500 credits / $55 の追加購入が最小単位 | 中（デプロイ頻度が高いと不利） |

---

## 4. 小規模運用の料金試算（前提: 1万PV / 20GB転送 / 月）

### 共通前提

- 静的ブログ運用（SSR/Functionsは常時利用しない）
- 本番デプロイ回数は月4回と月8回の2ケースを見る

### 試算結果

| サービス | 月4回デプロイ | 月8回デプロイ | コメント |
| --- | --- | --- | --- |
| Cloudflare Pages | $0 | $0 | Pages Free（500 builds/月）内。静的配信は無料 |
| GitHub Pages | $0 | $0 | ソフト制限内なら無料運用可能 |
| Vercel Hobby | $0 | $0 | 20GBは100GB枠内、ビルド時間も通常は枠内 |
| Netlify Free | $0（260 credits） | 有料化ライン（320 credits） | 20GBで200 credits使用。月8回だと無料枠300を超過 |

### Netlifyの閾値メモ

- 20GB転送時点で 200 credits 消費
- 残り100 credits なので、本番デプロイは最大6回（6 x 15 = 90 credits）まで無料枠内

---

## 5. 選定フロー（このプロジェクト向け）

1. `Cloudflare Pages` を第一候補に採用
2. GitHub連携で main push デプロイ + PR preview を有効化
3. 画像の外部ドメインを `image.domains` で管理
4. もし将来 Functions/SSR を増やすなら Workers Paid（$5/月）開始ラインを評価
5. GitHubだけで完結したい場合のみ GitHub Pages を代替候補として採用

---

## 6. 監視すべき運用KPI

- 月間ビルド回数
- 月間転送量
- 本番デプロイ回数
- 画像外部ドメインの増加数（`image.domains` の管理コスト）

---

## 7. 一次情報ソース

- Cloudflare Pages limits:
  - https://developers.cloudflare.com/pages/platform/limits/
- Cloudflare Pages Git integration:
  - https://developers.cloudflare.com/pages/configuration/git-integration/
- Cloudflare Workers pricing:
  - https://developers.cloudflare.com/workers/platform/pricing/
- Netlify pricing:
  - https://www.netlify.com/pricing/
- Netlify credits details:
  - https://answers.netlify.com/t/how-netlify-credits-work/138984
- Netlify Deploy Preview:
  - https://docs.netlify.com/deploy/deploy-overview/#deploy-preview-controls
- Vercel pricing:
  - https://vercel.com/pricing
- Vercel limits:
  - https://vercel.com/docs/limits
- Vercel for GitHub:
  - https://vercel.com/docs/deployments/git/vercel-for-github
- GitHub Free plan pricing:
  - https://github.com/pricing
- GitHub Pages limits:
  - https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits
- About GitHub Pages (public repositories):
  - https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
- Astro `image.domains`:
  - https://docs.astro.build/en/reference/configuration-reference/#imagedomains
