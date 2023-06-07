import { twMerge } from "tailwind-merge";

type ButtonTheme = "DISCARD" | "SAVE" | "BASIC";
type ButtonProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> & {
    theme: ButtonTheme;
    children: string;
};

const themeColors: Record<ButtonTheme, string> = {
    BASIC: "",
    DISCARD:
        "bg-red-400 hover:bg-red-400/90 disabled:opacity-50 disabled:cursor-not-allowed text-black border border-black",
    SAVE: "bg-green-400 hover:bg-green-400/90 disabled:opacity-50 disabled:cursor-not-allowed text-black border border-black",
} as const;

const baseButtonStyle = "py-2 rounded-md shadow-md";

export function Button({ children, theme, className, ...props }: ButtonProps) {
    return (
        <button
            {...props}
            className={twMerge(baseButtonStyle, themeColors[theme], className)}
        >
            {children}
        </button>
    );
}
