export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        title: 'var(--title)',
        subtitle: 'var(--subtitle)',
        text: 'var(--text)',
        alt: 'var(--alt)',
        line: 'var(--line)'
      },
      boxShadow: { soft: '0 10px 25px rgba(0,0,0,.08)' },
    },
  },
  plugins: [],
}