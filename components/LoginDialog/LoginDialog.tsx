import { forwardRef, useState } from "react";
import { match } from "ts-pattern";

import { GlassmorphicPane } from "~/components/GlassmorphicPane/GlassmorphicPane";
import { Login } from "./Login";
import { Sign } from "./Sign";
import { Anon } from "./Anon";
import { ReactProps } from "~/typescript";

type UsernameDialogProps = ReactProps;
type Ref = HTMLDialogElement;
type Tab = "LOGIN" | "SIGN_IN" | "ANONYMOUS";

export const LoginDialog = forwardRef<Ref, UsernameDialogProps>(
    function UsernameDialog(_, ref) {
        if (typeof ref === "function") {
            throw new Error("Unexpected ref type");
        }

        const [tab, setTab] = useState<Tab>("ANONYMOUS");

        return (
            <dialog ref={ref} className="p-0 rounded-md open:animate-fade-in">
                <GlassmorphicPane
                    outerClassName="max-w-sm"
                    innerClassName="py-6 px-4"
                >
                    <div role="tablist" className="flex mb-5 border-collapse">
                        <button
                            aria-selected={tab === "SIGN_IN"}
                            role="tab"
                            className="grow py-1 px-2 border border-r-0 bg-neutral-700 border-zinc-900 aria-selected:bg-zinc-900 rounded-l-md"
                            onClick={() => setTab("SIGN_IN")}
                        >
                            Sign
                        </button>
                        <button
                            aria-selected={tab === "LOGIN"}
                            role="tab"
                            className="grow py-1 px-2 border border-r-0 bg-neutral-700 border-zinc-900 aria-selected:bg-zinc-900"
                            onClick={() => setTab("LOGIN")}
                        >
                            Login
                        </button>
                        <button
                            aria-selected={tab === "ANONYMOUS"}
                            role="tab"
                            className="grow py-1 px-2 border bg-neutral-700 border-zinc-900 aria-selected:bg-zinc-900 rounded-r-md"
                            onClick={() => setTab("ANONYMOUS")}
                        >
                            Anon
                        </button>
                    </div>
                    <div role="tabpanel">
                        {match(tab)
                            .with("LOGIN", () => <Login ref={ref} />)
                            .with("SIGN_IN", () => <Sign ref={ref} />)
                            .with("ANONYMOUS", () => <Anon ref={ref} />)
                            .exhaustive()}
                    </div>
                </GlassmorphicPane>
            </dialog>
        );
    },
);
