/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // backgroundImage: ({ theme }) => ({
      //   'wavy-gradient': `linear-gradient(${theme('colors.orange.400')},${theme('colors.rose.500')},${theme('colors.blue.400')},${theme('colors.teal.400')})`
      // }),
      width: {
        '128': '32rem',
      },
      keyframes: {
        wave: {
          '0%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
          '100%': { 'background-position': '0% 50%' }
        }
      },
      animation: {
        wave: 'wave 4s linear infinite',
      }
    },
  },
  plugins: [],
}
