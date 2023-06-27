import { twMerge } from "tailwind-merge";

import { ReactProps } from "~/typescript";

type ButtonTheme = "DISCARD" | "SAVE" | "BASIC";
type ButtonProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> &
    ReactProps & {
        theme: ButtonTheme;
    };

const themeColors: Record<ButtonTheme, string> = {
    BASIC: "bg-neutral-700 text-white border border-black outline-neutral-700",
    DISCARD: "bg-red-300 text-black border border-black outline-red-300",
    SAVE: "bg-emerald-300 text-black border border-black outline-emerald-300",
} as const;

const baseButtonStyle =
    "rounded-md shadow-md transform hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:brightness-90 active:outline active:outline-offset-3";

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
