/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#ffffff',            // Fondo blanco
        alt: '#f2f3f5',           // Plomo claro
        title: '#4a4f57',         // Título plomo
        subtitle: '#8b6a00',      // Dorado oscuro
        text: '#6b7077',          // Texto plomo más claro
        line: '#e6e8eb'           // Línea suave
      },
      boxShadow: {
        soft: '0 10px 30px rgba(0,0,0,.06)'
      },
      keyframes: {
        'reveal-ltr': {
          '0%': { opacity: '0', transform: 'translateX(-24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        }
      },
      animation: {
        'reveal-ltr': 'reveal-ltr .6s ease forwards'
      }
    }
  },
  plugins: []
}