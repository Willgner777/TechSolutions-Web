/** @type {import('tailwindcss').Config} */
module.exports = {
  // Onde o Tailwind procura classes. O padrão recursivo cobre as subpastas de
  // src/ (pages, components, components/admin...). Se criar uma pasta fora de
  // src/, adicione-a aqui, senão as classes dela não serão geradas.
  content: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  theme: {
    extend: {
      keyframes: {
        'modal-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      // Uso: className="animate-modal-in"
      animation: { 'modal-in': 'modal-in 0.18s ease-out' },
    },
  },
  plugins: [],
};
