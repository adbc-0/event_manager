import { FormEvent, forwardRef, useRef } from "react";

import { useEvent } from "../../../../lib/context/EventProvider";
import { useAuth } from "~/hooks/use-auth";
import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "../../../../typescript";

type UsernameDialogProps = ReactProps;
type Ref = HTMLDialogElement;

export const UsernameDialog = forwardRef<Ref, UsernameDialogProps>(
    function UsernameDialog(_, ref) {
        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        const { eventDispatch } = useEvent();
        const { username, setUsername } = useAuth();

        const nameInputRef = useRef<HTMLInputElement>(null);
        const usernameFormRef = useRef<HTMLFormElement>(null);

        const closeIdentityModal = () => {
            if (!usernameFormRef.current) {
                throw new Error("Ref not fonnd");
            }
            if (!ref?.current) {
                throw new Error("Ref not fonnd");
            }

            usernameFormRef.current.reset();
            ref.current.close();
        };

        const saveUserName = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();

            if (!usernameFormRef.current) {
                throw new Error("Ref not fonnd");
            }
            if (!ref?.current) {
                throw new Error("Ref not fonnd");
            }

            const usernameInputVal = nameInputRef.current?.value;
            if (!usernameInputVal) {
                return;
            }

            setUsername(usernameInputVal);
            eventDispatch({ type: "RESET_CHOICES" });

            ref.current.close();
        };

        return (
            <dialog ref={ref} className="p-0 rounded-md">
                <GlassmorphicPane>
                    <div className="py-6 px-4 max-w-sm">
                        <form
                            ref={usernameFormRef}
                            className="text-center"
                            method="dialog"
                            onSubmit={saveUserName}
                        >
                            <h2 className="text-xl mb-2">Insert identifier</h2>
                            <p className="text-sm">
                                choices you make will be linked to this
                                identifier
                            </p>
                            <p className="text-sm">
                                using someone elses identifier will make you an
                                sus impostor
                            </p>
                            <input
                                ref={nameInputRef}
                                type="text"
                                className="text-center border border-black my-6 py-2 block m-auto rounded-md bg-zinc-900 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40"
                                name="username"
                                autoComplete="username"
                                autoCorrect="off"
                                aria-label="username input field"
                                defaultValue={username}
                                required
                                maxLength={20}
                                onFocus={(e) => e.target.select()}
                                autoFocus
                            />
                            <div className="flex justify-evenly">
                                <Button
                                    theme="DISCARD"
                                    className="flex-auto mx-2 py-2"
                                    type="button"
                                    disabled={!username}
                                    onClick={closeIdentityModal}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    theme="SAVE"
                                    className="flex-auto mx-2 py-2"
                                    type="submit"
                                >
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
