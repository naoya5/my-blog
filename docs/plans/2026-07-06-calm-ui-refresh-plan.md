# Calm UI Refresh Implementation Plan — 「生成りの紙」

> **For Claude:** このプランは委任実装用。デザイン判断（色・数値）はすべて本ドキュメントで確定済みなので、実装者は値の再発明をせず本仕様に従うこと。迷った場合は「より静かな方（低コントラスト・低彩度・動きが少ない方）」を選ぶ。

**Goal:** ブログ全体を「人間が長文を疲れずに落ち着いて読める」トーンへ調整する。方向性は現行アイボリー × セリフ見出しの延長線（案1「生成りの紙」）+ 読みやすさの共通原則。

**Architecture:** P0 Task 2 でカラーは `src/styles/global.css` の CSS 変数に一本化済みのため、変更の中心は**トークン値の差し替えと数値調整**。コンポーネントの構造変更はほぼ無し。**例外的な制約: `src/components/layout/Header.astro` の挙動・アニメーション（スクロールで隠れる glass-header、トランジション類）は一切変更しない**（ユーザー指定）。

**Tech Stack:** Astro 5, Tailwind 3, Shiki, 変更ファイルは主に `src/styles/global.css` / `astro.config.mjs` / `tailwind.config.cjs`

## デザイン意図（実装判断の基準）

1. コントラストは「強すぎない」— 真っ黒・真っ白を使わない。本文はおよそ 11:1、補助テキストは 4.5:1 以上を維持しつつ上げすぎない。
2. 本文 17px / 行間 1.9 / 和文字間 +0.02em — 読書のリズムは行間と段落間で作る。
3. ダークは「柔らかい暗さ」— 寒色スレートをやめ、暖色寄りの暗色 + 白すぎない文字。
4. 彩度の上限を低く — アクセントは沈んだブラウン/カーキ1系統のみ。
5. 動きは最小限 — ホバーは色/不透明度の変化のみ（150ms 以下）。**ただしヘッダーは現状維持**。
6. 罫線と影は薄く — 境界は余白で作る。

---

### Task 1: カラートークンの差し替え（ライト/ダーク）

**Files:**
- Modify: `src/styles/global.css`

**Steps:**

`@layer base` の `:root` と `html.dark` を以下の値に置き換える（RGB スペース区切り形式は現行踏襲）:

```css
:root {
  --bg-canvas: 246 242 233;   /* #F6F2E9 生成り */
  --text-main: 53 49 42;      /* #35312A 墨に近い焦茶 */
  --text-muted: 109 102 90;   /* #6D665A */
  --surface: 253 251 246;     /* #FDFBF6 温白 */
  --surface-2: 239 233 219;   /* #EFE9DB */
  --line: 224 215 194;        /* #E0D7C2 薄い罫 */
  --accent: 138 124 94;       /* #8A7C5E 沈んだカーキブラウン */
  --accent-soft: 236 229 212; /* #ECE5D4 */
  --shadow-color: 38 36 31;
}

html.dark {
  --bg-canvas: 28 26 23;      /* #1C1A17 暖色の暗がり */
  --text-main: 230 226 217;   /* #E6E2D9 白すぎない文字 */
  --text-muted: 173 165 151;  /* #ADA597 */
  --surface: 36 33 29;        /* #24211D */
  --surface-2: 44 41 36;      /* #2C2924 */
  --line: 58 54 47;           /* #3A362F */
  --accent: 197 180 141;      /* #C5B48D */
  --accent-soft: 58 52 40;    /* #3A3428 */
  --shadow-color: 0 0 0;
}
```

- `body` の background グラデーション（白のオーバーレイ）は残してよいが、不自然なら `rgba(255,255,255,.28)` → `.18` 程度に弱める。
- 置き換え後、`global.css` 全体を走査し、旧値・slate/sky・純黒 `#000` / 純白 `#fff` 直書きが**文字色・背景色として**残っていないか確認（`rgba(255,255,255,…)` のハイライト用途などは判断の上残してよい）。

**Verify:** ライト/ダーク両テーマで全ページの背景・文字・罫線・アクセントが上記トーンに変わる。青・寒色グレーが出ない。

### Task 2: 本文タイポグラフィの読みやすさ調整

**Files:**
- Modify: `src/styles/global.css`

**Steps:**
1. `body` の `line-height: 1.72` → `1.8`。
2. `.prose` に以下を追加（記事本文のみ 17px 化。UI 全体のサイズは変えない）:
   ```css
   .prose {
     font-size: 17px;
     line-height: 1.9;
     letter-spacing: 0.02em;
   }
   .prose p { margin-top: 1.5em; margin-bottom: 1.5em; }
   ```
   ※ Tailwind Typography のデフォルトと競合したら `!important` ではなく詳細度で解決する。
