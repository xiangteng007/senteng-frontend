/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        morandi: {
          base: "#F4F5F7",
          card: "#FFFFFF",
          text: {
            primary: "#4F5D75",
            secondary: "#8D99AE",
            accent: "#2D3142"
          },
          blue: {
             100: "#D8E2DC",
             200: "#B8C5C8",
             300: "#9DA9B3",
             500: "#7C90A0", // Main blue-grey
             600: "#5D7080"
          },
          green: {
             100: "#E6EFEC",
             200: "#C9DBD6",
             500: "#95B8A8", // Sage
             600: "#7A9E8E"
          },
          beige: {
             100: "#F9F7F2",
             200: "#EFEDE6",
             500: "#DBCAB0", // Sand
             600: "#BFA88F"
          },
          orange: {
             100: "#FAEBE6",
             500: "#E0B1A6", // Muted coral
             600: "#C99185"
          }
        }
      },
      fontFamily: {
        sans: ['"Noto Sans TC"', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}