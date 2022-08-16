/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      mode: 'jit',
      backgroundImage: {
        'brick': "url(@/assets/brick.jpg)",
        'TvScreen-texture': "url('@/assets/checkered-pattern.png')",
        'TvScreen': "url('@/assets/TV_screen2.png')",
      },
      fontFamily: {
        Noir: ["Noir", "sans-serif"],
        BPNeon:["Neon", "ns-serif"],
        Arlon:["Arlon", "sans-serif"],
      },
      screens: {
        'tvxs': { 'raw': '(max-height: 375px)' },
        // => @media (max-height: 800px),(min-width: 375px) { ... }
        'tvsm': { 'raw': '(max-height: 640px),(min-width: 640px)' },
        // => @media (max-height: 800px),(min-width: 375px) { ... }
        'tvlg': { 'raw': '(max-height: 1024px),(min-width: 1024px)' },
        // => @media (max-height: 800px),(min-width: 375px) { ... }
        '3xl': { 'raw': '(min-width: 1792px)' },
		// => @media (min-width: 1792px) { ... }
      },
    },
  },
  plugins: [],
};
