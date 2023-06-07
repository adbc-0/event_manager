import { ReactProps } from "../../typescript";

type GlassmorphicPaneProps = ReactProps;

export function GlassmorphicPane({ children }: GlassmorphicPaneProps) {
    return (
        <div className="rounded-md bg-clip-border border border-black bg-gray-100 backdrop-filter backdrop-blur-3xl bg-opacity-10">
            <div className="rounded-md bg-clip-border border border-white/25">
                {children}
            </div>
        </div>
    );
}
