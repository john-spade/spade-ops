/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                gold: {
                    400: '#e0b878',
                    500: '#d0a868',
                    600: '#b08d55',
                },
                dark: {
                    700: '#1A2222',
                    800: '#111818',
                    900: '#0A0F0A',
                    950: '#050805',
                }
            }
        },
    },
    plugins: [],
}
