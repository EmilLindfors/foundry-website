/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors (Orange)
        primary: {
          50: '#FFF0EB',
          100: '#FFD8CC',
          200: '#FFB8A3',
          300: '#FF957A',
          400: '#FF7757',
          500: '#FF6138', // Base brand color
          600: '#E54520',
          700: '#CC2D0F',
          800: '#B31D03',
          900: '#991100',
        },
        // Secondary Colors (Blue)
        secondary: {
          50: '#E6EEF1',
          100: '#C2D5DC',
          200: '#9BBCC8',
          300: '#72A3B4',
          400: '#4E8A9E',
          500: '#07485B', // Base brand color
          600: '#053E4F',
          700: '#033443',
          800: '#022A37',
          900: '#01202B',
        },
        // Neutral Colors
        neutral: {
          50: '#F8F9FA',
          100: '#E9ECEF',
          200: '#DEE2E6',
          300: '#CED4DA',
          400: '#ADB5BD',
          500: '#6C757D',
          600: '#495057',
          700: '#343A40',
          800: '#212529',
          900: '#111315',
        },
        // Semantic Colors
        success: {
          50: '#E9F7EF',
          100: '#C8E6D6',
          500: '#28A745', // Base success color
          600: '#208E3B',
          700: '#1A7431',
        },
        warning: {
          50: '#FFF8E6',
          100: '#FFEDB8',
          500: '#FFC107', // Base warning color
          600: '#E6AC00',
          700: '#CC9900',
        },
        error: {
          50: '#FDEDED',
          100: '#F9CFCF',
          500: '#DC3545', // Base error color
          600: '#C42B3A',
          700: '#AB2532',
        },
        info: {
          50: '#E6F3F7',
          100: '#B8E0E9',
          500: '#17A2B8', // Base info color
          600: '#138A9C',
          700: '#0F7285',
        }
      },
      // Theme-specific background colors
      backgroundColor: {
        light: {
          DEFAULT: '#FFFFFF',
          surface: '#F8F9FA',
          'surface-alt': '#FFFFFF',
        },
        dark: {
          DEFAULT: '#121212',
          surface: '#1E1E1E',
          'surface-alt': '#2D2D2D',
        }
      },
      // Theme-specific text colors
      textColor: {
        light: {
          primary: '#212529',
          secondary: '#495057',
          tertiary: '#6C757D',
        },
        dark: {
          primary: '#E9ECEF',
          secondary: '#CED4DA',
          tertiary: '#ADB5BD',
        }
      },
      // Border colors
      borderColor: {
        light: '#DEE2E6',
        dark: '#343A40',
      },
      // Custom spacing
      spacing: {
        'layout': '1.5rem',
        'layout-lg': '2rem',
      },
      // Custom border radius
      borderRadius: {
        'layout': '0.5rem',
      },
      // Shadows
      boxShadow: {
        'light': '0 2px 4px rgba(0,0,0,0.05)',
        'light-lg': '0 4px 6px rgba(0,0,0,0.07)',
        'dark': '0 2px 4px rgba(0,0,0,0.2)',
        'dark-lg': '0 4px 6px rgba(0,0,0,0.3)',
      },
      // Transitions
      transitionProperty: {
        'theme': 'background-color, border-color, color, fill, stroke',
      },
      // Animation durations
      transitionDuration: {
        'theme': '200ms',
      },
    },
  },
  plugins: [
    // Plugin to handle dark mode variants
    function({ addVariant }) {
      addVariant('dark-hover', '.dark &:hover');
      addVariant('light-hover', ':hover:not(.dark &)');
    },
  ],
}
