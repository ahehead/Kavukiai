import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/renderer/**/*.{html,js,jsx,ts,tsx}",
    "./src/nodes/**/*.{html,js,jsx,ts,tsx}",
  ],
} satisfies Config;
