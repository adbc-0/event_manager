import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;
type Ref = HTMLInputElement;

const baseInputStyle =
    "block rounded-md bg-primary border border-primary-darker focus:outline-none focus:ring focus:ring-secondary";

export const Input = forwardRef<Ref, InputProps>(function Input(
    { className, ...props },
    ref,
) {
    if (typeof ref === "function") {
        throw new Error("Unexpected ref type");
    }

    return <input {...props} className={twMerge(baseInputStyle, className)} />;
});
