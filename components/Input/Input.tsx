import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;
type Ref = HTMLInputElement;

const baseInputStyle =
    "block border border-neutral-900 rounded-md bg-zinc-900 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40 border-2 focus:border-teal-400 focus:outline-none focus:ring-0";

export const Input = forwardRef<Ref, InputProps>(function Input(
    { className, ...props },
    ref,
) {
    if (typeof ref === "function") {
        throw new Error("Unexpected ref type");
    }

    return <input {...props} className={twMerge(baseInputStyle, className)} />;
});
