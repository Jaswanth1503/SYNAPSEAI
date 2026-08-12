/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      mobile: '375px',
      tablet: '768px',
      desktop: '1024px',
      widescreen: '1440px',
    },
    extend: {
      colors: {
        brand: {
          oceanic: 'var(--color-oceanic-noir)',
          nocturnal: 'var(--color-nocturnal-expedition)',
          forsythia: 'var(--color-forsythia)',
          saffron: 'var(--color-deep-saffron)',
          mint: 'var(--color-mystic-mint)',
          powder: 'var(--color-arctic-powder)',
        },
      },
      fontFamily: {
        header: ['var(--font-family-header)'],
        body: ['var(--font-family-body)'],
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
};
