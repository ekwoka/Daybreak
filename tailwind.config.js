const theme = require("tailwindcss/defaultTheme")
const colors = require('tailwindcss/colors')

module.exports = {
  mode: 'jit',
  purge: {
    mode: "all",
    content: ["./**/*.liquid","./assets/daybreak.min.js"],
    options: {
      whitelist: [],
    },
  },
  darkMode: 'media',
  theme: {
    container: {
      center: true,
    },
    screens: {
      'xs': '340px',
      ...theme.screens,
    },
    extend: {
      colors: {
        truegray: colors.trueGray,
        primary: colors.blue,
        secondary: colors.red,
        cta: colors.blue
      },
      margin: {
      },
      padding: {
      },
      inset: {
      },
      height: {
      },
      width: {},
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%'
      },
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%'
      },
      lineHeight: {
      },
      letterSpacing: ['dark'],
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.900'),
          },
        },
      }),
      animation: {
        'bubble-ping': 'bubble 2s cubic-bezier(0, 0, 0.2, 1) 2'
      },
      keyframes: {
        bubble: {
          '50%': { opacity: '0', transform: 'scale(2)'},
          '51%': { opacity: '0', transform: 'scale(0)'},
          '15%, 85%': { opacity: 1, transform: 'scale(1)'}
        }
      }
    },
  },
  variants: {
    extend: {
      borderRadius: ['group-focus','hover','focus'],
    }
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require('@tailwindcss/aspect-ratio')
  ],
};
