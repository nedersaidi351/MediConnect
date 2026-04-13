/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          900: '#1e3a8a',
        },
        secondary: {
          50: '#f0fdf4',
          500: '#10b981',
          600: '#059669',
        },
      },
    },
  },
  plugins: [],
}

