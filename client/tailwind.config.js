/** @type {import('tailwindcss').Config} */

// Astera reads almost every color through a CSS variable so a single
// `data-theme` swap on <html> re-skins the entire product. The hex values
// below are the *Light* defaults; themes override the variables in theme.css.
const withVar = (name, fallback) => `rgb(var(${name}, ${fallback}) / <alpha-value>)`

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['class', '[data-theme="ink"]'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        paper: withVar('--paper', '248 247 244'),      // #F8F7F4
        card: withVar('--card', '255 255 255'),
        ink: withVar('--ink', '17 24 39'),             // #111827
        muted: withVar('--muted', '107 114 128'),
        line: withVar('--line', '17 24 39'),

        // Feature accents — each owns a meaning, never decorative.
        royal: withVar('--royal', '54 93 245'),        // Reports    #365DF5
        coral: withVar('--coral', '255 107 107'),      // Upload     #FF6B6B
        golden: withVar('--golden', '246 196 83'),     // Compliance #F6C453
        emerald: withVar('--emerald', '22 179 100'),   // Timeline   #16B364
        orange: withVar('--orange', '255 159 67'),
        sky: withVar('--sky', '56 189 248'),           // Analytics  #38BDF8
        rose: withVar('--rose', '244 63 94'),          // Risks      #F43F5E
        purple: withVar('--purple', '124 58 237'),     // AI         #7C3AED
        mint: withVar('--mint', '74 222 128'),

        // The theme's signature accent (varies per theme).
        accent: withVar('--accent', '54 93 245'),
      },
      fontFamily: {
        // Display = editorial headlines, Sans = body. Loaded in index.html.
        display: ['"General Sans"', 'Satoshi', 'Inter', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        // A deliberately editorial scale — big jumps, not the default ramp.
        'display-sm': ['clamp(2.5rem, 5vw, 3.5rem)', { lineHeight: '1.02', letterSpacing: '-0.03em' }],
        'display': ['clamp(3.5rem, 8vw, 6rem)', { lineHeight: '0.98', letterSpacing: '-0.035em' }],
        'display-lg': ['clamp(4.5rem, 12vw, 9.5rem)', { lineHeight: '0.92', letterSpacing: '-0.04em' }],
      },
      borderRadius: {
        xl: '1.25rem',
        '2xl': '1.75rem',
        '3xl': '2.25rem',
        '4xl': '3rem',
        blob: '42% 58% 63% 37% / 41% 44% 56% 59%',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(17,24,39,0.04), 0 8px 24px -8px rgba(17,24,39,0.10)',
        lift: '0 2px 4px rgba(17,24,39,0.04), 0 24px 48px -16px rgba(17,24,39,0.18)',
        float: '0 20px 60px -20px rgba(17,24,39,0.22)',
        glow: '0 0 0 1px rgb(var(--accent) / 0.16), 0 12px 40px -12px rgb(var(--accent) / 0.4)',
        inset: 'inset 0 1px 0 rgba(255,255,255,0.6)',
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
        section: 'clamp(4.5rem, 9vw, 8rem)',
      },
      maxWidth: {
        shell: '78rem',
        prose: '42rem',
      },
      transitionTimingFunction: {
        // The "Arc/Linear" feel lives in these curves.
        entry: 'cubic-bezier(0.16, 1, 0.3, 1)',
        spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-18px) rotate(1.5deg)' },
        },
        'drift': {
          '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(3%, -4%) scale(1.05)' },
          '66%': { transform: 'translate(-3%, 3%) scale(0.97)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'wave': {
          '0%, 100%': { transform: 'scaleY(0.35)' },
          '50%': { transform: 'scaleY(1)' },
        },
      },
      animation: {
        'float-slow': 'float-slow 9s ease-in-out infinite',
        'drift': 'drift 22s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s infinite',
      },
      backgroundImage: {
        'grid-faint':
          'linear-gradient(to right, rgb(17 24 39 / 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgb(17 24 39 / 0.035) 1px, transparent 1px)',
        'noise':
          "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
