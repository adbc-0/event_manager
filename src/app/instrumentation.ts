import * as Sentry from "@sentry/nextjs";

export function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        Sentry.init({
            dsn: "https://ae8b0ace3bfc9f6ffa94e012d99b7e18@o4506500698275840.ingest.sentry.io/4506500702339072",

            // Adjust this value in production, or use tracesSampler for greater control
            tracesSampleRate: 1,

            // Setting this option to true will print useful information to the console while you're setting up Sentry.
            debug: false,
            enabled: process.env.NODE_ENV === "production",
        });
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        Sentry.init({
            dsn: "https://ae8b0ace3bfc9f6ffa94e012d99b7e18@o4506500698275840.ingest.sentry.io/4506500702339072",

            // Adjust this value in production, or use tracesSampler for greater control
            tracesSampleRate: 1,

            // Setting this option to true will print useful information to the console while you're setting up Sentry.
            debug: false,
            enabled: process.env.NODE_ENV === "production",
        });
    }
}
