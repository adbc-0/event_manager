"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { Button } from "~/components/Button/Button";

type ErrorProps = {
    error: Error & { digest?: string };
    reset: () => void;
};

function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <div className="min-h-full-dvh flex text-center justify-center flex-col gap-2">
            <h1>Uncaught exception</h1>
            <Button
                theme="BASIC"
                className="w-fit mx-auto p-2"
                onClick={() => reset()}
            >
                Reload page
            </Button>
        </div>
    );
}

export default Error;
