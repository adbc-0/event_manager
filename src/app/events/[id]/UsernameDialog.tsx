import { FormEvent, forwardRef, useRef } from "react";

import { useEvent } from "~/context/EventProvider";
import { useSsc } from "~/hooks/use-ssc";
import { useAuth } from "~/hooks/use-auth";
import { Button } from "~/components/Button/Button";
import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "../../../../typescript";

type UsernameDialogProps = ReactProps;
type Ref = HTMLDialogElement;
type UsernameFormElementTarget = FormEvent<HTMLFormElement>["target"] & {
    username: { value: string };
};

export const UsernameDialog = forwardRef<Ref, UsernameDialogProps>(
    function UsernameDialog(_, ref) {
        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        const { isBrowser } = useSsc();
        const { eventDispatch } = useEvent();
        const { username, setUsername } = useAuth();

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

            setUsername(newUsername);
            eventDispatch({ type: "RESET_CHOICES" });
        };

        return (
            <dialog
                ref={ref}
                className="p-0 rounded-md"
                open={!username && isBrowser}
            >
                <GlassmorphicPane
                    outerClassName="max-w-sm"
                    innerClassName="py-6 px-4"
                >
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
                        <p className="text-sm text-orange-400">
                            warning: using someone elses identifier will make
                            you an sus impostor
                        </p>
                        <input
                            ref={nameInputRef}
                            type="text"
                            className="text-center border border-black my-6 py-2 block m-auto rounded-md bg-zinc-900 autofill:bg-zinc-950 bg-clip-padding backdrop-filter backdrop-blur-3xl bg-opacity-40"
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
                </GlassmorphicPane>
            </dialog>
        );
    },
);
