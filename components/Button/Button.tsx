import { twMerge } from "tailwind-merge";

import { ReactProps } from "../../typescript";

type ButtonTheme = "DISCARD" | "SAVE" | "BASIC";
type ButtonProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> &
    ReactProps & {
        theme: ButtonTheme;
    };

const themeColors: Record<ButtonTheme, string> = {
    BASIC: "bg-neutral-700 text-white border border-black",
    DISCARD: "bg-red-400 text-black border border-black",
    SAVE: "bg-green-400 text-black border border-black",
} as const;

const baseButtonStyle =
    "rounded-md shadow-md transform hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:brightness-90";

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
