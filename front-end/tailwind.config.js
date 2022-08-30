/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
	  spacing: {
		'p1.5' : "1.5%",
		'p5' : "5%",
		'p10' : "10%",
		'20vh' : "20vh"
	  },
      mode: 'jit',
      backgroundImage: {
        'brick': "url(@/assets/brick.jpg)",
        'TvScreen-texture': "url('@/assets/checkered-pattern.png')",
        'TvScreen': "url('@/assets/TV_screen.png')",
        'TvScreen-transparent': "url('@/assets/TV_screen-transparent.png')",
        'TvScreenPixel': "url('@/assets/grid.png')"
      },
      fontFamily: {
        Noir: ["Noir", "sans-serif"],
        BPNeon:["Neon", "ns-serif"],
        VS:["VS", "ns-serif"],
        skyfont:["skyfont", "ns-serif"],
        Arlon:["Arlon", "sans-serif"],
		Vibur:["Vibur", "sans-serif"]
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
		'4xl': { 'raw': '(min-width: 2048px)' }
		// => @media (min-width: 1792px) { ... }
      },
    },
  },
  plugins: [],
};
