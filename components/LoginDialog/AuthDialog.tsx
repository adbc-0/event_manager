import { forwardRef } from "react";
import Image from "next/image";

import cancelIcon from "~/public/rejectButton.svg";

import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { ReactProps } from "~/typescript";
import { Button } from "../Button/Button";
import { useAnonAuth } from "~/hooks/use-anon-auth";

type UsernameDialogProps = ReactProps;
type Ref = HTMLDialogElement;

// ToDo: Dynamically fetch users

export const AuthDialog = forwardRef<Ref, UsernameDialogProps>(
    function AuthDialog(_, ref) {
        const { setUsername } = useAnonAuth();

        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        const closeIdentityModal = () => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            ref.current.close();
        };

        const selectUser = (username: string) => {
            if (!ref?.current) {
                throw new Error("Ref not found");
            }

            setUsername(username);
            ref.current.close();
        };

        return (
            <dialog
                ref={ref}
                className="p-0 w-full rounded-md open:animate-fade-in"
            >
                <GlassmorphicPane
                    outerClassName="max-w-sm m-auto"
                    innerClassName="py-6 px-4"
                >
                    <h2 className="text-xl mb-2 text-center">Select user</h2>
                    <Button
                        theme="BASIC"
                        type="button"
                        onClick={() => selectUser("Maciek")}
                    >
                        Maciek
                    </Button>
                    <Button
                        theme="BASIC"
                        type="button"
                        onClick={() => selectUser("Jasiu")}
                    >
                        Jasiu
                    </Button>
                    <Button
                        theme="BASIC"
                        type="button"
                        onClick={() => selectUser("Adrian")}
                    >
                        Adrian
                    </Button>
                    <Button
                        theme="BASIC"
                        type="button"
                        onClick={() => selectUser("Krzysiu")}
                    >
                        Krzysiu
                    </Button>
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
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
