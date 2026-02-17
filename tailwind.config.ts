import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Black Ops 1/2 Zombies inspired color palette
        // Dark, gritty, military bunker aesthetic
        
        // Blood red - deep, dark, dried blood aesthetic
        blood: {
          50: '#2a1215',   // Very dark blood tint
          100: '#3d1519',  // Dark dried blood
          200: '#4d1a1e',  // Dried blood
          300: '#6b1f24',  // Deep blood
          400: '#8b2530',  // Dark blood red
          500: '#a12d38',  // Primary - dark blood
          600: '#8a2630',  // Darker blood
          700: '#701e27',  // Deep dark blood
          800: '#571820',  // Very dark blood
          900: '#3d1117',  // Near black blood
          950: '#1f0a0c',  // Blood black
        },
        
        // Element 115 - muted purple/blue, mysterious
        element: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065',
        },
        
        // Military/decay green - muted, not neon
        military: {
          50: '#f7fee7',
          100: '#ecfccb',
          200: '#d9f99d',
          300: '#bef264',
          400: '#a3e635',
          500: '#65a30d', // Muted military green
          600: '#4d7c0f',
          700: '#3f6212',
          800: '#365314',
          900: '#2f4a14',
          950: '#1a2e05',
        },
        
        // Amber/rust for warnings and accents
        rust: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
          950: '#451a03',
        },
        
        // Dark backgrounds - neutral black/gray, no blue (bunker = dark glass feel)
        bunker: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          850: '#1a1a1a',
          900: '#171717',
          925: '#0f0f0f',
          950: '#0a0a0a', // Near black
          1000: '#050505', // True black
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-special-elite)', 'var(--font-nosifer)', 'system-ui', 'serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
        stencil: ['var(--font-special-elite)', 'serif'],
        'zombies-round': ['var(--font-black-ops-one)', 'cursive'],
        'zombies-round-smeared': ['var(--font-blood-smeared)', 'cursive'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'flicker': 'flicker 3s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'blood-pulse': 'blood-pulse 2s ease-in-out infinite',
        'static': 'static 0.5s steps(10) infinite',
        'tv-static': 'tv-static 0.12s steps(4) infinite',
        'tv-static-flicker': 'tv-static-flicker 0.08s steps(3) infinite',
        'tv-glow-pulse': 'tv-glow-pulse 4s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 15px rgba(161, 45, 56, 0.4)',
          },
          '50%': {
            opacity: '0.85',
            boxShadow: '0 0 25px rgba(161, 45, 56, 0.6)',
          },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '10%': { opacity: '0.85' },
          '20%': { opacity: '1' },
          '30%': { opacity: '0.9' },
          '40%': { opacity: '1' },
          '50%': { opacity: '0.88' },
          '60%': { opacity: '1' },
          '70%': { opacity: '0.92' },
          '80%': { opacity: '1' },
          '90%': { opacity: '0.95' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'blood-pulse': {
          '0%, 100%': { 
            opacity: '1',
            textShadow: '0 0 8px rgba(161, 45, 56, 0.7), 0 0 16px rgba(161, 45, 56, 0.3)'
          },
          '50%': { 
            opacity: '0.92',
            textShadow: '0 0 12px rgba(161, 45, 56, 0.9), 0 0 24px rgba(161, 45, 56, 0.5)'
          },
        },
        'static': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.98' },
        },
        'tv-static': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '200px 100px' },
        },
        'tv-static-flicker': {
          '0%': { opacity: '0.85' },
          '50%': { opacity: '1' },
          '100%': { opacity: '0.9' },
        },
        'tv-glow-pulse': {
          '0%, 100%': { opacity: '0.82' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'shimmer-gradient':
          'linear-gradient(90deg, transparent 0%, rgba(161, 45, 56, 0.08) 50%, transparent 100%)',
        'bunker-gradient': 'linear-gradient(180deg, rgba(161, 45, 56, 0.03) 0%, transparent 50%)',
        'blood-gradient': 'linear-gradient(180deg, rgba(112, 30, 39, 0.2) 0%, rgba(31, 10, 12, 0.8) 100%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};

export default config;
