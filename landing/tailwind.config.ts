import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          500: "#4f46e5",
          600: "#4338ca",
          700: "#3730a3",
        },
      },
    },
  },
  plugins: [typography],
};
export default config;
