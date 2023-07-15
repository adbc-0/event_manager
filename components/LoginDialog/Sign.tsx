import { FormEvent, forwardRef, useRef } from "react";
import Image from "next/image";

import okIcon from "~/public/acceptButton.svg";
import cancelIcon from "~/public/rejectButton.svg";

import { Button } from "../Button/Button";
import { LabelledInput } from "../LabelledInput/LabelledInput";
import { ReactProps } from "~/typescript";

type Ref = HTMLDialogElement;
type UsernameDialogProps = ReactProps;
type UsernameFormElementTarget = FormEvent<HTMLFormElement>["target"] & {
    username: { value: string };
};

export const SignIn = forwardRef<Ref, UsernameDialogProps>(
    function SignIn(_, ref) {
        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

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
            if (!usernameFormRef.current) {
                throw new Error("Ref not found");
            }
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            const newUsername = (e.target as UsernameFormElementTarget)[
                "username"
            ].value as string;
            if (!newUsername) {
                return;
            }
        };

        return (
            <form
                ref={usernameFormRef}
                className="text-center"
                method="dialog"
                onSubmit={saveUserName}
            >
                <h2 className="text-xl mb-2">Create account</h2>
                <p className="text-sm">
                    When you create account you will be able to create your own
                    calendars and track choices you have made in the past.
                </p>
                <LabelledInput
                    ref={nameInputRef}
                    label="email"
                    type="email"
                    className="text-center my-6 py-2 mx-auto"
                    name="email"
                    autoComplete="email"
                    autoCorrect="off"
                    required
                    maxLength={20}
                />
                <LabelledInput
                    ref={nameInputRef}
                    label="password"
                    type="password"
                    className="text-center my-6 py-2 mx-auto"
                    name="password"
                    autoComplete="password"
                    autoCorrect="off"
                    required
                    maxLength={20}
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
    },
);
