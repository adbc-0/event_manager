import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;
type Ref = HTMLInputElement;

const baseInputStyle =
    "block rounded-md bg-primary border-2 border-primary-darker focus:border-secondary focus:outline-none focus:ring-0";

export const Input = forwardRef<Ref, InputProps>(function Input(
    { className, ...props },
    ref,
) {
    if (typeof ref === "function") {
        throw new Error("Unexpected ref type");
    }

    return <input {...props} className={twMerge(baseInputStyle, className)} />;
});
