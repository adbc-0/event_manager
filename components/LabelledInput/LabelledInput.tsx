import { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

import { Input } from "../Input/Input";

type InputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
> & { label: string; inputClass: string };
type Ref = HTMLInputElement;

// ToDo: @unused
export const LabelledInput = forwardRef<Ref, InputProps>(function LabelledInput(
    { className, inputClass, label, ...props },
    ref,
) {
    if (typeof ref === "function") {
        throw new Error("Unexpected ref type");
    }

    return (
        <div className={twMerge("relative", className)}>
            <Input
                {...props}
                ref={ref}
                id={label}
                className={twMerge("w-full peer", inputClass)}
                placeholder=" "
            />
            <label
                htmlFor={label}
                className="absolute text-sm text-gray-300 duration-300 transform -translate-y-7 scale-75 top-2 origin-[0] px-2 peer-focus:px-2 peer-focus:text-cyan-200 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-7 left-0"
            >
                {label}
            </label>
        </div>
    );
});
