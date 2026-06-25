# SEOとパフォーマンス最適化ガイド

このドキュメントでは、Astroを使用したブログにおけるSEO（検索エンジン最適化）のベストプラクティスと、パフォーマンスを最大化するための戦略について解説します。

## 目次

1. [SEO最適化の基礎](#seo最適化の基礎)
2. [メタタグ設定（OGP・Twitter Card）](#メタタグ設定ogp-twitter-card)
3. [Canonical URLの設定](#canonical-urlの設定)
4. [JSON-LD（構造化データ）の実装](#json-ld構造化データの実装)
5. [サイトマップとrobots.txt](#サイトマップとrobotstxt)
6. [Islands Architectureとハイドレーション戦略](#islands-architectureとハイドレーション戦略)
7. [画像最適化（astro:assets）](#画像最適化astroassets)
8. [View Transitions](#view-transitions)
9. [パフォーマンス監査とCore Web Vitals](#パフォーマンス監査とcore-web-vitals)
10. [Cloudflare Pagesへのデプロイ](#cloudflare-pagesへのデプロイ)
11. [関連ドキュメント](#11-関連ドキュメント)

---

## SEO最適化の基礎

SEO（Search Engine Optimization）は、検索エンジンからのトラフィックを増やし、コンテンツの視認性を高めるために不可欠です。Astroはデフォルトで「Zero JS」のアプローチを採用しており、高速なページロードとクローラビリティを提供するため、SEOにおいて非常に強力な基盤を持っています。

### 重要目標
- **インデックス精度の向上**: 正確なメタデータと構造化データを提供。
- **ユーザー体験の向上**: 高速な読み込みと直感的なナビゲーション。
- **ソーシャルシェアの最適化**: 魅力的なOGP画像と説明文の設定。

---

## メタタグ設定（OGP・Twitter Card）

ソーシャルメディアでの拡散性を高めるために、`BaseHead.astro`などの共通コンポーネントでメタタグを一括管理します。

### 実装例: BaseHead.astro

```astro
---
interface Props {
  title: string;
  description: string;
  image?: string;
  canonicalURL?: URL;
}

const { title, description, image = '/blog-placeholder-1.jpg', canonicalURL = new URL(Astro.url.pathname, Astro.site) } = Astro.props;
---

<!-- Global Metadata -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />

<!-- Primary Meta Tags -->
<title>{title}</title>
<meta name="title" content={title} />
<meta name="description" content={description} />

<!-- Canonical URL -->
<link rel="canonical" href={canonicalURL} />

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website" />
<meta property="og:url" content={Astro.url} />
<meta property="og:title" content={title} />
<meta property="og:description" content={description} />
<meta property="og:image" content={new URL(image, Astro.url)} />

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image" />
<meta property="twitter:url" content={Astro.url} />
<meta property="twitter:title" content={title} />
<meta property="twitter:description" content={description} />
<meta property="twitter:image" content={new URL(image, Astro.url)} />
```

> **注意点**: OGP画像の推奨サイズは **1200x630px** です。

---

## Canonical URLの設定

重複コンテンツ問題を避けるために、`rel="canonical"`タグを必ず設定します。Astroでは `Astro.url.pathname` を使用して、現在のページの正規URLを動的に生成できます。

```astro
<link rel="canonical" href={new URL(Astro.url.pathname, Astro.site)} />
```

---

## JSON-LD（構造化データ）の実装

検索結果にリッチリザルト（記事の公開日、著者、画像など）を表示させるために、JSON-LD形式の構造化データを挿入します。

### 実装例: ブログ記事用 JSON-LD

```astro
---
const { post } = Astro.props;
const schema = {
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": post.data.title,
  "description": post.data.description,
  "image": [new URL(post.data.heroImage, Astro.site).toString()],
  "datePublished": post.data.pubDate.toISOString(),
  "author": [
    {
      "@type": "Person",
      "name": "著者名",
      "url": "https://example.com/about"
    }
  ]
};
---

<script type="application/ld+json" set:html={JSON.stringify(schema)} />
```

---

## サイトマップとrobots.txt

### サイトマップ生成
`@astrojs/sitemap` インテグレーションを使用して、ビルド時に自動的に `sitemap-index.xml` を生成します。

**設定方法 (`astro.config.mjs`):**
```javascript
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://example.com',
  integrations: [sitemap()],
});
```

### robots.txt の作成
`public/robots.txt` を作成し、クローラーにサイトマップの場所を伝えます。

```text
User-agent: *
Allow: /

Sitemap: https://example.com/sitemap-index.xml
```

---

## Islands Architectureとハイドレーション戦略

Astroの最大の特徴は **Islands Architecture** です。ページ全体を静的なHTMLとして出力し、インタラクティブな部分（島）だけをJavaScriptで動かします。

### ハイドレーション戦略（Client Directives）比較表

| ディレクティブ | 動作タイミング | 主なユースケース |
| :--- | :--- | :--- |
| `client:load` | ページロード後すぐにJSを読み込み・実行 | 即座に操作が必要なUI（ナビゲーション等） |
| `client:idle` | ブラウザのアイドル状態（優先度の低い処理完了後） | 優先度の低いUI（チャットツール等） |
| `client:visible` | コンポーネントがビューポートに入った時 | ページ下部の重いコンポーネント（コメント欄等） |
| `client:media` | 特定のメディアクエリに一致した時 | モバイル専用のメニュー等 |
| `client:only` | クライアントサイドでのみレンダリング | ブラウザAPIに依存するコンポーネント |

---

## 画像最適化（astro:assets）

Astroの組み込みコンポーネント `<Image />` を使用すると、画像の自動リサイズ、フォーマット変換（WebP等）、Lazy Loadingが適用されます。

### 実装例

```astro
---
import { Image } from 'astro:assets';
import myImage from '../assets/hero.png';
---

<Image 
  src={myImage} 
  alt="説明文" 
  width={800} 
  height={450}
  format="webp"
  quality="mid"
/>
```

---

## View Transitions

Astro 3.0から導入された **View Transitions API** を使用すると、SPAのような滑らかなページ遷移を簡単に実装できます。これはユーザー体験（UX）を向上させ、滞在時間の増加に寄与します。

### 実装例 (`BaseLayout.astro`)

```astro
---
import { ViewTransitions } from 'astro:transitions';
---
<head>
  <!-- ...他のメタタグ -->
  <ViewTransitions />
</head>
```

---

## パフォーマンス監査とCore Web Vitals

### Lighthouse監査の実行
1. Chrome DevToolsを開く（F12）。
2. 「Lighthouse」タブを選択。
3. 「Analyze page load」をクリックしてレポートを生成。
4. **目標スコア: 95+**

### Core Web Vitalsの改善指標
Googleが重視する3つの指標を最適化します。

- **LCP (Largest Contentful Paint)**: 最大視覚要素の表示時間。
  - 改善策: 画像の最適化、サーバー応答時間の短縮。
  - **目標: 2.5秒未満**
- **FID (First Input Delay)**: 初回入力遅延。
  - 改善策: メインスレッドをブロックするJavaScriptの削減。
  - **目標: 100ms未満**
- **CLS (Cumulative Layout Shift)**: 視覚的な安定性。
  - 改善策: 画像や広告のサイズ（width/height）を明示。
  - **目標: 0.1未満**

---

## Cloudflare Pagesへのデプロイ

本プロジェクトでは、Cloudflare Pagesをデプロイ先として推奨しています。

### なぜCloudflare Pagesか？

| 項目 | Cloudflare Pages | Vercel | Netlify |
| :--- | :--- | :--- | :--- |
| **無料帯域幅** | **無制限** ⭐ | 100GB/月 | 100GB/月 |
| **エッジ拠点** | **330+** ⭐ | グローバル | グローバル |
| **ビルド回数** | 500回/月 | 6,000分/月 | 300分/月 |
| **価格** | **最安** | 高め | 中程度 |

### デプロイ方法

#### 方法1: Wrangler CLI（推奨）

```bash
# 初回セットアップ
pnpm add -D wrangler

# wrangler.jsoncを作成（01-SETUP-GUIDE参照）

# ビルド＆デプロイ
pnpm build && wrangler pages deploy ./dist
```

初回実行時にCloudflareアカウントへのログインが求められます。

#### 方法2: Git統合

1. GitHubにリポジトリをプッシュ
2. [Cloudflareダッシュボード](https://dash.cloudflare.com/) にログイン
3. **Workers & Pages** → **Create** → **Pages** タブ
4. GitHubリポジトリを接続
5. ビルド設定:
   - **Framework preset**: `Astro`
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
6. **Save and Deploy**

以降、`main`ブランチへのプッシュで自動デプロイされます。

### カスタムドメインの設定

1. Cloudflareダッシュボードで対象のPagesプロジェクトを開く
2. **Custom domains** タブを選択
3. **Set up a custom domain** をクリック
4. ドメイン名を入力（例: `blog.example.com`）
5. DNSレコードが自動設定される（Cloudflare DNSを使用している場合）

### 環境変数の設定

```bash
# Wrangler CLIで設定
wrangler pages secret put API_KEY

# または Cloudflareダッシュボードで設定
# Settings → Environment variables
```

### プレビューデプロイ

Git統合を使用している場合、PRごとに自動でプレビューURLが生成されます。

```
https://<commit-hash>.<project-name>.pages.dev
```

---

## 11. 関連ドキュメント

- [← ページ実装](./04-PAGES-IMPLEMENTATION.md)
- [トラブルシューティング →](./06-TROUBLESHOOTING.md)
- [セットアップガイド](./01-SETUP-GUIDE.md) - Cloudflareアダプター設定
- [コンポーネント・レイアウト](./03-COMPONENTS-LAYOUTS.md) - BaseHeadコンポーネントの基礎
- [Astro Images Guide](https://docs.astro.build/en/guides/images/)
- [Cloudflare Pages公式ドキュメント](https://developers.cloudflare.com/pages/)
- [@astrojs/cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare/)

