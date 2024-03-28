import type { Config } from "tailwindcss";

const config = {
    darkMode: ["class"],
    content: [
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    prefix: "",
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                "border-edge": "hsl(var(--foreground) / 0.07)",
                border: "hsl(var(--border))",
                raised: "hsl(var(--raised))",
                input: "hsl(var(--input))",
                "red-1": "hsl(var(--red-1))",
                "green-1": "hsl(var(--green-1))",
                "orange-1": "hsl(var(--orange-1))",
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    background: "hsl(var(--destructive-background))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                success: {
                    DEFAULT: "hsl(var(--success))",
                    background: "hsl(var(--success-background))",
                    foreground: "hsl(var(--success-foreground))",
                },
                warning: {
                    DEFAULT: "hsl(var(--warning))",
                    background: "hsl(var(--warning-background))",
                    foreground: "hsl(var(--warning-foreground))",
                },
                error: {
                    DEFAULT: "hsl(var(--error))",
                    background: "hsl(var(--error-background))",
                    foreground: "hsl(var(--error-foreground))",
                },
                headerbar: {
                    background: "hsl(var(--headerbar-background))",
                    foreground: "hsl(var(--headerbar-foreground))",
                    border: "hsl(var(--headerbar-border))",
                    backdrop: "hsl(var(--headerbar-backdrop))",
                    shade: "hsl(var(--headerbar-shade))",
                    "darker-shade": "hsl(var(--headerbar-darker-shade))",
                },
                sidebar: {
                    DEFAULT: "hsl(var(--accent))",
                    background: "hsl(var(--primary-background))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                card: {
                    background: "hsl(var(--card-background))",
                    foreground: "hsl(var(--card-foreground))",
                    lowered: "hsl(var(--card-lowered))",
                    shade: "hsl(var(--card-shade))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    background: "hsl(var(--popover-background))",
                    shade: "hsl(var(--popover-shade))",
                },
            },
            width: {
                128: "32rem",
            },
            keyframes: {
                "fade-in": {
                    "0%": { scale: "0" },
                    "100%": { scale: "1" },
                },
            },
            animation: {
                "fade-in": "fade-in 0.2s ease-in-out",
            },
        },
    },
} satisfies Config;

export default config;
