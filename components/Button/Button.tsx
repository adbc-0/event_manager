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
    BASIC: "bg-primary-lighter text-white border border-primary-border outline-accent",
    DISCARD:
        "bg-danger text-danger-text border border-primary-border outline-danger",
    SAVE: "bg-accent text-accent-text border border-primary-border outline-accent",
} as const;

const baseButtonStyle =
    "rounded-md shadow-md hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed active:brightness-90 active:outline active:outline-offset-3";

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
