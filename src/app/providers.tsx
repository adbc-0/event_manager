"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { Toaster } from "sonner";

import { QUERY_STALE_TIME } from "~/constants";
import { ReactProps } from "~/typescript";

type QueryClientOption = ConstructorParameters<typeof QueryClient>[0];

const queryOptions: QueryClientOption = {
    defaultOptions: {
        queries: {
            staleTime: QUERY_STALE_TIME, // set above 0 to avoid refetching immediately on the client (SSR)
        },
    },
};

export default function Providers({ children }: ReactProps) {
    const [queryClient] = useState(() => new QueryClient(queryOptions));
    return (
        <QueryClientProvider client={queryClient}>
            <JotaiProvider>
                {children}
                <Toaster position="top-center" />
            </JotaiProvider>
        </QueryClientProvider>
    );
}
