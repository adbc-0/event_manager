import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;
type Ref = HTMLInputElement;

const baseInputStyle =
    "border border-neutral-900 focus:outline-cyan-200 block rounded-md bg-zinc-900 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40";

export const Input = forwardRef<Ref, InputProps>(
    function Input(
        { children, className, ...props },
        ref,
    ) {
        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        return (
            <input {...props} className={twMerge(baseInputStyle, className)} />
        );
    },
);
