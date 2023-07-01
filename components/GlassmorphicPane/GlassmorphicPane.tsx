import { twMerge } from "tailwind-merge";

import { ReactProps } from "~/typescript";

type GlassmorphicPaneProps = ReactProps & {
    innerClassName?: string;
    outerClassName?: string;
};

const outerBorderStyle =
    "rounded-md bg-clip-border border border-zinc-900 bg-gray-500 backdrop-filter backdrop-blur-3xl bg-opacity-10";
const innerBorderStyle = "rounded-md bg-clip-border border border-white/25";

export function GlassmorphicPane({
    children,
    innerClassName,
    outerClassName,
}: GlassmorphicPaneProps) {
    return (
        <div className={twMerge(outerBorderStyle, outerClassName)}>
            <div className={twMerge(innerBorderStyle, innerClassName)}>
                {children}
            </div>
        </div>
    );
}
