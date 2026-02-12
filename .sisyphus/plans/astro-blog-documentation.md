# Astroブログドキュメント作成プラン

## Context

### Original Request
ユーザーがAstroを使用してMarkdownベースのCMSでコンテンツを配信するブログを作成したいと要望。調査を実施し、詳細な実装プランを策定済み。ユーザーは学習目的で自分で実装したいため、収集したすべての情報を適切な粒度のドキュメントとして書き込むことを希望。

### Interview Summary
**収集した情報**:
1. **Astro公式ドキュメント調査** (Librarian Agent):
   - Content Collections API（Zodスキーマバリデーション、型安全性）
   - 静的サイト生成とgetStaticPaths()
   - RSSフィード生成（@astrojs/rss）
   - Shikiシンタックスハイライト（200以上の言語対応）
   - 画像最適化（astro:assets、自動WebP/AVIF変換）

2. **CMS統合・実例調査** (Librarian Agent):
   - Content Collections vs 従来のMarkdown処理（5倍高速ビルド）
   - MDXサポートの利点とセットアップ
   - 人気テンプレート（Blogster 654⭐、Charca 496⭐）
   - ヘッドレスCMS統合オプション
   - remark/rehypeプラグイン活用法
   - SEO最適化とサイトマップ生成
   - パフォーマンスベストプラクティス（60% Core Web Vitals "Good"達成）

3. **詳細実装プラン** (Plan Agent):
   - 完全なプロジェクト構造定義
   - 設定ファイル（astro.config.mjs、tailwind.config.cjs、tsconfig.json、package.json）
   - Content Collections schema（Zod）
   - コンポーネント実装例（BaseLayout、BlogCard、ThemeToggle、TableOfContents等）
   - ページ実装例（トップ、一覧、詳細、RSS、タグ別、ページネーション）
   - 10フェーズの実装ステップ（各フェーズにcategory + skills推奨）
   - テスト・検証チェックリスト
   - 推定作業時間（16-18時間）

**ユーザーの意図**:
- 学習目的で自分で実装する
- 公式ドキュメントを参照しながら開発を進めたい
- 収集した情報を体系的に整理したリファレンスドキュメントが必要

---

## Work Objectives

### Core Objective
収集したAstroブログに関する包括的な情報（公式ドキュメント、実装プラン、ベストプラクティス）を、ユーザーが実装時に参照しやすい体系的なドキュメントとして作成する。

### Concrete Deliverables
以下の8つのMarkdownドキュメントを`docs/`ディレクトリに作成:
1. `00-PROJECT-OVERVIEW.md` - プロジェクト概要、アーキテクチャ、技術スタック
2. `01-SETUP-GUIDE.md` - 環境構築、初期セットアップ手順
3. `02-CONTENT-COLLECTIONS.md` - Content Collections実装詳細
4. `03-COMPONENTS-LAYOUTS.md` - コンポーネント・レイアウト実装
5. `04-PAGES-IMPLEMENTATION.md` - ページ実装（一覧、詳細、RSS）
6. `05-SEO-PERFORMANCE.md` - SEO最適化、パフォーマンス改善
7. `06-TROUBLESHOOTING.md` - よくあるエラーと解決方法
8. `07-RESOURCES.md` - 公式リンク、参考リソース集

### Definition of Done
- [x] 8つのドキュメントがすべて作成されている
- [x] 各ドキュメントに適切な粒度で情報が整理されている
- [x] コードサンプルが実行可能な状態で記載されている
- [x] 公式ドキュメントへのリンクが正確に記載されている
- [x] ドキュメント間の相互参照が適切に設定されている
- [x] 目次（TOC）が各ドキュメントに含まれている
- [x] ユーザーが実装時に迷わず進められる構成になっている

### Must Have
- **実行可能なコードサンプル**: すべてのコード例は実際に動作するもの
- **公式ドキュメント参照**: 各セクションに公式ドキュメントURLを明記
- **段階的な説明**: 初心者でも理解できるステップバイステップの説明
- **エラー対処法**: よくあるエラーと解決方法を含める
- **ベストプラクティス**: 公式推奨の実装方法を強調

