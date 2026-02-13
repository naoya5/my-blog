/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
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
        DEFAULT: {
          css: {
            '--tw-prose-body': theme('colors.slate.700'),
            '--tw-prose-headings': theme('colors.slate.900'),
            '--tw-prose-links': theme('colors.brand.600'),
            '--tw-prose-bold': theme('colors.slate.900'),
            '--tw-prose-code': theme('colors.pink.700'),
            '--tw-prose-quotes': theme('colors.slate.800'),
            '--tw-prose-quote-borders': theme('colors.brand.300'),
            a: {
              textDecoration: 'none',
              fontWeight: '500',
              borderBottom: `1px solid ${theme('colors.brand.200')}`,
              transition: 'all 0.2s ease',
            },
            'a:hover': {
              color: theme('colors.brand.700'),
              borderBottomColor: theme('colors.brand.500'),
              backgroundColor: theme('colors.brand.50'),
            },
            'h1, h2, h3, h4': {
              letterSpacing: '-0.02em',
              fontWeight: '800',
            },
          },
        },
        invert: {
          css: {
            '--tw-prose-body': theme('colors.slate.300'),
            '--tw-prose-headings': theme('colors.slate.100'),
            '--tw-prose-links': theme('colors.brand.400'),
            '--tw-prose-quote-borders': theme('colors.brand.800'),
            'a:hover': {
              color: theme('colors.brand.300'),
              backgroundColor: theme('colors.brand.950'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
