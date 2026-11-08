/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
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
        background: '#F5F4EF',
        canvas: '#F5F4EF',
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#FAF9F5',
          muted: '#EFECE6',
        },
        ink: {
          primary: '#202A30',
          secondary: '#69736F',
          muted: '#8E9995',
          faint: '#CBD2CE',
        },
        primary: {
          DEFAULT: '#496A58',
          hover: '#385644',
          light: '#EAF0EA',
          border: '#C8D6CD',
          50: '#F5F8F6',
          100: '#EAF0EA',
          200: '#D7E3DC',
          300: '#AFC6BB',
          400: '#7B9F90',
          500: '#496A58',
          600: '#385644',
          700: '#2C4436',
          800: '#203227',
          900: '#202A30',
        },
        accent: {
          DEFAULT: '#BD9058',
          hover: '#A57C48',
          light: '#F8F3EC',
          border: '#E6D4BF',
        },
        border: {
          DEFAULT: '#E4E3DC',
          subtle: '#ECEBE5',
          strong: '#D5D3CA',
        },
        success: {
          DEFAULT: '#527A62',
          light: '#EDF4F0',
        },
        warning: {
          DEFAULT: '#B78945',
          light: '#FAF4EB',
        },
        error: {
          DEFAULT: '#B75B54',
          light: '#FAF0EF',
        },
      },
      boxShadow: {
        'subtle': '0 1px 2px 0 rgba(32, 42, 48, 0.04), 0 1px 1px 0 rgba(32, 42, 48, 0.02)',
        'card': '0 2px 6px -1px rgba(32, 42, 48, 0.05), 0 1px 3px -1px rgba(32, 42, 48, 0.03)',
        'elevated': '0 12px 28px -6px rgba(32, 42, 48, 0.08), 0 4px 10px -2px rgba(32, 42, 48, 0.04)',
      },
    },
  },
  plugins: [],
}