### Must NOT Have (Guardrails)
- **不正確な情報**: 推測や古い情報を含めない（公式ドキュメントベースのみ）
- **過度な抽象化**: 具体的なコード例なしの概念説明のみ
- **実装の強制**: 特定の実装方法を押し付けない（選択肢を提示）
- **重複コンテンツ**: 同じ情報を複数のドキュメントに記載しない
- **不完全なコード**: 動作しないコードサンプルを含めない

---

## Verification Strategy

### Manual Verification (ドキュメント作成後)

**ドキュメント品質チェック:**
- [x] 各ドキュメントを読んで、流れが自然か確認
- [x] コードサンプルをコピー＆ペーストして動作確認
- [x] 公式ドキュメントリンクをすべてクリックして有効性確認
- [x] 目次から各セクションへのリンクが機能するか確認
- [x] Markdownシンタックスが正しくレンダリングされるか確認

**証拠**:
- 各ドキュメントのMarkdownプレビュー（VSCode/GitHub）
- リンク切れチェック結果
- コードサンプルの実行結果（スクリーンショットまたはログ）

---

## Task Flow

```
Task 1: docs/ディレクトリ作成
  ↓
Task 2: 00-PROJECT-OVERVIEW.md 作成
  ↓
Task 3: 01-SETUP-GUIDE.md 作成
  ↓
Task 4: 02-CONTENT-COLLECTIONS.md 作成
  ↓
Task 5: 03-COMPONENTS-LAYOUTS.md 作成
  ↓
Task 6: 04-PAGES-IMPLEMENTATION.md 作成
  ↓
Task 7: 05-SEO-PERFORMANCE.md 作成
  ↓
Task 8: 06-TROUBLESHOOTING.md 作成
  ↓
Task 9: 07-RESOURCES.md 作成
  ↓
Task 10: 全ドキュメントの相互参照リンク追加
  ↓
Task 11: 最終レビュー＆品質チェック
```

## Parallelization

すべてのタスクは順次実行（各ドキュメントが前のドキュメントを参照する可能性があるため）。

---

## TODOs

### Task 1: docs/ディレクトリ作成

**What to do**:
- プロジェクトルートに`docs/`ディレクトリを作成
- `.gitkeep`または`README.md`を配置して空ディレクトリを避ける

**Must NOT do**:
- 他の場所（例: `documentation/`）に作成しない

**Parallelizable**: NO（最初のタスク）

**References**:
なし（基本的なディレクトリ作成）

**Acceptance Criteria**:
- [x] `docs/`ディレクトリが存在する
- [x] コマンド: `ls -la docs/` → ディレクトリが表示される

**Commit**: NO（次のタスクとまとめる）

---

### Task 2: 00-PROJECT-OVERVIEW.md 作成

**What to do**:
- プロジェクトの概要、目的、技術スタックを記載
- ディレクトリ構造の全体像を図示
- アーキテクチャ概要（Content Collections → ページ生成のフロー）
- データフロー図
- 主要機能の説明
- パフォーマンス目標（Lighthouse 95+、Core Web Vitals）
- デプロイ戦略
- プロジェクト目標（短期・中期・長期）

**Must NOT do**:
- 実装の詳細を含めない（他のドキュメントへの参照のみ）
- 個人的な意見を含めない（公式ドキュメントベースのみ）

**Parallelizable**: NO（他のドキュメントの基礎）

**References**:
- Plan Agentの実装プラン: プロジェクト構造、技術スタック、10フェーズの概要
- Librarian調査結果: パフォーマンスデータ（60% Core Web Vitals "Good"）

**Acceptance Criteria**:
- [x] 技術スタック一覧表が含まれている
- [x] ディレクトリ構造が完全に記載されている
- [x] データフロー図（テキストベース）が含まれている
- [x] 他の7つのドキュメントへのリンクが含まれている
- [x] Markdown: `cat docs/00-PROJECT-OVERVIEW.md` → 内容が表示される

