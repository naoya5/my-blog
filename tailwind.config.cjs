/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  // astro.config.mjs の rehype-autolink-headings がビルド時に付与するクラスなので、
  // content のソーススキャンでは見つからず purge されてしまう。safelist で明示的に残す。
  safelist: ['anchor-link'],
  theme: {
    extend: {
      colors: {
        // 色の真実の源は src/styles/global.css の CSS 変数（--accent 等）。
        // ここでは Tailwind のユーティリティクラス（brand-*）から同じ変数を参照するだけで、
        // 独自の色値は持たない（ライト/ダークは html.dark の変数切り替えで自動追従する）。
        brand: {
          50: 'rgb(var(--accent-soft))',
          100: 'rgb(var(--text-main))',
          200: 'rgb(var(--accent-soft))',
          300: 'rgb(var(--accent))',
          400: 'rgb(var(--accent))',
          500: 'rgb(var(--accent))',
          600: 'rgb(var(--accent))',
          700: 'rgb(var(--accent))',
          800: 'rgb(var(--accent-soft))',
          900: 'rgb(var(--text-main))',
          950: 'rgb(var(--text-main))',
        },
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      typography: (theme) => ({
        // DEFAULT/invert 共通で CSS 変数を参照する。html.dark 切り替えで自動的に
        // ダーク配色へ追従するため、invert 側は accent 系だけ明示すれば十分。
        DEFAULT: {
          css: {
            '--tw-prose-body': 'rgb(var(--text-main))',
            '--tw-prose-headings': 'rgb(var(--text-main))',
            '--tw-prose-links': 'rgb(var(--accent))',
            '--tw-prose-bold': 'rgb(var(--text-main))',
            '--tw-prose-code': theme('colors.pink.700'),
            '--tw-prose-quotes': 'rgb(var(--text-main))',
            '--tw-prose-quote-borders': 'rgb(var(--accent))',
            a: {
              textDecoration: 'none',
              fontWeight: '500',
              borderBottom: '1px solid rgba(var(--accent), 0.35)',
              transition: 'all 0.2s ease',
            },
            'a:hover': {
              color: 'rgb(var(--accent))',
              borderBottomColor: 'rgb(var(--accent))',
              backgroundColor: 'rgba(var(--accent-soft), 0.6)',
            },
            'h1, h2, h3, h4': {
              letterSpacing: '-0.02em',
              fontWeight: '800',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': 'rgb(var(--text-main))',
            '--tw-prose-headings': 'rgb(var(--text-main))',
            '--tw-prose-links': 'rgb(var(--accent))',
            '--tw-prose-quote-borders': 'rgb(var(--accent))',
            'a:hover': {
              color: 'rgb(var(--accent))',
              backgroundColor: 'rgba(var(--accent-soft), 0.35)',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
