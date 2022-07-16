/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      mode: 'jit',
      minHeight: {
        '81': '325px',
      },
      minWidth: {
        '1/10': '10%',
        '8/10': '80%',
        '104': '26rem',
        '96': '24rem',
        '36': '9rem',
      },
    },
  },
  plugins: [],
};