**Commit**: YES
- Message: `docs: add project overview and architecture documentation`
- Files: `docs/00-PROJECT-OVERVIEW.md`
- Pre-commit: なし

---

### Task 3: 01-SETUP-GUIDE.md 作成

**What to do**:
- Astroプロジェクトの初期セットアップ手順
- 必要な依存関係のインストール
- 設定ファイルの作成（astro.config.mjs、tailwind.config.cjs、tsconfig.json、package.json）
- 開発サーバーの起動方法
- ビルド＆プレビューコマンド
- 推奨VSCode拡張機能
- トラブルシューティング（セットアップ時のよくあるエラー）

**Must NOT do**:
- Content Collections以降の実装詳細を含めない（次のドキュメントへ誘導）
- 古いバージョンの手順を含めない（Astro 5.x前提）

**Parallelizable**: NO（Task 2に依存）

**References**:
- **Pattern References**:
  - Plan Agentの実装プラン: Phase 1（プロジェクト初期化）の詳細手順
  - 設定ファイル例: `astro.config.mjs`、`tailwind.config.cjs`、`tsconfig.json`、`package.json`

- **External References**:
  - 公式ドキュメント: https://docs.astro.build/en/install/auto/
  - 公式ドキュメント: https://docs.astro.build/en/guides/integrations-guide/tailwind/

**Acceptance Criteria**:
- [x] `npm create astro@latest`から始まる完全な手順が記載されている
- [x] すべての設定ファイルの内容が含まれている
- [x] 開発サーバー起動コマンド（`npm run dev`）が記載されている
- [x] 公式ドキュメントへのリンクが最低3つ含まれている
- [x] Markdown: `grep "npm create astro" docs/01-SETUP-GUIDE.md` → マッチする

**Commit**: YES
- Message: `docs: add setup and environment configuration guide`
- Files: `docs/01-SETUP-GUIDE.md`
- Pre-commit: なし

---

### Task 4: 02-CONTENT-COLLECTIONS.md 作成

**What to do**:
- Content Collectionsの概要と利点
- `src/content/config.ts`の設定方法
- Zodスキーマの定義（frontmatterバリデーション）
- Markdownファイルの作成方法（frontmatter例）
- `getCollection()`と`render()`の使用方法
- 画像の扱い方（`image()`ヘルパー）
- ドラフト機能の実装
- Content Collections vs 従来のMarkdown処理の比較

**Must NOT do**:
- ページ実装の詳細を含めない（Task 6で扱う）
- MDX設定の詳細を含めない（必要なら別ドキュメント）

**Parallelizable**: NO（Task 3に依存）

**References**:
- **Pattern References**:
  - Plan Agentの実装プラン: `src/content/config.ts`の完全な実装例
  - サンプルMarkdownファイル例

- **External References**:
  - 公式ドキュメント: https://docs.astro.build/en/guides/content-collections/
  - 公式ドキュメント: https://docs.astro.build/en/guides/content-collections/#defining-the-collection-schema
  - 公式ドキュメント: https://docs.astro.build/en/guides/content-collections/#using-content-in-astro-templates

**Acceptance Criteria**:
- [x] Zodスキーマの完全な例が含まれている
- [x] frontmatterの例が含まれている
- [x] `getCollection()`のコード例が含まれている
- [x] 公式ドキュメントリンクが最低4つ含まれている
- [x] Markdown: `grep "defineCollection" docs/02-CONTENT-COLLECTIONS.md` → マッチする

**Commit**: YES
- Message: `docs: add Content Collections implementation guide`
- Files: `docs/02-CONTENT-COLLECTIONS.md`
- Pre-commit: なし

---

### Task 5: 03-COMPONENTS-LAYOUTS.md 作成

