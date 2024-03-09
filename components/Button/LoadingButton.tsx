import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner";
import { Button } from "./Button";

import { ReactProps } from "~/typescript";

// ToDo: Unify with Button variant
type LoadingButtonVariant = "DISCARD" | "SAVE" | "BASIC" | "FLAT";
type LoadingButtonProps = React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
> &
    ReactProps & {
        variant: LoadingButtonVariant;
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
