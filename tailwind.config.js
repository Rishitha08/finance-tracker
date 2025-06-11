/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "sans-serif"],
      },
      colors: {
        'samsung-blue': '#1f2937',
        'samsung-light-blue': '#3b82f6',
        'samsung-accent': '#06b6d4',
        'samsung-gray': '#f8fafc',
        'samsung-dark-gray': '#64748b',
        'samsung-success': '#10b981',
        'samsung-warning': '#f59e0b',
        'samsung-error': '#ef4444',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