**What to do**:
- ディレクトリ構造（`src/components/`、`src/layouts/`）
- BaseLayoutの実装（`<slot />`の使用）
- BaseHeadコンポーネント（SEO、メタタグ）
- Header/Footerコンポーネント
- ThemeToggleコンポーネント（ダークモード）
- BlogCardコンポーネント（記事カード）
- ReadingTimeコンポーネント（reading-time使用）
- Tagコンポーネント
- TableOfContentsコンポーネント
- Tailwind CSSのカスタマイズ（global.css）
- コンポーネント間のPropsの型定義

**Must NOT do**:
- ページ実装（Task 6）を含めない
- 状態管理（不要）を含めない

**Parallelizable**: NO（Task 4に依存）

**References**:
- **Pattern References**:
  - Plan Agentの実装プラン: 各コンポーネントの完全な実装例
    - `src/layouts/BaseLayout.astro`
    - `src/components/layout/BaseHead.astro`
    - `src/components/layout/Header.astro`
    - `src/components/layout/ThemeToggle.astro`
    - `src/components/blog/BlogCard.astro`
    - `src/components/blog/ReadingTime.astro`
    - `src/components/ui/Tag.astro`
    - `src/components/blog/TableOfContents.astro`
  - `src/styles/global.css`の例

- **External References**:
  - 公式ドキュメント: https://docs.astro.build/en/core-concepts/astro-components/
  - 公式ドキュメント: https://docs.astro.build/en/core-concepts/layouts/
  - Tailwind Typography: https://tailwindcss.com/docs/typography-plugin

**Acceptance Criteria**:
- [x] BaseLayoutの完全なコード例が含まれている
- [x] ThemeToggleのJavaScript実装が含まれている
- [x] すべてのコンポーネントに型定義（`interface Props`）が含まれている
- [x] Tailwind CSSのカスタマイズ例が含まれている
- [x] 公式ドキュメントリンクが最低5つ含まれている
- [x] Markdown: `grep "<slot />" docs/03-COMPONENTS-LAYOUTS.md` → マッチする

**Commit**: YES
- Message: `docs: add components and layouts implementation guide`
- Files: `docs/03-COMPONENTS-LAYOUTS.md`
- Pre-commit: なし

---

### Task 6: 04-PAGES-IMPLEMENTATION.md 作成

**What to do**:
- ページルーティングの基礎
- トップページ（`src/pages/index.astro`）の実装
- ブログ一覧ページ（`src/pages/blog/index.astro`）
- ブログ詳細ページ（`src/pages/blog/[slug].astro`）
- `getStaticPaths()`の使用方法
- `render()`と`<Content />`コンポーネント
- タグ別一覧ページ（`src/pages/blog/tag/[tag].astro`）
- ページネーション（`src/pages/blog/page/[page].astro`）
- RSSフィード（`src/pages/rss.xml.ts`）
- 404ページ
- Pagefind検索統合

**Must NOT do**:
- コンポーネントの実装詳細（Task 5で扱った）
- SEO詳細（Task 7で扱う）

**Parallelizable**: NO（Task 5に依存）

**References**:
- **Pattern References**:
  - Plan Agentの実装プラン:
    - `src/pages/index.astro`（トップページ）
    - `src/pages/blog/index.astro`（一覧）
    - `src/pages/blog/[slug].astro`（詳細）
    - `src/pages/rss.xml.ts`（RSS）
    - ページネーション実装例
  - Pagefind統合手順

- **External References**:
  - 公式ドキュメント: https://docs.astro.build/en/guides/routing/
  - 公式ドキュメント: https://docs.astro.build/en/guides/content-collections/#building-for-static-output-default
  - 公式ドキュメント: https://docs.astro.build/en/recipes/rss/
  - Pagefind: https://pagefind.app/docs/

**Acceptance Criteria**:
- [x] `getStaticPaths()`の完全な例が含まれている
- [x] `render()`と`<Content />`の使用例が含まれている
- [x] RSSフィードの完全な実装が含まれている
- [x] Pagefind統合手順が含まれている
- [x] 公式ドキュメントリンクが最低6つ含まれている
- [x] Markdown: `grep "getStaticPaths" docs/04-PAGES-IMPLEMENTATION.md` → マッチする

