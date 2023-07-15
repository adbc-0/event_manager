import { FormEvent, forwardRef, useRef } from "react";
import Image from "next/image";

import okIcon from "~/public/acceptButton.svg";
import cancelIcon from "~/public/rejectButton.svg";

import { useAnonAuth } from "~/hooks/use-anon-auth";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { ReactProps } from "~/typescript";

type Ref = HTMLDialogElement;
type UsernameDialogProps = ReactProps;
type UsernameFormElementTarget = FormEvent<HTMLFormElement>["target"] & {
    username: { value: string };
};

export const Anon = forwardRef<Ref, UsernameDialogProps>(function Anon(_, ref) {
    if (typeof ref === "function") {
        throw new Error("Unexpected ref type");
    }

    const { username, setUsername } = useAnonAuth();

    const nameInputRef = useRef<HTMLInputElement>(null);
    const usernameFormRef = useRef<HTMLFormElement>(null);

    const closeIdentityModal = () => {
        if (!usernameFormRef.current) {
            throw new Error("Ref not found");
        }
        if (!ref?.current) {
            throw new Error("Ref not found");
        }

        usernameFormRef.current.reset();
        ref.current.close();
    };

    const saveUserName = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!usernameFormRef.current) {
            throw new Error("Ref not found");
        }
        if (!ref?.current) {
            throw new Error("Ref not found");
        }

        const newUsername = (e.target as UsernameFormElementTarget)["username"]
            .value as string;
        if (!newUsername) {
            return;
        }

        setUsername(newUsername);
    };

    return (
        <form
            ref={usernameFormRef}
            className="text-center"
            method="dialog"
            onSubmit={saveUserName}
        >
            <h2 className="text-xl mb-2">Insert identifier</h2>
            <p className="text-sm">
                choices you make will be linked to this identifier
            </p>
            <Input
                ref={nameInputRef}
                placeholder="username"
                type="text"
                className="text-center my-6 py-2 mx-auto"
                name="username"
                autoComplete="username"
                autoCorrect="off"
                aria-label="username input field"
                defaultValue={username}
                required
                maxLength={20}
                onFocus={(e) => e.target.select()}
            />
            <div className="flex justify-evenly">
                <Button
                    aria-label="Close dialog"
                    theme="BASIC"
                    className="flex-1 mx-2 py-2"
                    type="button"
                    onClick={closeIdentityModal}
                >
                    <Image
                        src={cancelIcon}
                        className="m-auto"
                        width={24}
                        height={24}
                        alt="cancel icon"
                    />
                </Button>
                <Button
                    aria-label="Submit changes"
                    theme="SAVE"
                    className="flex-1 mx-2 py-2"
                    type="submit"
                >
                    <Image
                        src={okIcon}
                        className="m-auto"
                        width={24}
                        height={24}
                        alt="accept icon"
                    />
                </Button>
            </div>
        </form>
    );
});
