import { ReactProps } from "../../typescript";

type MacBorderProps = ReactProps;

export function MacBorder({ children }: MacBorderProps) {
    return (
        <div className="rounded-md bg-clip-padding border border-black">
            <div className="rounded-md border border-white/25">{children}</div>
        </div>
    );
}
