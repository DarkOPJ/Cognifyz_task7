/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./views/**/*.ejs", "./public/**/*.js"],
  theme: {
    extend: {
      screens: {
        sm: "640px",
        md: "768px",
        lg: "982px",
        xl: "982px",
        "2xl": "982px",
      },
      container: {
        center: true,   // Automatically center containers
        padding: {
          DEFAULT: '10px',
        },
      },
      colors: {
        myblack: "#1c1c1c",
        mygray: "#777777",
        mylightgray: "#e4e4e4",
        myred: "#b30000",
      }, 
      fontSize: {
        fontSizeBase: "1rem",
        fontSizeMd: "clamp(1.25rem, 0.61vw + 1.1rem, 1.58rem)",
        fontSizeLg: "clamp(1.56rem, 1vw + 1.31rem, 2.11rem)",
        fontSizeXl: "clamp(2.44rem, 2.38vw + 1.85rem, 3.75rem)",
        fontSizeUl: "clamp(1.13rem, 1.08rem + 0.22vw, 1.25rem)",
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
      },
      borderRadius: {
        radius: "10px"
      },
      dropShadow: {
        'shadow': '0px 44px 34px rgba(0, 0, 0, 0.25)',
      },
      gridTemplateColumns: {
        '40/60' : "38% 60%"
      }
    },
  },
  plugins: [],
}