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
      center: true,
      padding: {
        DEFAULT: '0.5rem',
        sm: '1rem',
        md: '1.5rem',
        lg: '2rem',
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
        'xs': ['10px', { lineHeight: '14px', letterSpacing: '0.01em' }],
        'sm': ['12px', { lineHeight: '16px', letterSpacing: '0.01em' }],
        'base': ['14px', { lineHeight: '20px', letterSpacing: '0.005em' }],
        'lg': ['16px', { lineHeight: '22px', letterSpacing: '0.005em' }],
        'xl': ['18px', { lineHeight: '26px', letterSpacing: '0.005em' }],
        '2xl': ['20px', { lineHeight: '28px', letterSpacing: '0.005em' }],
        '3xl': ['24px', { lineHeight: '32px', letterSpacing: '0.005em' }],
        '4xl': ['28px', { lineHeight: '36px', letterSpacing: '0.005em' }],
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
        bdsec: {
          DEFAULT: '#21214f',
          dark: '#6366f1'
        },
        soft: {
          DEFAULT: '#585E72',
          dark: '#6B7280'
        },
        green: {
          DEFAULT: '#2E8B57',
          light: '#4ECCA3',
          dark: '#2D8659'
        },
        red: {
          DEFAULT: '#CF3A47',
          light: '#E63946',
          dark: '#BF2F3C'
        },
        label: {
          DEFAULT: '#4A4A4A',
          dark: '#D1D5DB'
        },
        placeholder: {
          DEFAULT: '#A0A0A0',
          dark: '#9CA3AF'
        },
        indigo: {
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
        dark: {
          bg: '#0F172A',
          'bg-secondary': '#1E293B',
          'bg-tertiary': '#334155',
          text: '#F8FAFC',
          'text-secondary': '#CBD5E1',
          border: '#475569'
        },
        'brand-primary': '#21214f',
        border: "hsl(var(--border))",
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
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        },
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 4s ease-in-out infinite'
      }
    }
  },
  darkMode: "class",
  plugins: [
    heroui(), 
    require('tailwindcss-animate'),
    function({ addUtilities, theme }) {
      const newUtilities = {
        '.border-dim': {
          'border-color': '#d1d5db', // light mode - gray-300
          '@media (prefers-color-scheme: dark)': {
            'border-color': '#4b5563' // dark mode - gray-600
          }
        },
        '.border-soft': {
          'border-color': theme('colors.soft.DEFAULT'),
          '@media (prefers-color-scheme: dark)': {
            'border-color': theme('colors.soft.dark')
          }
        },
        '.border-subtle': {
          'border-color': '#e5e7eb', // light mode - gray-200
          '@media (prefers-color-scheme: dark)': {
            'border-color': '#374151' // dark mode - gray-700
          }
        },
        '.border-muted': {
          'border-color': '#f3f4f6', // light mode - gray-100
          '@media (prefers-color-scheme: dark)': {
            'border-color': '#1f2937' // dark mode - gray-800
          }
        }
      }
      addUtilities(newUtilities, ['responsive', 'dark'])
    }
  ]
};
