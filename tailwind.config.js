/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        'accent-hover': 'var(--accent-hover)',
        'accent-soft': 'var(--accent-soft)',
        'accent-softer': 'var(--accent-softer)',
        'bg-primary': 'var(--bg-primary)',
        'bg-sidebar': 'var(--bg-sidebar)',
        'bg-surface': 'var(--bg-surface)',
        'bg-code': 'var(--bg-code)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'border-subtle': 'var(--border)',
        'border-strong': 'var(--border-strong)',
        'file-md': 'var(--file-icon-md)',
        'file-txt': 'var(--file-icon-txt)',
        'code-inline': 'var(--code-inline-bg)'
      },
      fontFamily: {
        sans: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
        serif: ['"Source Serif 4"', 'Georgia', '"Times New Roman"', 'serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace']
      },
      boxShadow: {
        soft: 'var(--shadow-sm)',
        medium: 'var(--shadow-md)'
      }
    }
  },
  plugins: [require('@tailwindcss/typography')]
}
