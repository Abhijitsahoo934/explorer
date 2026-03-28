/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // <--- ENSURE THIS IS HERE
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--background))', // Using HSL for better variable support
        foreground: 'hsl(var(--foreground))',
        sidebar: 'var(--sidebar)',
        card: 'var(--card)',
        'card-hover': 'var(--card-hover)',
        border: 'var(--border)',
        'border-hover': 'var(--border-hover)',
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        muted: 'var(--muted)',
        glass: 'var(--glass)',
        
        'gradient-start': 'var(--gradient-start)',
        'gradient-end': 'var(--gradient-end)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-lg': '0 0 40px rgba(99, 102, 241, 0.25)',
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        glowPulse: { '0%, 100%': { opacity: '0.5' }, '50%': { opacity: '1' } },
        float: { '0%, 100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-10px)' } },
      },
      backdropBlur: { 'xs': '2px' },
    },
  },
  plugins: [],
}