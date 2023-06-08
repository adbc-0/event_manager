import { useEffect, useState } from "react";

/**
 * @description Allow to check state of rehydration
 *
 * Conditionally rendering JSX based on window existance will lead to differences between client and server html output
 * const isDOM =
 *  typeof window !== "undefined" && Boolean(window.document) && Boolean(window.document.documentElement);
 *
 */
export function useSsc() {
    const [isRehydrated, setIsRehydrated] = useState(false);

    useEffect(() => {
        setIsRehydrated(true);
    }, []);

    return {
        isBrowser: isRehydrated,
        isServer: !isRehydrated,
    };
}
