"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

type GlobalError = {
    error: unknown;
};

export default function GlobalError({ error }: GlobalError) {
    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    return (
        <html lang="en">
            <body>
                <h1 className="text-center">
                    Unexpected error was in layout component
                </h1>
            </body>
        </html>
    );
}
