import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import { Input } from "../Input/Input";

type InputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
> & { labelId: string; label: string };
type Ref = HTMLInputElement;

export const LabelledInput = forwardRef<Ref, InputProps>(function LabelledInput(
    { className, labelId, label, ...props },
    ref,
) {
    if (typeof ref === "function") {
        throw new Error("Unexpected ref type");
    }

    return (
        <div className="relative">
            <Input
                {...props}
                ref={ref}
                id={labelId}
                className={twMerge("w-full peer", className)}
                placeholder=" "
            />
            <label
                htmlFor={labelId}
                className="absolute text-sm text-gray-300 duration-300 transform -translate-y-7 scale-75 top-2 origin-[0] px-2 peer-focus:px-2 peer-focus:text-cyan-200 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-7 left-0"
            >
                {label}
            </label>
        </div>
    );
});
