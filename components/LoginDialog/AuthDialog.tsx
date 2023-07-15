import { forwardRef, useState } from "react";
import { match } from "ts-pattern";

import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { Login } from "./Login";
import { SignIn } from "./Sign";
import { Anon } from "./Anon";
import { ReactProps } from "~/typescript";

type UsernameDialogProps = ReactProps;
type Ref = HTMLDialogElement;
type Tab = "LOGIN" | "SIGN_IN" | "ANONYMOUS";

export const AuthDialog = forwardRef<Ref, UsernameDialogProps>(
    function AuthDialog(_, ref) {
        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        const [tab, setTab] = useState<Tab>("ANONYMOUS");

        return (
            <dialog
                ref={ref}
                className="p-0 w-full rounded-md open:animate-fade-in"
            >
                <GlassmorphicPane
                    outerClassName="max-w-sm m-auto"
                    innerClassName="py-6 px-4"
                >
                    <div role="tablist" className="flex mb-5 border-collapse">
                        <button
                            aria-selected={tab === "ANONYMOUS"}
                            role="tab"
                            className="grow py-1 px-2 border border-r-0 bg-neutral-700 border-zinc-900 aria-selected:bg-zinc-900 rounded-l-md"
                            onClick={() => setTab("ANONYMOUS")}
                        >
                            Anon
                        </button>
                        <button
                            aria-selected={tab === "SIGN_IN"}
                            role="tab"
                            className="grow py-1 px-2 border border-r-0 bg-neutral-700 border-zinc-900 aria-selected:bg-zinc-900"
                            onClick={() => setTab("SIGN_IN")}
                        >
                            Sign
                        </button>
                        <button
                            aria-selected={tab === "LOGIN"}
                            role="tab"
                            className="grow py-1 px-2 border bg-neutral-700 border-zinc-900 aria-selected:bg-zinc-900 rounded-r-md"
                            onClick={() => setTab("LOGIN")}
                        >
                            Log in
                        </button>
                    </div>
                    <div role="tabpanel">
                        {match(tab)
                            .with("ANONYMOUS", () => <Anon ref={ref} />)
                            .with("LOGIN", () => <Login ref={ref} />)
                            .with("SIGN_IN", () => <SignIn ref={ref} />)
                            .exhaustive()}
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
