export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {
    colors: {
      'prithvi-blue': '#0B3D91',
      'prithvi-saffron': '#FF9933',
      'glass': 'rgba(255, 255, 255, 0.7)',
      'glass-dark': 'rgba(0, 0, 0, 0.6)'
    },
    backdropBlur: {
      xs: '2px',
    },
    animation: {
      'fade-in': 'fadeIn 0.3s ease-out',
      'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideUp: {
        '0%': { transform: 'translateY(20px)', opacity: '0' },
        '100%': { transform: 'translateY(0)', opacity: '1' },
      }
    }
  }},
  plugins: [],
}