**Commit**: YES
- Message: `docs: add pages implementation guide (index, blog, RSS)`
- Files: `docs/04-PAGES-IMPLEMENTATION.md`
- Pre-commit: なし

---

### Task 7: 05-SEO-PERFORMANCE.md 作成

**What to do**:
- SEO最適化の基礎
- メタタグ設定（OGP、Twitter Card）
- Canonical URLの設定
- Structured Data（JSON-LD）の実装
- サイトマップ生成（`@astrojs/sitemap`）
- robots.txtの作成
- パフォーマンス最適化手法
  - Islands Architecture
  - ハイドレーション戦略（client:load、client:idle等）
  - 画像最適化（astro:assets）
  - View Transitions
  - コード分割
- Lighthouse監査の実行方法
- Core Web Vitalsの改善

**Must NOT do**:
- 実装の詳細（前のタスクで扱った）
- アクセス解析ツール（スコープ外）

**Parallelizable**: NO（Task 6に依存）

**References**:
- **Pattern References**:
  - Plan Agentの実装プラン:
    - BaseHead.astroのSEO設定
    - JSON-LD実装例
    - パフォーマンス最適化戦略
    - ハイドレーション戦略の表

- **External References**:
  - 公式ドキュメント: https://docs.astro.build/en/guides/images/
  - 公式ドキュメント: https://docs.astro.build/en/guides/integrations-guide/sitemap/
  - 公式ドキュメント: https://docs.astro.build/en/guides/view-transitions/
  - Schema.org: https://schema.org/BlogPosting
  - Web.dev Core Web Vitals: https://web.dev/vitals/

**Acceptance Criteria**:
- [x] OGP設定の完全な例が含まれている
- [x] JSON-LD実装例が含まれている
- [x] ハイドレーション戦略の比較表が含まれている
- [x] Lighthouse実行コマンドが含まれている
- [x] 公式ドキュメントリンクが最低7つ含まれている
- [x] Markdown: `grep "JSON-LD" docs/05-SEO-PERFORMANCE.md` → マッチする

**Commit**: YES
- Message: `docs: add SEO and performance optimization guide`
- Files: `docs/05-SEO-PERFORMANCE.md`
- Pre-commit: なし

---

### Task 8: 06-TROUBLESHOOTING.md 作成

**What to do**:
- よくあるエラーとその解決方法
  - "Collection 'blog' does not exist" → config.ts確認
  - 画像が表示されない → image()ヘルパー、remotePatterns
  - 型エラー → astro check実行、tsconfig.json確認
  - ダークモードが効かない → tailwind.config.cjs設定
  - ビルドエラー → ログの読み方、デバッグ方法
- デバッグツール
  - `astro check`（型チェック）
  - `astro dev --verbose`（詳細ログ）
  - VSCodeデバッガー設定
- パフォーマンス問題のトラブルシューティング
- デプロイ時のトラブル

**Must NOT do**:
- 実装手順を重複して記載しない（他のドキュメントへリンク）
- 未確認のエラーを含めない

**Parallelizable**: NO（Task 7に依存）

**References**:
- **Pattern References**:
  - ユーザーへの学習Tipsセクション（よくあるトラブルシューティング）

- **External References**:
  - 公式ドキュメント: https://docs.astro.build/en/guides/troubleshooting/
  - Astro Discord: https://astro.build/chat

**Acceptance Criteria**:
- [x] 最低5つの具体的なエラーと解決方法が含まれている
- [x] `astro check`コマンドの使い方が含まれている
- [x] 各エラーに解決策が明記されている
- [x] 公式トラブルシューティングページへのリンクが含まれている
- [x] Markdown: `grep "astro check" docs/06-TROUBLESHOOTING.md` → マッチする

