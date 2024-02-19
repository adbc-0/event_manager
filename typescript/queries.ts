export type QueryContext = {
    queryKey: string[];
    signal: AbortSignal;
    meta: Record<string, unknown> | undefined;
};
