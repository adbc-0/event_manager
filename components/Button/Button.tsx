import { twMerge } from "tailwind-merge";

import { ReactProps } from "~/typescript";

type ButtonTheme = "DISCARD" | "SAVE" | "BASIC" | "FLAT";
type ButtonProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> &
    ReactProps & {
        variant: ButtonTheme;
    };

const variantStyles: Record<ButtonTheme, string> = {
    BASIC: "bg-raised text-white outline-accent",
    FLAT: "text-white outline-accent",
    DISCARD: "bg-destructive text-destructive-text outline-destructive",
    SAVE: "bg-accent text-accent-foreground outline-accent",
} as const;

const baseButtonStyle =
    "rounded-md hover:brightness-125 disabled:opacity-50 disabled:cursor-not-allowed active:brightness-90 active:outline active:outline-offset-3";

export function Button({
    children,
    variant,
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            className={twMerge(
                baseButtonStyle,
                variantStyles[variant],
                className,
            )}
        >
            {children}
        </button>
    );
}
