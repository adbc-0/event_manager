"use client";

import * as Sentry from "@sentry/nextjs";
import Error from "next/error";
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
                <Error statusCode={500} />
            </body>
        </html>
    );
}
