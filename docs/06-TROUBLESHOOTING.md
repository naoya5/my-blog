# トラブルシューティングガイド

このドキュメントでは、Astroブログの開発中や運用中によく遭遇するエラー、その原因、および解決策について説明します。問題が発生した場合は、まずこのガイドを確認してください。

## 目次

1. [トラブルシューティングの基本アプローチ](#トラブルシューティングの基本アプローチ)
2. [よくあるエラーと解決策](#よくあるエラーと解決策)
    - [Content Collections 関連](#1-content-collections-関連)
    - [画像表示・最適化関連](#2-画像表示最適化関連)
    - [TypeScript 型エラー](#3-typescript-型エラー)
    - [ダークモード・スタイル関連](#4-ダークモードスタイル関連)
    - [ビルドエラー](#5-ビルドエラー)
3. [デバッグツールの活用](#デバッグツールの活用)
4. [パフォーマンス問題の解決](#パフォーマンス問題の解決)
5. [デプロイ時のトラブル](#デプロイ時のトラブル)
6. [公式リソースとコミュニティ](#公式リソースとコミュニティ)

---

## トラブルシューティングの基本アプローチ

問題が発生した際は、以下のステップでデバッグを行ってください。

1.  **エラーメッセージを正確に読む**: ターミナルやブラウザのコンソールに表示されるメッセージには、エラーの場所と原因が含まれています。
2.  **キャッシュをクリアする**: 原因不明の挙動が発生した場合、`.astro` ディレクトリや `node_modules` を削除して再インストールすることで解決することがあります。
3.  **開発サーバーを再起動する**: `Ctrl + C` で停止し、`npm run dev` を再度実行します。
4.  **型チェックを実行する**: `npx astro check` を実行して、コード全体の整合性を確認します。

---

## よくあるエラーと解決策

### 1. Content Collections 関連

#### エラーメッセージ
`Error: Collection 'blog' does not exist`

#### 症状
`getCollection('blog')` を呼び出した際に、コレクションが見つからないというエラーが発生し、ページが表示されない。

#### 原因
- `src/content/config.ts` ファイルが存在しない。
- `config.ts` 内で `blog` コレクションが正しく定義されていない。
- `src/content/blog/` ディレクトリにコンテンツ（Markdown/MDXファイル）が一つも存在しない。

#### 解決策
`src/content/config.ts` を確認し、コレクションが正しく定義されているか確認します。

```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    // ... その他のフィールド
  }),
});

export const collections = {
  'blog': blog, // キー名が 'blog' であることを確認
};
```

また、`src/content/blog/` ディレクトリに少なくとも一つの `.md` または `.mdx` ファイルがあることを確認してください。

---

### 2. 画像表示・最適化関連

#### 症状
- ローカル開発環境で画像が表示されない（404エラー）。
- `npm run build` 時に画像が見つからないというエラーが出る。
- 画像が最適化されず、元のサイズのまま配信される。

#### 原因
- `src/` 内の画像を標準の `<img>` タグで直接参照している。
- Content Collections のスキーマで `image()` ヘルパーを使用していない。
- Markdown 内の画像パスが不正。

#### 解決策
Astro の最適化機能を利用するために、`<Image />` コンポーネントと `image()` ヘルパーを使用します。

**スキーマ定義:**
```typescript
// src/content/config.ts
export const blog = defineCollection({
  schema: ({ image }) => z.object({
    coverImage: image(), // image() ヘルパーを使用
    title: z.string(),
  }),
});
```

**コンポーネントでの使用:**
```astro
---
import { Image } from 'astro:assets';
const { post } = Astro.props;
---
<Image src={post.data.coverImage} alt={post.data.title} />
```

Markdown 内のパスは、そのファイルからの相対パス（例: `./images/photo.jpg`）で記述してください。

---

### 3. TypeScript 型エラー

#### エラーメッセージ
`Type 'X' is not assignable to type 'Y'` または `Property 'Z' does not exist on type 'Props'`

#### 症状
エディタ上で赤線が表示される、または `astro check` 実行時にエラーが報告される。

#### 原因
- コンポーネントの `Props` インターフェース定義と、実際に渡されているデータが一致していない。
- Content Collections のスキーマ定義と、Markdown のフロントマターが一致していない。

#### 解決策
1.  **Props の確認**: コンポーネント上部で定義している `interface Props` を確認します。
2.  **スキーマの同期**: `src/content/config.ts` の定義を変更した後は、エディタを再起動するか `npx astro dev` を実行して型定義を再生成させます。
3.  **astro check の実行**:
    ```bash
    npx astro check
    ```
    これにより、プロジェクト全体の型エラーを一覧で確認できます。

---

### 4. ダークモード・スタイル関連

#### 症状
- ダークモードの切り替えボタンを押しても、スタイルが変化しない。
- Tailwind CSS の特定のクラス（`dark:` プレフィックスなど）が適用されない。

#### 原因
- `tailwind.config.mjs` (または `.cjs`) で `darkMode` 設定が有効になっていない。
- `<html>` 要素に `class="dark"` を付与する JavaScript が正しく動作していない。

#### 解決策
1.  **Tailwind 設定の確認**:
    ```javascript
    // tailwind.config.mjs
    /** @type {import('tailwindcss').Config} */
    export default {
      content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}'],
      darkMode: 'class', // これが必要
      theme: {
        extend: {},
      },
      plugins: [],
    };
    ```
2.  **スクリプトの確認**: レイアウトコンポーネント（`BaseLayout.astro` など）の `<head>` 内で、ローカルストレージからテーマを読み込み、クラスを適用するスクリプトが実行されているか確認してください。

---

### 5. ビルドエラー

#### エラーメッセージ
`[build] ❌ Failed to build` または `Rollup error: Could not resolve ...`

#### 症状
`npm run build` を実行すると途中で停止し、`dist/` ディレクトリが生成されない。

#### 原因
- コード内に型エラーが残っている。
- 存在しないファイルやライブラリをインポートしている。
- 環境変数がビルド環境（CI/CDなど）で設定されていない。

#### 解決策
1.  **詳細ログの確認**:
    ```bash
    npm run build -- --verbose
    ```
    エラーの直前に出力されているメッセージを詳しく読みます。
2.  **依存関係のクリーンアップ**:
    ```bash
    rm -rf node_modules
    rm -rf .astro
    npm install
    ```
3.  **型チェックのパス**: ビルド前に必ず `npx astro check` が通る状態にします。

---

## デバッグツールの活用

### astro check
プロジェクト全体の TypeScript 型チェックと Astro コンポーネントの検証を行います。
```bash
npx astro check
```
CI/CD パイプラインに組み込むことで、エラーのあるコードがデプロイされるのを防げます。

### astro dev --verbose
開発サーバー起動時に詳細なログを出力します。内部的なルーティングやファイルの読み込み順序を確認したい場合に有効です。
```bash
npx astro dev --verbose
```

### VSCode デバッガー設定
`.vscode/launch.json` を作成することで、VSCode 上でブレークポイントを置いてデバッグできます。

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Astro",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## パフォーマンス問題の解決

### Lighthouse スコアが低い場合
- **画像の最適化**: `astro:assets` の `<Image />` を使用しているか確認してください。
- **フォントの読み込み**: `font-display: swap;` を使用し、不要なフォントウェイトを読み込まないようにします。
- **JavaScript の削減**: 不要なクライアントサイド JS を減らします。Astro はデフォルトで JS ゼロですが、`client:load` などのディレクティブを多用していないか確認してください。

---

## デプロイ時のトラブル

### ページが 404 になる
- **base 設定**: サブディレクトリ（例: `username.github.io/repo/`）にデプロイする場合、`astro.config.mjs` の `base` 設定が必要です。
- **大文字小文字**: Linux サーバー（GitHub Actions など）はファイル名の大文字小文字を区別します。`Index.astro` と `index.astro` が混在していないか確認してください。

### 環境変数が読み込めない
- クライアントサイドで使用する環境変数は `PUBLIC_` プレフィックスが必要です（例: `PUBLIC_API_KEY`）。
- デプロイ先（Vercel, Netlify, GitHub Actions）の管理画面で環境変数が設定されているか確認してください。

---

## 6. 関連ドキュメント

- [← SEO・パフォーマンス](./05-SEO-PERFORMANCE.md)
- [リソース →](./07-RESOURCES.md)
- [セットアップガイド](./01-SETUP-GUIDE.md) - 初期設定時のトラブル
- [Content Collections](./02-CONTENT-COLLECTIONS.md) - コンテンツ管理のトラブル
- [Astro 公式トラブルシューティング](https://docs.astro.build/en/guides/troubleshooting/)