3. `.prose` の `max-width: 68ch` は、17px 化後に1行が全角 36〜40 字程度に収まるか確認し、超えるようなら `max-width: 42rem` 程度に調整。
4. 見出し（`.prose h2` / `h3`）の上マージンは現行を維持（すでに広め）。`page-title` 等の UI 側サイズは変更しない。

**Verify:** 記事ページ（/blog/ai/）で本文が 17px・行間 1.9 で表示され、1行の文字数が 36〜40 字程度。目次・ヘッダー等 UI のサイズは不変。

### Task 3: コードブロックを「紙に馴染む」淡色テーマへ

**Files:**
- Modify: `astro.config.mjs`（shikiConfig）
- Modify: `src/styles/global.css`（pre の枠・背景）

**Steps:**
1. Shiki のテーマを warm 系へ変更: light `vitesse-light`、dark `vitesse-dark`（Shiki v1 バンドル済みテーマ）。ビルドして記事のコードブロックの可読性（コメント色のコントラスト等）を確認し、問題があれば light は `catppuccin-latte`、dark は `everforest-dark` を代替候補とする。
2. `.prose pre` の border は `rgb(var(--line))` のまま。Shiki が出力する背景色が新しい紙色と喧嘩する場合のみ、`.prose pre` に `background-color: rgb(var(--surface-2)) !important` を検討（テーマ変更で解決するなら不要）。
3. transformerNotationDiff / Highlight の表示（追加行・ハイライト行の背景）が新テーマでも判別できることを確認。

**Verify:** ライト時にコードブロックが白浮き・黒浮きせず紙色に馴染む。diff/ハイライト行が判別できる。

### Task 4: 動きと影の減量（ヘッダーは対象外）

**Files:**
- Modify: `src/styles/global.css`
- Modify（該当あれば）: `src/components/blog/BlogCard.astro` 等のカード類

**Steps:**
1. **`Header.astro` と `.glass-header` / `.header-hidden` / `.header-pill` まわりの挙動・トランジションには触れない（ユーザー指定で現状維持）。**
2. それ以外で `transform` / `translate` / `scale` を伴うホバー効果（カードの持ち上げ等）があれば、色・ボーダー色・不透明度の変化（150ms）に置き換える。
3. `a { @apply transition-all duration-200 }` を `transition-colors duration-150` に変更（transition-all は無関係なプロパティまでアニメーションするため）。
4. `.list-divider` の inset box-shadow（ハイライト線）を削除し、シンプルな 1px 罫線のみにする。
5. `.markdown-alert` の `shadow-sm` など、残っている影を確認し、「1段だけ・ごく薄く」を超えるものは削る。

**Verify:** ホバーで要素が動かない（色だけ変わる）。ヘッダーのスクロール時の隠れる挙動は従来どおり動く。

### Task 5: 微調整と全体検証

**Files:**
- Modify: 必要に応じて各コンポーネント

**Steps:**
1. 全ページ（トップ / /blog/ / 記事 / タグ / about / 404 / 検索モーダル / モバイルナビ）をライト・ダーク両テーマで巡回し、旧配色の取り残し（特にモバイルナビドロワー・検索モーダル・読了バー・シェアボタン・コードコピーボタン）を新トークンに揃える。
2. 読了プログレスバーの色が新 `--accent` で目立ちすぎないか確認（気になる場合は不透明度 0.6〜0.7）。
3. `pnpm astro check` / `pnpm build` を通す。CSP に関わるインラインスクリプトの変更はこのプランでは発生しない想定だが、`public/_headers` のハッシュとビルド出力の整合は最後に確認する。

**Verify（受け入れ基準）:**
- [ ] ライト: 生成り地 + 焦茶文字 + カーキブラウンのアクセントで統一。純黒・純白・青系が出ない
- [ ] ダーク: 暖色の暗がり + 白すぎない文字。寒色スレートが出ない
- [ ] 記事本文 17px / 行間 1.9、コードブロックが紙に馴染む
- [ ] ホバーで動くのは色だけ（ヘッダーの隠れる挙動は従来どおり）
- [ ] `pnpm astro check` / `pnpm build` 成功、390×844 / 1440×900 × 両テーマでスクショ確認

## スコープ外
- ヘッダーの構造・挙動・アニメーションの変更（ユーザー指定で現状維持）
- レイアウト変更（Featured ヒーロー等）・フォントファミリーの変更（Playfair / Zen Kaku は継続）
- OG 画像テンプレート（`src/lib/og/`）の配色更新 — 記事側と多少トーンが違っても許容。気になれば別タスクで