**Commit**: YES
- Message: `docs: add troubleshooting and FAQ guide`
- Files: `docs/06-TROUBLESHOOTING.md`
- Pre-commit: なし

---

### Task 9: 07-RESOURCES.md 作成

**What to do**:
- 公式ドキュメントリンク集（カテゴリ別）
  - Content Collections
  - Routing
  - Images
  - Markdown & MDX
  - Integrations
  - Deployment
- 参考リソース
  - Astro公式ブログ
  - Astro Discordコミュニティ
  - GitHub Discussions
- 推奨テンプレート
  - Blogster
  - Charca's Blog Template
- ツール・プラグイン
  - remark/rehypeプラグイン一覧
  - Tailwindプラグイン
  - VSCode拡張機能
- 学習リソース
  - Astro公式チュートリアル
  - YouTube動画（公式）
  - ブログ記事（信頼性の高いもの）

**Must NOT do**:
- 古いリンクを含めない（2026年1月時点で有効なもののみ）
- 個人的な意見を含めない（客観的なリソース集）

**Parallelizable**: NO（Task 8に依存）

**References**:
- **External References**:
  - 公式ドキュメントトップ: https://docs.astro.build
  - Astro公式サイト: https://astro.build
  - Astro GitHub: https://github.com/withastro/astro
  - Blogsterリポジトリ: https://github.com/flexdinesh/blogster
  - Charcaリポジトリ: https://github.com/Charca/astro-blog-template
  - Pagefind: https://pagefind.app
  - Tailwind CSS: https://tailwindcss.com
  - Shiki: https://shiki.style

**Acceptance Criteria**:
- [x] 公式ドキュメントリンクが最低10個含まれている
- [x] 推奨テンプレートへのリンクが含まれている
- [x] コミュニティリソース（Discord、GitHub）へのリンクが含まれている
- [x] カテゴリ別に整理されている
- [x] Markdown: `grep "https://docs.astro.build" docs/07-RESOURCES.md` → マッチする

**Commit**: YES
- Message: `docs: add official resources and reference links`
- Files: `docs/07-RESOURCES.md`
- Pre-commit: なし

---

### Task 10: 全ドキュメントの相互参照リンク追加

**What to do**:
- 各ドキュメントの末尾に「関連ドキュメント」セクションを追加
- 00-PROJECT-OVERVIEW.mdに全ドキュメントへのリンク追加
- 各ドキュメント内で関連するセクションへの内部リンク追加
- 目次（TOC）が自動生成される形式で記載（GitHubのMarkdown対応）

**Must NOT do**:
- 循環参照を作らない（適切な階層構造を維持）
- 不要なリンクを追加しない（関連性のあるもののみ）

**Parallelizable**: NO（Task 9完了後）

**References**:
- すべてのドキュメント（Task 2-9で作成済み）

**Acceptance Criteria**:
- [x] すべてのドキュメントに「関連ドキュメント」セクションがある
- [x] 00-PROJECT-OVERVIEW.mdから全ドキュメントへリンクがある
- [x] リンクをクリックして正しいセクションに移動できる
- [x] 各ドキュメントにTOCが含まれている
- [x] コマンド: `grep -r "\[.*\](\./" docs/` → 複数のリンクが見つかる

**Commit**: YES
- Message: `docs: add cross-references and table of contents to all documents`
- Files: `docs/*.md`（全ドキュメント）
- Pre-commit: なし

---

### Task 11: 最終レビュー＆品質チェック

**What to do**:
- 各ドキュメントを通読して、流れが自然か確認
- コードサンプルの整合性チェック（コピペして動くか）
- 公式ドキュメントリンクの有効性確認（すべてクリック）
- Markdownシンタックスの確認（VSCodeプレビュー）
- スペルチェック（英単語の綴り）
- 日本語の表記揺れチェック（「です・ます」調統一）

**Must NOT do**:
- 内容の大幅な変更（必要なら前のタスクに戻る）
- 新しい情報の追加（スコープクリープ防止）

