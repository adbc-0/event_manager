import { twMerge } from "tailwind-merge";

type InputProps = React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
>;

const baseInputStyle =
    "border border-neutral-900 focus:outline-cyan-200 block rounded-md bg-zinc-900 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40";

export function Input({ children, className, ...props }: InputProps) {
    return <input {...props} className={twMerge(baseInputStyle, className)} />;
}
