/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      typography: (theme) => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate.700'),
            '--tw-prose-headings': theme('colors.slate.900'),
            '--tw-prose-lead': theme('colors.slate.600'),
            '--tw-prose-links': theme('colors.cyan.700'),
            '--tw-prose-bold': theme('colors.slate.900'),
            '--tw-prose-code': theme('colors.pink.700'),
            '--tw-prose-quotes': theme('colors.slate.800'),
            '--tw-prose-quote-borders': theme('colors.cyan.300'),
            '--tw-prose-captions': theme('colors.slate.500'),
            '--tw-prose-hr': theme('colors.slate.300'),
            '--tw-prose-th-borders': theme('colors.slate.300'),
            '--tw-prose-td-borders': theme('colors.slate.200'),
            a: {
              textDecoration: 'none',
              borderBottom: `1px solid ${theme('colors.cyan.300')}`,
            },
            'a:hover': {
              color: theme('colors.cyan.900'),
              borderBottomColor: theme('colors.cyan.900'),
            },
            'h2, h3': {
              scrollMarginTop: '6rem',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.slate.300'),
            '--tw-prose-headings': theme('colors.slate.100'),
            '--tw-prose-lead': theme('colors.slate.400'),
            '--tw-prose-links': theme('colors.cyan.300'),
            '--tw-prose-bold': theme('colors.slate.100'),
            '--tw-prose-code': theme('colors.pink.300'),
            '--tw-prose-quotes': theme('colors.slate.200'),
            '--tw-prose-quote-borders': theme('colors.cyan.700'),
            '--tw-prose-captions': theme('colors.slate.400'),
            '--tw-prose-hr': theme('colors.slate.700'),
            '--tw-prose-th-borders': theme('colors.slate.700'),
            '--tw-prose-td-borders': theme('colors.slate.800'),
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
