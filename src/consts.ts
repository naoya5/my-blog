// サイト全体で共有する定数（ドメインは astro.config.mjs の `site` が単一の真実の源）。
// 本番ドメインを変えるときは astro.config.mjs の `site` を変更すれば、canonical / OG /
// sitemap / robots.txt / RSS / 構造化データのすべてに反映される。

export const SITE_TITLE = 'Agentic Signal';
export const SITE_DESCRIPTION =
  'AIエージェント開発とAI駆動のワークフロー構築を中心に、現場で使えるシグナルを発信します。';
export const SITE_AUTHOR = 'Agentic Signal';

// HTML lang 属性と OG locale。
export const SITE_LANG = 'ja';
export const SITE_LOCALE = 'ja_JP';

// X(Twitter) のアカウント。例: '@your_handle'。
// 後で設定する場合は空文字のままでよい（空なら twitter:site / twitter:creator は出力されない）。
export const TWITTER_HANDLE = '';

// 自動生成する OG 画像の既定パス（/og/[...slug].png エンドポイントが生成する）。
export const DEFAULT_OG_IMAGE = '/og/default.png';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