**Parallelizable**: NO（最後のタスク）

**References**:
- すべてのドキュメント（Task 2-10で作成済み）

**Acceptance Criteria**:
- [x] すべてのドキュメントを読んで内容を確認した
- [x] すべての公式リンクが有効である（404なし）
- [x] コードサンプルに明らかなエラーがない
- [x] Markdownが正しくレンダリングされる
- [x] Definition of Done（プラン冒頭）のすべての項目が満たされている

**Commit**: YES
- Message: `docs: final review and quality assurance`
- Files: `docs/*.md`（必要に応じて修正されたファイル）
- Pre-commit: なし

---

## Commit Strategy

| After Task | Message | Files | Verification |
|------------|---------|-------|--------------|
| 2 | `docs: add project overview and architecture documentation` | `docs/00-PROJECT-OVERVIEW.md` | `cat docs/00-PROJECT-OVERVIEW.md` |
| 3 | `docs: add setup and environment configuration guide` | `docs/01-SETUP-GUIDE.md` | `grep "npm create astro" docs/01-SETUP-GUIDE.md` |
| 4 | `docs: add Content Collections implementation guide` | `docs/02-CONTENT-COLLECTIONS.md` | `grep "defineCollection" docs/02-CONTENT-COLLECTIONS.md` |
| 5 | `docs: add components and layouts implementation guide` | `docs/03-COMPONENTS-LAYOUTS.md` | `grep "<slot />" docs/03-COMPONENTS-LAYOUTS.md` |
| 6 | `docs: add pages implementation guide (index, blog, RSS)` | `docs/04-PAGES-IMPLEMENTATION.md` | `grep "getStaticPaths" docs/04-PAGES-IMPLEMENTATION.md` |
| 7 | `docs: add SEO and performance optimization guide` | `docs/05-SEO-PERFORMANCE.md` | `grep "JSON-LD" docs/05-SEO-PERFORMANCE.md` |
| 8 | `docs: add troubleshooting and FAQ guide` | `docs/06-TROUBLESHOOTING.md` | `grep "astro check" docs/06-TROUBLESHOOTING.md` |
| 9 | `docs: add official resources and reference links` | `docs/07-RESOURCES.md` | `grep "https://docs.astro.build" docs/07-RESOURCES.md` |
| 10 | `docs: add cross-references and table of contents to all documents` | `docs/*.md` | `grep -r "\[.*\](\./" docs/` |
| 11 | `docs: final review and quality assurance` | `docs/*.md` | 全ファイル読み込み確認 |

---

## Success Criteria

### Verification Commands
```bash
# すべてのドキュメントが存在するか確認
ls docs/

# 期待される出力:
# 00-PROJECT-OVERVIEW.md
# 01-SETUP-GUIDE.md
# 02-CONTENT-COLLECTIONS.md
# 03-COMPONENTS-LAYOUTS.md
# 04-PAGES-IMPLEMENTATION.md
# 05-SEO-PERFORMANCE.md
# 06-TROUBLESHOOTING.md
# 07-RESOURCES.md
```

```bash
# 各ドキュメントの文字数確認（適切な粒度か）
wc -w docs/*.md

# 期待される範囲:
# 各ドキュメント 1000-3000語程度
```

```bash
# リンク切れチェック（手動またはツール）
grep -r "https://" docs/ | cut -d: -f2 | sort | uniq

# すべてのリンクをブラウザで確認
```

### Final Checklist
- [x] 8つのドキュメントがすべて存在する
- [x] 各ドキュメントに適切な粒度で情報が整理されている
- [x] コードサンプルが実行可能な状態で記載されている
- [x] 公式ドキュメントへのリンクが正確に記載されている
- [x] ドキュメント間の相互参照が適切に設定されている
- [x] 目次（TOC）が各ドキュメントに含まれている
- [x] ユーザーが実装時に迷わず進められる構成になっている
- [x] すべての「Must Have」が含まれている
- [x] すべての「Must NOT Have」が含まれていない
