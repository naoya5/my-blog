# X Post Embed 機能設計書

> 作成日: 2026-07-07
> ステータス: 実装済み

## 概要

ブログ記事（Markdown）中に貼られた X（旧 Twitter）の投稿 URL を、ビルド時に静的なリッチカードへ自動変換する機能を追加する。ユーザーは `https://x.com/handle/status/123` または `https://twitter.com/handle/status/123` を単独行で貼るだけで、サイトのテーマに合わせた埋め込みカードが生成される。

## ゴール

- Markdown 中の単独行 X URL を自動的に埋め込みカードに変換する
- 外部スクリプト（`widgets.js`）を読み込まず、SSG 時に静的 HTML を生成する
- 既存のサイトデザイン・CSP 制約に合わせる
- ビルド時の外部 API 呼び出しを最小化するため、oEmbed レスポンスをキャッシュする

## 非ゴール

- X の認証 API や有料 API を使用した高度な情報取得（いいね数・リポスト数・アイコン画像）
- クライアントサイドでの動的埋め込み（widgets.js）
- 明示的なショートコード構文（`::x-post[URL]` など）

## 採用アプローチ

- 実装方式: カスタム remark プラグイン
- データ取得: `publish.twitter.com/oembed` API（ビルド時のみ）
- 表示内容: 投稿者名、@handle、投稿本文、日付、投稿へのリンク
- キャッシュ: ファイルベースキャッシュ（`.cache/remark-x-embed/`）

## 設計詳細

### 1. ファイル配置

```
astro.config.mjs
src/plugins/remark-x-embed.ts
src/styles/global.css  （スタイル追加）
package.json  （依存追加）
```

### 1.1 依存

プラグイン実装に必要な追加依存：

- `unist-util-visit`：Markdown AST の走査
- `@types/mdast`：型定義
- `@types/unist`：型定義（`Node` / `Parent` 用）

これらは remark エコシステムに含まれるため、既存の `remarkPlugins` と同じ環境で動作する。

### 2. Markdown パイプラインへの統合

`astro.config.mjs` の `markdown.remarkPlugins` に追加する。既存の `remark-link-card-plus` と `remark-github-blockquote-alert` と同じ配列に並べる。

```javascript
import remarkXEmbed from './src/plugins/remark-x-embed.ts';

export default defineConfig({
  markdown: {
    remarkPlugins: [
      remarkXEmbed,
      [remarkLinkCard, { /* ... */ }],
      remarkAlert,
    ],
  },
});
```

### 3. URL 検出

変換対象は以下のパターンに一致する単独行リンク。

- `https://x.com/{handle}/status/{id}`
- `https://twitter.com/{handle}/status/{id}`
- http も許可
- クエリパラメータ・フラグメントは無視して status ID を抽出

単独行の判定は、`remark-link-card-plus` と同じような方針で行う：段落ノード内にテキストがリンクのみであることを確認する。さらに、リンクテキストが URL と一致するベアリンクのみを対象とし、カスタムラベル付きリンク (`[Click here](...)`) は変換しない。

### 4. oEmbed 取得・パース

API エンドポイント：

```
https://publish.twitter.com/oembed?url={encoded_url}&omit_script=true
```

取得項目：

- `author_name`: 投稿者表示名
- `author_url`: `https://x.com/handle` 形式から handle を抽出
- `html`: 内包する `<p>` から投稿本文、`<a>` から日付テキストを抽出

HTML 抽出は、oEmbed レスポンスの構造が固定であることを前提に、軽量なパーサーまたは正規表現を使用する。投稿本文は `<p>` から、日付は `</p>` 以降の最初の `<a>` から抽出する。本文は信頼できる API 由来だが、`<a>` と `<br>` のみを許可し、それ以外のタグは HTML エスケープしてサニタイズする。

### 5. キャッシュ

`.cache/remark-x-embed/{url_hash}.json` に JSON レスポンスを保存する。ビルド時に同じ URL が再び出現した場合、ファイルを読み込む。キャッシュミス時のみ API を呼び出す。キャッシュディレクトリは `.gitignore` で既に `.cache/` 全体が対象となっているため、追加の設定は不要。

### 6. 生成 HTML

成功時：

```html
<figure class="x-embed-card">
  <figcaption class="x-embed-header">
    <span class="x-embed-author">Author Name</span>
    <span class="x-embed-handle">@handle</span>
  </figcaption>
  <blockquote class="x-embed-body" cite="https://x.com/handle/status/123">
    <p>投稿本文</p>
  </blockquote>
  <footer class="x-embed-footer">
    <a href="https://x.com/handle/status/123" target="_blank" rel="noopener noreferrer">
      <time>2026年7月7日</time> · Xで見る
    </a>
  </footer>
</figure>
```

失敗時（フォールバック）：

```html
<figure class="x-embed-card x-embed-card-fallback">
  <blockquote class="x-embed-body">
    <a href="https://x.com/handle/status/123" target="_blank" rel="noopener noreferrer">
      Xの投稿を見る
    </a>
  </blockquote>
</figure>
```

### 7. スタイリング

`src/styles/global.css` の `@layer components` に追加する。既存 CSS 変数を使用し、サイトのカード・引用ブロックの雰囲気に合わせる。

使用する変数：

- `--surface`：背景
- `--line`：枠線
- `--text-main`：主要テキスト
- `--text-muted`：補足テキスト
- `--accent`：アクセント・リンク

### 8. エラーハンドリング

- API レスポンス 4xx/5xx → フォールバック HTML 生成
- JSON パース失敗 → フォールバック HTML 生成
- 必須フィールド欠落 → フォールバック HTML 生成
- タイムアウト → フォールバック HTML 生成

ビルド自体は失敗しない。

### 9. CSP・セキュリティ

- 新しいインライン `<script>` は追加しないため、`public/_headers` の `script-src` 変更は不要
- 外部 JavaScript 読み込みは発生しない
- 取得した投稿本文は `<a>` / `<br>` タグを許可しつつ HTML エスケープしてサニタイズする

### 10. テスト・検証

- 既存の `src/content/blog/ai.md` または新しいテスト用 Markdown に X URL を追加してビルド
- `pnpm build` が成功すること
- 出力 HTML に `x-embed-card` クラスが含まれることを確認
- ダークモード・ライトモードの両方でスタイルが崩れないことを確認
- キャッシュファイルが生成されることを確認

## リスク

- `publish.twitter.com/oembed` API の仕様変更や廃止
- 対応方針：仕様変更時はフォールバック表示に自動切り替わり、サイト全体のビルドは継続可能。仕様が廃止された場合は、フォールバック表示をデフォルトにするか、別の取得方法を検討する。

## 次のステップ

1. `src/plugins/remark-x-embed.ts` を実装
2. `astro.config.mjs` にプラグインを登録
3. `src/styles/global.css` にスタイルを追加
4. テスト用 X URL を含む Markdown でビルド検証
