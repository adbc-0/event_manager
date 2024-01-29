import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { Button } from "./Button";
import { ReactProps } from "~/typescript";

type LoadingButtonTheme = "DISCARD" | "SAVE" | "BASIC";
type LoadingButtonProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> &
    ReactProps & {
        theme: LoadingButtonTheme;
        isLoading: boolean;
    };

export function LoadingButton({
    children,
    isLoading,
    ...props
}: LoadingButtonProps) {
    return isLoading ? (
        <Button {...props}>
            <LoadingSpinner className="text-black m-auto" />
        </Button>
    ) : (
        <Button {...props}>{children}</Button>
    );
}
