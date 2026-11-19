/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Barlow', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Barlow', 'sans-serif'],
        heading: ['Barlow', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Barlow', 'sans-serif'],
        mono: ['Barlow', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        'sm': '4px',
        'DEFAULT': '6px',
        'md': '8px',
        'lg': '8px',
        'xl': '10px',
        '2xl': '12px',
        'pill': '9999px',
      },
      colors: {
        background: '#09090B',
        canvas: '#09090B',
        surface: {
          DEFAULT: '#111114',
          subtle: '#18181B',
          muted: '#202025',
          elevated: '#27272E',
        },
        ink: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#71717A',
          faint: '#52525B',
        },
        primary: {
          DEFAULT: '#10B981',
          hover: '#059669',
          light: 'rgba(16, 185, 129, 0.15)',
          border: 'rgba(16, 185, 129, 0.3)',
          50: '#022C22',
          100: '#064E3B',
          200: '#065F46',
          300: '#047857',
          400: '#059669',
          500: '#10B981',
          600: '#34D399',
          700: '#6EE7B7',
          800: '#A7F3D0',
          900: '#D1FAE5',
        },
        accent: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: 'rgba(99, 102, 241, 0.15)',
          border: 'rgba(99, 102, 241, 0.35)',
        },
        border: {
          DEFAULT: '#27272A',
          subtle: '#1F1F23',
          strong: '#3F3F46',
        },
        success: {
          DEFAULT: '#10B981',
          light: 'rgba(16, 185, 129, 0.15)',
          subtle: 'rgba(16, 185, 129, 0.12)',
        },
        warning: {
          DEFAULT: '#F59E0B',
          light: 'rgba(245, 158, 11, 0.15)',
          subtle: 'rgba(245, 158, 11, 0.12)',
        },
        error: {
          DEFAULT: '#EF4444',
          light: 'rgba(239, 68, 68, 0.15)',
          subtle: 'rgba(239, 68, 68, 0.12)',
        },
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'card': '0 4px 12px -2px rgba(0, 0, 0, 0.5), 0 2px 4px -2px rgba(0, 0, 0, 0.3)',
        'elevated': '0 20px 40px -8px rgba(0, 0, 0, 0.7), 0 8px 16px -4px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
}
