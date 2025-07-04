const { heroui } = require("@heroui/react");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './constants/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    './sections/**/*.{ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    container: {
      center: 'true',
      padding: {
        DEFAULT: '0.5rem',  // 8px for smallest screens
        sm: '1rem',         // 16px for small screens
        md: '1.5rem',       // 24px for medium screens
        lg: '2rem',         // 32px for large screens
      },
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        'xs': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'sm': ['14px', { lineHeight: '20px', letterSpacing: '0.01em' }],
        'base': ['16px', { lineHeight: '24px', letterSpacing: '0.005em' }],
        'lg': ['18px', { lineHeight: '28px', letterSpacing: '0.005em' }],
        'xl': ['20px', { lineHeight: '32px', letterSpacing: '0.005em' }],
        '2xl': ['24px', { lineHeight: '36px', letterSpacing: '0.005em' }],
        '3xl': ['30px', { lineHeight: '40px', letterSpacing: '0.005em' }],
        '4xl': ['36px', { lineHeight: '48px', letterSpacing: '0.005em' }],
        '2xs': ['10px', { lineHeight: '14px', letterSpacing: '0.01em' }],
        '3xs': ['8px', { lineHeight: '12px', letterSpacing: '0.01em' }],
      },
      spacing: {
        'default': '16px',
        'xs': '8px',
        'sm': '12px',
        'md': '16px',
        'lg': '20px',
        'xl': '24px',
        '2xl': '32px',
      },
      colors: {
        // BDSEC Brand Colors
        'bdsec': {
          DEFAULT: '#21214f',
          dark: '#6366f1' // Indigo-500 for dark mode
        },
        'soft': {
          DEFAULT: '#585E72',
          dark: '#6B7280'
        },
        'green': {
          DEFAULT: '#2E8B57', // Darker sea green
          light: '#4ECCA3',   // Original color
          dark: '#2D8659'     // Dark mode variant
        },
        'red': {
          DEFAULT: '#CF3A47', // Darker red
          light: '#E63946',   // Original color
          dark: '#BF2F3C'     // Dark mode variant
        },
        'label': {
          DEFAULT: '#4A4A4A',
          dark: '#D1D5DB'
        },
        'placeholder': {
          DEFAULT: '#A0A0A0',
          dark: '#9CA3AF'
        },
        // Indigo colors for dark mode
        'indigo': {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Dark theme colors
        'dark': {
          'bg': '#0F172A',
          'bg-secondary': '#1E293B',
          'bg-tertiary': '#334155',
          'text': '#F8FAFC',
          'text-secondary': '#CBD5E1',
          'border': '#475569'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  darkMode: "class",
  plugins: [heroui(), require('tailwindcss-animate')]
};
