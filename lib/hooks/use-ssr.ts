export function useSsr() {
    const isDOM =
        typeof window !== "undefined" &&
        Boolean(window.document) &&
        Boolean(window.document.documentElement);

    return {
        isBrowser: isDOM,
        isServer: !isDOM,
    };
}
