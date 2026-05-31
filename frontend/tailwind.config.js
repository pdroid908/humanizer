/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        // 'linear' menjaga kecepatan tetap, tidak melambat di ujung
        marquee: 'marquee 15s linear infinite',
      },
      keyframes: {
        marquee: {
          // Mulai dari luar layar sebelah kanan (100%)
          '0%': { transform: 'translateX(100%)' },
          // Berakhir di luar layar sebelah kiri (-100%)
          '100%': { transform: 'translateX(-100%)' },
        },
      },
    },
  },
  plugins: [],
}