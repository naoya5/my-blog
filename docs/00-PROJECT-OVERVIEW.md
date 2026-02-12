# プロジェクト概要 (00-PROJECT-OVERVIEW)

このドキュメントは、Astroを使用したモダンなブログプロジェクトの全体像、技術スタック、アーキテクチャ、および目標を定義します。

## 目次
- [1. プロジェクト概要](#1-プロジェクト概要)
- [2. 技術スタック](#2-技術スタック)
- [3. ディレクトリ構造](#3-ディレクトリ構造)
- [4. データフロー](#4-データフロー)
- [5. 主要機能](#5-主要機能)
- [6. パフォーマンス目標](#6-パフォーマンス目標)
- [7. ドキュメント構成](#7-ドキュメント構成)

---

## 1. プロジェクト概要
本プロジェクトは、Astro 5.xを基盤とした、高速でSEOに強いMarkdownベースのブログシステムを構築することを目的としています。

### 目的
- 開発者体験（DX）の向上：MarkdownとContent Collectionsによる型安全なコンテンツ管理。
- ユーザー体験（UX）の最大化：ゼロJavaScript（デフォルト）による圧倒的なページロード速度。
- 持続可能な運用：SSG（静的サイト生成）による低コストかつセキュアなホスティング。

### ターゲット指標
- Lighthouseスコア：全項目 95+
- Core Web Vitals：LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## 2. 技術スタック

### コア技術
| 技術 | バージョン | 用途 |
| :--- | :--- | :--- |
| Astro | 5.x | Webフレームワーク (SSG) |
| TypeScript | 5.7+ | 静的型付け |
| Tailwind CSS | 3.4+ | スタイリング |
| Content Collections | - | コンテンツ管理・バリデーション |
| Zod | - | スキーマ定義・バリデーション |
| pnpm | 9.x | パッケージマネージャー |

### デプロイ
| 技術 | 用途 |
| :--- | :--- |
| Cloudflare Pages | ホスティング・CDN |
| @astrojs/cloudflare | Cloudflareアダプター |

### 追加ライブラリ・プラグイン
| ライブラリ | 用途 |
| :--- | :--- |
| @astrojs/rss | RSSフィード生成 |
| @astrojs/sitemap | サイトマップ生成 |
| @tailwindcss/typography | 記事本文のスタイリング |
| reading-time | 読了時間の計算 |
| Pagefind | 静的サイト内検索 |
| Shiki + @shikijs/transformers | コードハイライト（行ハイライト、Diff対応） |
| rehype-slug | 見出しへのID付与 |
| rehype-autolink-headings | 見出しへのリンク付与 |
| remark-link-card-plus | URLをリッチなリンクカードに変換 |
| remark-github-blockquote-alert | GitHub風アラートブロック（NOTE, WARNING等） |

---

## 3. ディレクトリ構造

```text
voice/
├── public/
│   ├── favicon.svg
│   ├── robots.txt
│   └── images/default-og.jpg
├── src/
│   ├── assets/blog/          # 記事内画像
│   ├── components/
│   │   ├── layout/           # BaseHead, Header, Footer, ThemeToggle
│   │   ├── blog/             # BlogCard, TableOfContents, RelatedPosts, ReadingTime
│   │   └── ui/               # Tag, Pagination
│   ├── content/
│   │   ├── blog/*.md         # 記事データ
│   │   └── config.ts         # Content Collections スキーマ定義
│   ├── layouts/              # BaseLayout, BlogPostLayout
│   ├── pages/
│   │   ├── index.astro       # トップページ
│   │   ├── blog/
│   │   │   ├── index.astro   # 記事一覧
│   │   │   ├── [slug].astro  # 記事詳細
│   │   │   ├── tag/[tag].astro # タグ別一覧
│   │   │   └── page/[page].astro # ページネーション
│   │   ├── rss.xml.ts        # RSSフィード
│   │   └── 404.astro         # 404ページ
│   ├── styles/global.css     # グローバルスタイル
│   └── utils/                # getRelatedPosts, formatDate
├── docs/                     # プロジェクトドキュメント
├── astro.config.mjs          # Astro設定
├── tailwind.config.cjs       # Tailwind設定
├── tsconfig.json             # TypeScript設定
└── package.json
```

---

## 4. データフロー

Markdownファイルからページが生成されるまでのフローは以下の通りです。

```text
Markdown Files (src/content/blog/*.md)
      ↓
Content Collections (src/content/config.ts)
      ↓ [Zod Validation]
getCollection('blog') - 型安全なデータ取得
      ↓
Astro Pages (index, /blog/[slug])
      ↓ [Build Step]
Static HTML (dist/)
```

---

## 5. 主要機能

1.  **Markdownベースのコンテンツ管理**: Content Collectionsによる型安全なフロントマター管理。
2.  **高速な全文検索**: Pagefindを使用したクライアントサイド静的検索。
3.  **SEO最適化**: 自動サイトマップ生成、RSSフィード、JSON-LD、OGP画像の最適化。
4.  **高度な記事機能**: 読了時間計算、目次自動生成、関連記事表示。
5.  **レスポンシブデザイン**: Tailwind CSSによるモバイルファースト設計。
6.  **ダークモード対応**: システム設定および手動切り替えに対応したテーマ管理。
7.  **リンクカード**: URLを自動でリッチなOGPカードに変換。
8.  **アラートブロック**: GitHub風のNOTE、WARNING、TIP等の注意書きブロック。
9.  **高度なコードハイライト**: Shiki + Transformersによる行ハイライト、Diff表示対応。
10. **エッジデプロイ**: Cloudflare Pagesによる高速グローバル配信。

---

## 6. パフォーマンス目標

| 指標 | 目標値 |
| :--- | :--- |
| Lighthouse (Performance) | 95+ |
| Lighthouse (Accessibility) | 100 |
| Lighthouse (Best Practices) | 100 |
| Lighthouse (SEO) | 100 |
| LCP (Largest Contentful Paint) | 2.5s 以下 |
| FID (First Input Delay) | 100ms 以下 |
| CLS (Cumulative Layout Shift) | 0.1 以下 |

---

## 7. ドキュメント構成

1. **[セットアップガイド](./01-SETUP-GUIDE.md)** - 環境構築と初期設定（pnpm対応）
2. **[Content Collections](./02-CONTENT-COLLECTIONS.md)** - 型安全なコンテンツ管理
3. **[コンポーネント・レイアウト](./03-COMPONENTS-LAYOUTS.md)** - UI基盤の実装
4. **[ページ実装](./04-PAGES-IMPLEMENTATION.md)** - ルーティングとページ生成
5. **[SEO・パフォーマンス](./05-SEO-PERFORMANCE.md)** - 最適化手法・Cloudflareデプロイ
6. **[トラブルシューティング](./06-TROUBLESHOOTING.md)** - よくあるエラーと解決策
7. **[リソース](./07-RESOURCES.md)** - 公式ドキュメントとツール集
8. **[Markdownプラグイン](./08-MARKDOWN-PLUGINS.md)** - リンクカード・アラートブロック・Shiki設定

