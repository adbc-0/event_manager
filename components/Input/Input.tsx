import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

type InputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;
type Ref = HTMLInputElement;

const baseInputStyle =
    "bg-input block rounded-md focus:outline-none focus:ring focus:ring-accent";

export const Input = forwardRef<Ref, InputProps>(function Input(
    { className, ...props },
    ref,
) {
    if (typeof ref === "function") {
        throw new Error("Unexpected ref type");
    }
    return <input {...props} className={twMerge(baseInputStyle, className)} />;
});
